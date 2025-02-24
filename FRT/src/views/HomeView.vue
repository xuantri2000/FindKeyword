<script setup>
import { ref, computed, onMounted, watch, onUpdated } from "vue";
import axios from "axios";
import $toast from "@/utils/VueToast";
import LogExecComponent from "@/components/LogExecComponent.vue";
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
        field: 'actions', 
        sortable: false,
        tdClass: 'cell-actions', 
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
]); 
const isEditModalOpen = ref(false);
const selectedRecord = ref(null);


const fetchLogs = async (batch, query = "") => {
    if (loadedBatches.value.has(batch) && query === "" && !sortField.value) return true;

    loading.value = true;
    try {
        const response = await axios.get(`/api/records`, {
            params: {
                batch,
                limit: batchSize,
                query,
                sortField: sortField.value,
                sortOrder: sortOrder.value
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

const handleSort = async (field, order) => {
    sortField.value = field;
    sortOrder.value = order;
    currentPage.value = 1;
    loadedBatches.value.clear();
    records.value = [];
    await fetchLogs(1, searchQuery.value);
    updateDisplayRecords(1);
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
        const response = await axios.put("/api/records/update", updatedRecord);

        // Cập nhật nhiều records nếu có
        const { updatedRecords } = response.data;
        
        updatedRecords.forEach(newRecord => {
            const index = records.value.findIndex(r => r._id === newRecord._id);
            if (index !== -1) {
                records.value[index] = { ...records.value[index], ...newRecord };
            }
        });

        // Cập nhật lại display records
        updateDisplayRecords(currentPage.value);
		$toast.success(response.data.message || "Cập nhật thành công!");
    } catch (error) {
		console.log(error)
        // $toast.error(error.response.data.error);
    }
};

const getRowStyleClass = (row) => {
	return `status-${row.login_status}`
}

watch(searchQuery, handleSearch); // Lắng nghe sự thay đổi trong searchQuery

onMounted(async () => {
    await fetchLogs(1);
    updateDisplayRecords(1);
});

onUpdated(async () => {
	feather.replace();
});
</script>

<template>
    <section id="homeview">
        <div class="row">
            <div class="col-md-9">
                <h5 class="sub-title">Tìm kiếm tài khoản lộ lọt</h5>

                <!-- 🔍 Thanh tìm kiếm -->
                <div class="search-container">
                    <input 
                        type="text" 
                        v-model="searchQuery" 
                        placeholder="Nhập username hoặc URL..."
                        class="search-input"
                    />
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
					<div v-if="column.field !== 'actions'" class="th-wrapper">
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
.search-container {
    display: flex;
    /* justify-content: center; */
    margin-bottom: 15px;
}

.search-input {
    width: 100%;
    max-width: 300px;
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
</style>
