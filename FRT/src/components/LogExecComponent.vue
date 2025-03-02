<script setup>
import { ref, onMounted, watch, onUpdated  } from "vue";
import $toast from '@/utils/VueToast';
import axios from 'axios';
import FileListSkeleton from "@/components/ui/FileListSkeleton.vue";

const emit = defineEmits(["process-complete"]);
// Danh sách file từ API
const files = ref([]); // Chứa danh sách file từ API
const selectedFiles = ref(new Set()); // Chứa danh sách file đã chọn
const checkAll = ref(false); // Trạng thái của checkbox "Chọn tất cả"
const failedFiles = ref([]); // Chứa danh sách file từ API
const isUserToggleCheckAll = ref(false);
const loadingLogs = ref(false);
const loadingFailedLogs = ref(false);

const fetchLogs = async () => {
	loadingLogs.value = true;
	try {
		const response = await axios.get("/api/logs/");
		files.value = response.data.newJsonFiles;
	} catch (error) {
		console.error("Lỗi khi fetch API:", error);
	}
	loadingLogs.value = false;
};

const fetchFailedLogs = async () => {
	loadingFailedLogs.value = true;
	try {
		const response = await axios.get("/api/logs/errors");
		failedFiles.value = response.data.failedJsonFiles;
	} catch (error) {
		console.error("Lỗi khi fetch API:", error);
	}
	loadingFailedLogs.value = false;
};

// Theo dõi thay đổi của checkAll để cập nhật selectedFiles
watch(checkAll, (newValue) => {
    if (isUserToggleCheckAll.value) {
        selectedFiles.value = newValue ? new Set(files.value) : new Set();
    }
    isUserToggleCheckAll.value = false;
});

// Thêm handler riêng cho nút checkAll
const handleCheckAll = (event) => {
    isUserToggleCheckAll.value = true;
    checkAll.value = event.target.checked;
};

// Chọn/bỏ chọn 1 file
const toggleFileSelection = (file) => {
	if (selectedFiles.value.has(file)) {
		selectedFiles.value.delete(file);
	} else {
		selectedFiles.value.add(file);
	}

	// Kiểm tra nếu tất cả file đều được chọn
	checkAll.value = selectedFiles.value.size === files.value.length;
};

// Xử lý file đã chọn
const handleProcessFiles = () => {
	if (selectedFiles.value.size === 0) {
		$toast.warning("Vui lòng chọn ít nhất một file!");
		return;
	}

	loadingLogs.value = true;
	// 🚀 TODO: Gửi danh sách file đã chọn lên backend để xử lý
	axios.post("/api/records/insert", Array.from(selectedFiles.value))
		.then((response) => {
			// Hiển thị thông báo thành công
			$toast.success(response.data.message);

			// Nếu có lỗi nào đó được backend trả về, cũng hiển thị lỗi
			if (response.data.errors && response.data.errors.length > 0) {
				$toast.error(response.data.errors.join("<br>"));
			}

			//Kiểm tra có records thì emit
			if(response.data.record > 0)
			{
				emit("process-complete");
			}
		})
		.catch((error) => {
			if (error.response) {
				if (error.response.status === 422) {
					// Nếu lỗi 422, nối các phần tử trong errors với `<br>`
					const errorMessages = error.response.data.errors.join("<br>");
					$toast.error(errorMessages);
				} else {
					// Nếu có lỗi khác, hiển thị thông báo chung
					$toast.error(error.response.data.error || "Không thể gửi file đến API!");
				}
			} else {
				// Nếu không có response từ server (ví dụ lỗi mạng)
				$toast.error("Lỗi kết nối đến API!");
			}
		}).finally(() => {
			selectedFiles.value.clear();
    		checkAll.value = false;
			loadingLogs.value = false;

			fetchLogs();
			fetchFailedLogs();
		});;
};

const refreshLogs = async () => {
    loadingLogs.value = true;
    loadingFailedLogs.value = true;
    await Promise.all([fetchLogs(), fetchFailedLogs()]);
    loadingLogs.value = false;
    loadingFailedLogs.value = false;
    // $toast.success("Đã tải lại danh sách logs!");
};

onMounted(async () => {
    await Promise.all([fetchLogs(), fetchFailedLogs()]);
});
</script>

