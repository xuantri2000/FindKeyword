<script setup>
import { ref, computed, onMounted, watch, onUpdated } from "vue";
import axios from "axios";
import $toast from "@/utils/VueToast";
import LogExecComponent from "@/components/LogExecComponent.vue";
import SelectRowComponent from "@/components/SelectRowComponent.vue";
import TableSkeleton from "@/components/ui/TableSkeleton.vue";
import CustomPagination from "@/components/ui/CustomPagination.vue";
import feather from 'feather-icons';
import EditRecordModal from "@/components/modals/EditRecordModal.vue";


const records = ref([]);
const displayRecords = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = parseInt(import.meta.env.VITE_PER_PAGE);
const batchSize = parseInt(import.meta.env.VITE_BATCH_SIZE);
const totalRecords = ref(1);
const tableKey = ref(0);
const loadedBatches = ref(new Set());
const searchQuery = ref("");
const searchTimer = ref(null);
const sortField = ref("");
const sortOrder = ref(""); // "asc" or "desc"
const columnsForTable = ref([
	{ 
        label: '', 
        field: 'select-box', 
        sortable: false,
        thClass: 'select-box'
    },
	{ 
        label: '', 
        field: 'actions', 
        sortable: false,
        thClass: 'th-actions'
    },
	{ 
		label: 'Tài khoản', 
		field: 'username', 
		sortable: false,
		tdClass: 'cell-wrap',
		thClass: 'th-custom'
	},
	{ 
		label: 'Mật khẩu', 
		field: 'password', 
		sortable: false,
		tdClass: 'cell-wrap'
	},
	{ 
		label: 'URL Path', 
		field: 'url_path', 
		sortable: false,
		tdClass: 'cell-wrap url-path',
		thClass: 'th-custom'
	},
	{ 
		label: 'Ghi chú', 
		field: 'note', 
		sortable: false,
		tdClass: 'cell-wrap',
		thClass: 'th-custom'
	},
	{ 
		label: 'Thời gian', 
		field: 'run_time', 
		sortable: false,
		tdClass: 'cell-wrap run-time',
		thClass: 'th-custom'
	},
]); 
const isEditModalOpen = ref(false);
const selectedRecord = ref(null);
const selectedStatus = ref("");
const selectedTarget = ref("");
const selectedParentTarget = ref("");
const exporting = ref(false);
const now = new Date();
const pad = n => n.toString().padStart(2, '0');
const parentTargetList = ref([]);
const targetlist = ref([]);

// Fetch danh sách Target từ API
const fetchParentTargets = async () => {
    try {
        const response = await axios.get("/api/targets/countries");
        parentTargetList.value = response.data.sort((a, b) => a.target_name.localeCompare(b.target_name));
    } catch (error) {
        console.error("Lỗi khi fetch Target:", error);
    }
};

// Fetch danh sách Target từ API
const fetchTargets = async () => {
    try {
        const params = {};
        if (selectedParentTarget.value) {
            params.parent_id = selectedParentTarget.value;
        }

        const response = await axios.get("/api/targets/targets", { params });
        targetlist.value = response.data.sort((a, b) => a.target_name.localeCompare(b.target_name));
    } catch (error) {
        console.error("Lỗi khi fetch Target:", error);
    }
};

const fetchLogs = async (batch, query = "") => {
    if (loadedBatches.value.has(batch) && query === "" && !sortField.value && !selectedStatus.value) return true;

    loading.value = true;
    try {
        const response = await axios.get(`/api/records`, {
            params: {
                batch,
                limit: batchSize,
                query,
                sortField: sortField.value,
                sortOrder: sortOrder.value,
                status: selectedStatus.value, // Gửi trạng thái lọc đến server
				target: selectedTarget.value,
				parentId: selectedParentTarget.value
            }
        });

        if (response.data.data.length > 0) {
            const insertIndex = (batch - 1) * batchSize;
            if (insertIndex > records.value.length) {
                records.value.length = insertIndex;
            }
            records.value.splice(insertIndex, response.data.data.length, ...response.data.data);
            loadedBatches.value.add(batch);
        }

        totalRecords.value = response.data.totalRecords;
        totalPages.value = Math.ceil(totalRecords.value / itemsPerPage);
        
        return response.data.data.length > 0;
    } catch (error) {
        $toast.error("Lỗi khi tải dữ liệu: " + error.message);
        return false;
    } finally {
        loading.value = false;
    }
};

