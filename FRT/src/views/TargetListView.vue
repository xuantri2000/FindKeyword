<script setup>
import { ref, onMounted, onUpdated } from "vue";
import axios from "axios";
import $toast from "@/utils/VueToast";
import TableSkeleton from "@/components/ui/TableSkeleton.vue";
import AddTargetListModal from "@/components/modals/AddTargetListModal.vue";
import UpdateTargetListModal from "@/components/modals/UpdateTargetListModal.vue";

const targetlist = ref([]);
const loadingBlack = ref(false);
const newUrl = ref("");
const tableKey = ref(0); // Thay đổi để cập nhật lại table
const isOpenAddModal = ref(false);
const isOpenUpdateModal = ref(false);
const selectedRecord = ref(null);

// Cấu hình cột cho Vue Good Table
const columnsForTable = ref([
    { label: "", field: "actions", sortable: false, tdClass: "cell-actions", thClass: "th-actions" },
    { label: "Tên mục tiêu", field: "target_name", sortable: true, filterOptions: {
		styleClass: 'class1',
		enabled: true,
		placeholder: 'Tìm kiếm theo tên mục tiêu',
	} },
    { label: "Đường dẫn", field: "target_url", sortable: true, filterOptions: {
		styleClass: 'class2',
		enabled: true,
		placeholder: 'Tìm kiếm theo đường dẫn',
	} }
]);

// Fetch danh sách Target từ API
const fetchTarget = async () => {
    loadingBlack.value = true;
    try {
        const response = await axios.get("/api/targets");
        targetlist.value = response.data;
    } catch (error) {
        console.error("Lỗi khi fetch Target:", error);
    }
    loadingBlack.value = false;
};

// Xóa mục khỏi Target
const deleteFromTarget = async (id) => {
    try {
        await axios.delete(`/api/targets/${id}`);
        $toast.success("Xóa thành công!");
        await fetchTarget();
    } catch (error) {
        console.error("Lỗi khi xóa:", error);
        $toast.error("Lỗi khi xóa!");
    }
};

// Cập nhật mục trong Target
const editTargetItem = (item) => {
	selectedRecord.value = { ...item };
	isOpenUpdateModal.value = true;
};

// Cập nhật mục trong Target
const openAddModal = () => {
	isOpenAddModal.value = true;
};

const saveEditedTarget = async (updatedRecord) => {
	try {
		await axios.put(`/api/targets/${updatedRecord._id}`, { url_path: updatedRecord.url_path });
		$toast.success("Cập nhật thành công!");
		await fetchTarget();
	} catch (error) {
		console.error("Lỗi khi cập nhật:", error);
		$toast.error("Lỗi khi cập nhật!");
	}
};

// Gọi API khi component được mount
onMounted(async () => {
    await fetchTarget();
});
</script>

<template>
    <section id="target_list">
        <h5 class="sub-title"><fas-icon :icon="['fas', 'bullseye']" class="me-2"/>Danh sách mục tiêu</h5>

        <!-- Form Thêm Mục -->
        <div class="add-item">
            <button class="btn btn-primary" @click="openAddModal"><fas-icon :icon="['fas', 'add']"/></button>
        </div>

        <TableSkeleton v-if="loadingBlack"></TableSkeleton>

        <!-- Vue Good Table -->
        <vue-good-table
            v-show="!loadingBlack"
            :key="tableKey"
            :columns="columnsForTable"
            :rows="targetlist"
            :pagination-options="{
				enabled: true,
				perPage: 10,
				nextLabel: 'Sau',
				prevLabel: 'Trước',
				rowsPerPageDropdown: [10, 20, 30, 50],
				rowsPerPageLabel: 'Số bản ghi trên trang',
				ofLabel: 'trên tổng',
				pageLabel: 'Trang',
			}"
        >
            <template #table-row="{ row, column }">
                <template v-if="column.field === 'actions'">
                    <div class="text-center d-flex justify-content-center gap-2">
                        <button class="btn btn-sm btn-warning btn-edit" @click="editTargetItem(row)">
                            <fas-icon :icon="['fas', 'edit']" class="white-icon" />
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteFromTarget(row._id)">
                            <fas-icon :icon="['fas', 'trash']" />
                        </button>
                    </div>
                </template>
            </template>
        </vue-good-table>

		<AddTargetListModal 
			:isOpenAddModal="isOpenAddModal"
			@add:isOpenAddModal="isOpenAddModal = $event"
			@add="fetchTarget"
		/>

		<UpdateTargetListModal 
			:isOpenUpdateModal="isOpenUpdateModal" 
			:record="selectedRecord" 
			@update:isOpenUpdateModal="isOpenUpdateModal = $event"
			@save="fetchTarget"
		/>
    </section>
</template>

<style scoped>
/* 🔍 Search & Add */
.add-item {
    display: flex;
    gap: 8px;
    margin-bottom: 15px;
}

.add-item input {
    width: 100%;
    max-width: 300px;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    transition: all 0.3s ease-in-out;
}

.add-item input:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

/* Nút hành động */
.btn-sm {
    padding: 8px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Vue Good Table Styling */
.cell-actions {
    text-align: center;
}

.th-actions {
    text-align: center;
}
</style>
