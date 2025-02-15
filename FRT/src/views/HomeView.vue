<script setup>
import { ref, onMounted, watch } from "vue";
import $toast from '@/utils/VueToast';

// Danh sách file từ API
const files = ref([]); // Chứa danh sách file từ API
const selectedFiles = ref(new Set()); // Chứa danh sách file đã chọn
const checkAll = ref(false); // Trạng thái của checkbox "Chọn tất cả"

// Fetch dữ liệu từ API khi component mounted
const fetchLogs = async () => {
    try {
        const response = await fetch("/api/logs/");
        const data = await response.json();
        files.value = data.newJsonFiles;
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

    // Xóa file khỏi danh sách sau khi xử lý (tùy vào logic)
    files.value = files.value.filter(file => !selectedFiles.value.has(file));
    selectedFiles.value.clear();
    checkAll.value = false;
};

// Gọi fetch API khi component được tạo
onMounted(fetchLogs);
</script>

<template>
	<section id="homeview">
		<div class="row">
			<div class="col-md-7">
				<h5 class="sub-title">Tìm kiếm tài khoản lộ lọt</h5>
			</div>
			<div class="col-md-5">
				<h5 class="sub-title">Log chưa xử lý</h5>
				<div class="file-list">
					<!-- Nút Chọn Tất Cả -->
					<div class="check-all">
						<input type="checkbox" v-model="checkAll" id="checkAll" />
						<label for="checkAll">📂 Chọn tất cả</label>
					</div>

					<ul class="directory-structure">
						<li 
							v-for="file in files" 
							:key="file" 
							class="file-item"
						>
							<label>
								<input 
									type="checkbox" 
									:checked="selectedFiles.has(file)" 
									@change="toggleFileSelection(file)" 
								/>
								<span class="file-icon ps-2">📄</span> {{ file }}
							</label>
						</li>
					</ul>


					<!-- Nút xử lý -->
					<button class="process-btn" @click="handleProcessFiles">Xử lý</button>
				</div>
			</div>
		</div>
	</section>
</template>

<style scoped>
/* Layout tổng thể */
.file-list {
    margin-top: 10px;
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
}

/* Hiển thị cấu trúc thư mục */
.directory-structure {
    list-style: none;
    padding-left: 20px;
}

.directory-structure label{
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

.check-all label{
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