const exportLogs = async () => {
    try {
		exporting.value = true;

        const response = await axios.get("/api/records/export", {
            params: {
                query: searchQuery.value,
                sortField: sortField.value,
                sortOrder: sortOrder.value,
                status: selectedStatus.value,
				target: selectedTarget.value
            },
            responseType: 'blob' // 👈 để nhận dạng file binary
        });

        // Tạo đường dẫn tải file
        const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

		const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        link.setAttribute("download", searchQuery.value ? searchQuery.value + ".xlsx" : "data.xlsx");
		const baseName = (searchQuery.value || "user_data")
			.trim()
			.replace(/\s+/g, "_")           // thay space/tab thành _
			.replace(/[<>:"/\\|?*\x00-\x1F]/g, "") // loại ký tự không hợp lệ
			.slice(0, 50);
		const filename = `${timestamp}_${baseName}.xlsx`;
		link.setAttribute("download", filename);

        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        $toast.error("Không thể xuất log, vui lòng liên hệ bé Vàng!");
    } finally {
        exporting.value = false;
    }
};

const handleSort = async (field, order) => {
    sortField.value = field;
    sortOrder.value = order;
    currentPage.value = 1;
    loadedBatches.value.clear();
    records.value = [];
    await fetchLogs(1, searchQuery.value);
    updateDisplayRecords(1);
};

const handleFilterChange = async () => {
    currentPage.value = 1;
    loadedBatches.value.clear();
    records.value = [];
    await fetchLogs(1, searchQuery.value);
    updateDisplayRecords(1);
};

const handleParentTargetChange = async () => {
	if(selectedParentTarget.value == "")
	{
		targetlist.value = [];
	}
	else
	{
		const selectElement = document.querySelector(".status-filter.target");
		if (selectElement) {
			selectElement.classList.add("blink-red");
			setTimeout(() => {
				selectElement.classList.remove("blink-red");
			}, 2000);
		}
		await fetchTargets();
	}
	selectedTarget.value = "";
	handleFilterChange();
};

const updateDisplayRecords = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    displayRecords.value = records.value.slice(startIndex, endIndex);
};

const changePage = async (newPage) => {
    if (!newPage || newPage < 1 || newPage > totalPages.value) return;
    currentPage.value = newPage;

    const startIndex = (newPage - 1) * itemsPerPage;
    const requiredBatch = Math.floor(startIndex / batchSize) + 1;

    if (!loadedBatches.value.has(requiredBatch) && startIndex < totalRecords.value) {
        await fetchLogs(requiredBatch, searchQuery.value);
    }
    
    updateDisplayRecords(newPage);
};

const handleProcessComplete = async () => {
    currentPage.value = 1;
    tableKey.value += 1;
    loadedBatches.value.clear();
    await fetchLogs(1, searchQuery.value);
    updateDisplayRecords(1);
};

const handleSearch = () => {
    clearTimeout(searchTimer.value);
    searchTimer.value = setTimeout(async () => {
		currentPage.value = 1;
        loadedBatches.value.clear();
        records.value = [];
        await fetchLogs(1, searchQuery.value);
        updateDisplayRecords(1);
    }, 500);
};

const editRecord = (record) => {
    selectedRecord.value = { ...record };
    isEditModalOpen.value = true;
};

const handleSaveRecord = async (updatedRecord) => {
    try {
        loading.value = true;
        const response = await axios.put("/api/records/update", updatedRecord);

        if (!response.data) {
            console.error('Missing response data');
            return;
        }

        if (response.data.fetch_all) {
            // Nếu applyToAll = true, fetch lại danh sách từ server
            await handleProcessComplete();
        } else if (response.data.updatedRecord) {
            // Nếu chỉ cập nhật một phần tử, tìm trong danh sách records.value và cập nhật
            const newRecord = response.data.updatedRecord;
            const index = records.value.findIndex(r => r && r._id === newRecord._id);
            if (index !== -1) {
                records.value[index] = { ...records.value[index], ...newRecord };
            }
            updateDisplayRecords(currentPage.value);
        }

        $toast.success(response.data.message || "Cập nhật thành công!");
    } catch (error) {
        console.error('Error details:', error);
        $toast.error("Lỗi khi cập nhật: " + (error.response?.data?.error || error.message));
    } finally {
        loading.value = false;
    }
};

const getRowStyleClass = (row) => {
	return `status-${row.login_status}`
}

//Chọn nhiều select để chuyển trạng thái
const selectedRows = ref(new Map());
function toggleCheckbox(id, username) {
    if (selectedRows.value.has(id)) {
        selectedRows.value.delete(id);
    } else {
        selectedRows.value.set(id, username);
    }
	console.log(selectedRows)
}

watch(searchQuery, handleSearch); // Lắng nghe sự thay đổi trong searchQuery

onMounted(async () => {
    await fetchLogs(1);
    updateDisplayRecords(1);
	fetchParentTargets();
});

onUpdated(async () => {
	feather.replace();
});
</script>

<template>
    <section id="homeview">
        <div class="row">
            <div class="col-md-9">
                <h5 class="sub-title"><fas-icon :icon="['fas', 'search']" class="me-2"/>Tìm kiếm tài khoản lộ lọt</h5>

                <!-- 🔍 Thanh tìm kiếm -->
                <div class="search-filter-container">
					<input 
						type="text" 
						v-model="searchQuery" 
						placeholder="Nhập username hoặc URL...."
						class="search-input"
					/>

					<!-- Bộ lọc trạng thái đăng nhập -->
					<select v-model="selectedStatus" @change="handleFilterChange" class="status-filter status">
						<option value="">Chọn trạng thái</option>
						<option value="success">Thành công</option>
						<option value="failure">Thất bại</option>
						<option value="pending">Chưa đăng nhập</option>
					</select>

					<div style="flex-grow: 1;"></div>
					<!-- Nút Tải lại (chỉ có icon) -->
					<button class="reload-btn" @click="handleProcessComplete">
						<fas-icon :icon="['fas', 'sync']" class="text-primary" />
					</button>
					<!-- Nút Tải lại (chỉ có icon) -->
					<button class="btn btn-success" @click="exportLogs" :disabled="exporting">
						<span v-if="exporting">
							<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
							Đang xuất...
						</span>
						<span v-else>
							Xuất log
						</span>
					</button>
				</div>
				<div class="search-filter-container">
					<select v-model="selectedParentTarget" @change="handleParentTargetChange" class="status-filter parent-target">
						<option value="">Chọn quốc gia</option>
						<option v-for="target in parentTargetList" :key="target._id" :value="target._id">{{ target.target_name }}</option>
					</select>

					<select v-show="selectedParentTarget" v-model="selectedTarget" @change="handleFilterChange" class="status-filter target">
						<!-- <option value="">Chọn mục tiêu</option> -->
						<option v-for="target in targetlist" :key="target._id" :value="target.target_url">{{ target.target_name }}</option>
					</select>
				</div>
                <TableSkeleton v-show="loading"></TableSkeleton>
                <vue-good-table
                    v-show="!loading"
                    :key="tableKey"
                    :columns="columnsForTable"
                    :rows="displayRecords"
                    :total-rows="totalRecords"
                    :loading="loading"
					:row-style-class="getRowStyleClass"
                    :pagination-options="{
                        enabled: true,
                        perPage: itemsPerPage,
                        perPageDropdownEnabled: false,
                    }"
                >
				<template #table-column="{ column }">
					<div v-if="column.field !== 'actions' && column.field !== 'select-box'" class="th-wrapper">
						<span>{{ column.label }}</span>
						<div class="sort-buttons">
							<button 
								class="sort-btn sort-asc" 
								:class="{ active: sortField === column.field && sortOrder === 'asc' }"
								@click="handleSort(column.field, 'asc')"
							>
								<span class="sr-only">Sort ascending</span>
							</button>
							<button 
								class="sort-btn sort-desc"
								:class="{ active: sortField === column.field && sortOrder === 'desc' }"
								@click="handleSort(column.field, 'desc')"
							>
								<span class="sr-only">Sort descending</span>
							</button>
						</div>
					</div>
				</template>

				<!-- Custom cell cho cột Actions -->
				<template #table-row="{ row, column }">
				<div v-if="column.field === 'actions'" class="text-center d-flex justify-content-center">
					<button class="btn btn-warning btn-sm d-flex align-items-center gap-2 btn-edit" @click="editRecord(row)">
						<i data-feather="edit"></i>
					</button>
				</div>
				<div v-if="column.field === 'select-box'" class="form-check d-flex justify-content-center align-items-center">
					<input
					class="form-check-input"
					type="checkbox"
					:checked="selectedRows.has(row._id)"
					@change="toggleCheckbox(row._id, row.username)"
					/>
				</div>
				</template>

				<template #pagination-bottom>
					<CustomPagination 
						:total-records="totalRecords" 
						:total-pages="totalPages"
						:current-page="currentPage"
						@change-page="changePage"
					/>
				</template>
                </vue-good-table>
            </div>
            <div class="col-md-3">
				<transition name="slide-down">
					<div v-if="selectedRows.size > 0">
						<SelectRowComponent :selected-rows="selectedRows" @clear-selected="selectedRows.clear()" />
					</div>
				</transition>
                <LogExecComponent @process-complete="handleProcessComplete"/>
            </div>
        </div>

		<EditRecordModal 
			:isOpen="isEditModalOpen" 
			:record="selectedRecord" 
			@update:isOpen="isEditModalOpen = $event"
			@save="handleSaveRecord"
		/>
    </section>