<template>
	<div class="log-header">
		<h5 class="sub-title">Log chưa xử lý</h5>

		<!-- Nút Tải lại (chỉ có icon) -->
		<button class="reload-btn" @click="refreshLogs">
			🔄
		</button>
	</div>

	<FileListSkeleton v-if="loadingLogs"></FileListSkeleton>
	<div class="file-list" v-else>
		<!-- Nút Chọn Tất Cả -->
		<div class="check-all">
			<input type="checkbox" 
			:checked="checkAll" 
			@change="handleCheckAll" 
			id="checkAll" />
			<label for="checkAll">📂 Chọn tất cả</label>
		</div>

		<ul class="directory-structure">
			<li v-for="file in files" :key="file" class="file-item">
				<label>
					<input type="checkbox" :checked="selectedFiles.has(file)"
						@change="toggleFileSelection(file)" />
					<span class="file-icon">📄</span> {{ file }}
				</label>
			</li>
		</ul>
	</div>
	<!-- Nút xử lý -->
	<button class="process-btn" @click="handleProcessFiles">Xử lý tệp tin</button>
	<div v-if="failedFiles.length > 0">
		<hr>
		<!-- Hiển thị danh sách Log lỗi -->
		<h5 class="sub-title">Log lỗi</h5>
		<FileListSkeleton v-if="loadingFailedLogs"></FileListSkeleton>
		<div class="error-log-table" v-else>
			<table class="table table-striped ">
				<thead>
					<tr>
						<th>#</th>
						<th>Tên File</th>
						<!-- <th>Thời gian</th> -->
					</tr>
				</thead>
				<tbody>
					<tr v-for="(file, index) in failedFiles" :key="file">
						<td>{{ index + 1 }}</td>
						<td>{{ file.filename }} <br> <small><i>{{ file.created_at }}</i></small></td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
<style scoped>
.sub-title{
	margin-bottom: 0px;
}
.log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.reload-btn {
    background: transparent; /* Không có nền */
    color: white; /* Icon màu trắng */
    border: none; /* Không có viền */
    font-size: 18px; /* Tăng kích thước icon */
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    padding: 5px; /* Tạo khoảng cách click dễ hơn */
}

.reload-btn:hover {
    transform: rotate(90deg); /* Xoay nhẹ khi hover */
}


/* Layout tổng thể */
/* Tổng thể của danh sách file */
.file-list {
    overflow-y: auto;
    max-height: 50vh;
    margin-top: 10px;
    background: #ffffff;
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd;
}

/* Check All - Chọn tất cả */
.check-all {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    font-size: 14px;
    padding: 10px;
    border-bottom: 1px solid #ddd;
    cursor: pointer !important;
}

.check-all label {
	width: 100%;
    cursor: pointer !important;
}

.check-all input {
    width: 16px;
    height: 16px;
    accent-color: #28a745; /* Màu xanh lá giống nút xử lý */
}

/* Danh sách tệp */
.directory-structure {
    list-style: none;
    padding-left: 0;
    margin-bottom: 0px;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border-radius: 6px;
    transition: background 0.2s, transform 0.1s;
    font-size: 14px;
}

.file-item label {
    display: flex;
    align-items: center;
    gap: 5px;
    width: 100%;
    cursor: pointer;
}

/* Checkbox */
.file-item input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #28a745;
}

/* Hiệu ứng hover */
.file-item:hover {
    background: rgba(40, 167, 69, 0.1); /* Nhẹ nhàng xanh lá */
    transform: scale(1.02);
}

/* Biểu tượng file */
.file-icon i {
    font-size: 16px;
    color: #555;
    transition: color 0.2s;
}

/* Nút xử lý */
.process-btn {
    margin-top: 15px;
    padding: 10px 15px;
    background-color: #28a745;
    color: white;
    font-weight: bold;
    border: none;
    cursor: pointer;
    border-radius: 6px;
    font-size: 14px;
    transition: background 0.2s, transform 0.1s;
    display: flex;
    align-items: center;
    gap: 6px;
}

.process-btn:hover {
    background-color: #218838;
    transform: scale(1.05);
}

.error-log-table{
	margin-top: 10px;
}

</style>