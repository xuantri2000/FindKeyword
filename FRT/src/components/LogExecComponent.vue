<script setup>
import { ref, onMounted, watch } from "vue";
import $toast from '@/utils/VueToast';
import axios from 'axios';

// Danh sách file từ API
const files = ref([]); // Chứa danh sách file từ API
const selectedFiles = ref(new Set()); // Chứa danh sách file đã chọn
const checkAll = ref(false); // Trạng thái của checkbox "Chọn tất cả"
const failedFiles = ref([]); // Chứa danh sách file từ API

const fetchLogs = async () => {
	try {
		const response = await axios.get("/api/logs/");
		files.value = response.data.newJsonFiles;
	} catch (error) {
		console.error("Lỗi khi fetch API:", error);
	}
};

const fetchFailedLogs = async () => {
	try {
		const response = await axios.get("/api/logs/errors");
		failedFiles.value = response.data.failedJsonFiles;
	} catch (error) {
		console.error("Lỗi khi fetch API:", error);
	}
};

// Theo dõi thay đổi của checkAll để cập nhật selectedFiles
watch(checkAll, (newValue) => {
	selectedFiles.value = newValue ? new Set(files.value) : new Set();
});

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

	console.log("Đang xử lý các file:", Array.from(selectedFiles.value));

	// 🚀 TODO: Gửi danh sách file đã chọn lên backend để xử lý
	axios.post("/api/records/insert", Array.from(selectedFiles.value))
		.then((response) => {
			// Hiển thị thông báo thành công
			$toast.success(response.data.message);

			// Nếu có lỗi nào đó được backend trả về, cũng hiển thị lỗi
			if (response.data.errors && response.data.errors.length > 0) {
				$toast.error(response.data.errors.join("<br>"));
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

			fetchLogs();
			fetchFailedLogs();
		});;
};

onMounted(async () => {
    await Promise.all([fetchLogs(), fetchFailedLogs()]);
});
</script>

<template>
	<h5 class="sub-title">Log chưa xử lý</h5>
	<div class="file-list">
		<!-- Nút Chọn Tất Cả -->
		<div class="check-all">
			<input type="checkbox" v-model="checkAll" id="checkAll" />
			<label for="checkAll">📂 Chọn tất cả</label>
		</div>

		<ul class="directory-structure">
			<li v-for="file in files" :key="file" class="file-item">
				<label>
					<input type="checkbox" :checked="selectedFiles.has(file)"
						@change="toggleFileSelection(file)" />
					<span class="file-icon ps-2">📄</span> {{ file }}
				</label>
			</li>
		</ul>
	</div>
	<!-- Nút xử lý -->
	<button class="process-btn" @click="handleProcessFiles">Xử lý tệp tin</button>
	<hr>
	<!-- Hiển thị danh sách Log lỗi -->
	<h5 class="sub-title">Log lỗi</h5>
	<div class="error-log-table">
		<table class="table table-striped ">
			<thead>
				<tr>
					<th>#</th>
					<th>Tên File</th>
					<th>Thời gian</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(file, index) in failedFiles" :key="file">
					<td>{{ index + 1 }}</td>
					<td>{{ file.filename }}</td>
					<td>{{ file.created_at }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
<style scoped>
/* Layout tổng thể */
.error-log-table{
	overflow-y: auto;
	max-height: 30vh;
}

.file-list {
	overflow-y: auto;
	max-height: 50vh;
	margin-top: 10px;
	background: #f8f9fa;
	padding: 15px;
	border-radius: 8px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
}

/* Hiển thị cấu trúc thư mục */
.directory-structure {
	list-style: none;
	padding-left: 10px;
}

.directory-structure label {
	cursor: pointer;
}

/* Kiểu file item */
.file-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	border-radius: 5px;
	transition: background 0.2s;
	cursor: pointer;
}

.file-item:hover {
	background: rgba(0, 123, 255, 0.1);
}

/* Biểu tượng file */
.file-icon {
	font-size: 1.2em;
}

/* Check All */
.check-all {
	display: flex;
	align-items: center;
	gap: 10px;
	font-weight: bold;
}

.check-all label {
	cursor: pointer;
}

/* Nút Xử lý */
.process-btn {
	margin-top: 10px;
	padding: 8px 15px;
	background-color: #28a745;
	color: white;
	border: none;
	cursor: pointer;
	border-radius: 5px;
	font-size: 14px;
	transition: background 0.2s;
}

.process-btn:hover {
	background-color: #218838;
}
</style>