</template>

<style scoped>

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

.btn-edit{
	color: #fff;
}

.btn-edit svg{
	width: 20px;
}

.th-wrapper[data-v-b4e148ca] {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
}

.sort-buttons {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.sort-btn {
    width: 0;
    height: 0;
    padding: 0;
    border: 4px solid transparent;
    background: transparent;
    cursor: pointer;
}

.sort-btn.sort-asc {
    border-bottom: 4px solid #606266;
    margin-bottom: 2px;
}

.sort-btn.sort-desc {
    border-top: 4px solid #606266;
}

.sort-btn.active.sort-asc {
    border-bottom-color: #2196F3;
}

.sort-btn.active.sort-desc {
    border-top-color: #2196F3;
}

/* 🔍 Search Bar */
.search-filter-container {
    display: flex;
	height: fit-content;
    flex-wrap: wrap;
    gap: 10px; /* Khoảng cách giữa input và filter */
    margin-bottom: 15px;
	white-space: nowrap;
}

.search-input {
    width: 100%;
    max-width: 400px;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    transition: all 0.3s ease-in-out;
}

.search-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

/* Style cho dropdown bộ lọc */
.status-filter {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 16px;
    background: white;
    cursor: pointer;
    appearance: none; /* Ẩn mũi tên mặc định của trình duyệt */
    position: relative;
    transition: all 0.3s ease-in-out;
}

.status-filter.status {
    width: 200px;
}

.status-filter.target {
	min-width: 300px;
}

.status-filter.parent-target {
	min-width: 180px;
}

/* Hiệu ứng hover & focus */
.status-filter:focus,
.status-filter:hover {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

/* Tạo mũi tên dropdown tùy chỉnh */
.status-filter::after {
    content: "▼"; /* Unicode cho mũi tên xuống */
    font-size: 12px;
    color: #555;
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none; /* Tránh mũi tên bị nhấp */
}

/* Định dạng danh sách dropdown */
.status-filter-container {
    position: relative;
}

.status-dropdown {
    position: absolute;
    right: 0; /* Đẩy menu dropdown về bên phải */
    top: 100%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 180px;
    display: none; /* Ẩn mặc định */
}

/* Hiển thị dropdown khi active */
.status-filter-container.open .status-dropdown {
    display: block;
}

/* Style cho từng mục trong dropdown */
.status-dropdown option {
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
}

.status-dropdown option:hover {
    background: #007bff;
    color: white;
}

/* Responsive cho màn hình nhỏ */
@media (max-width: 768px) {
    .search-filter-container {
        flex-direction: column;
        align-items: stretch;
    }

    .search-input,
    .status-filter {
        width: 100%;
        max-width: none;
    }
}

</style>
