<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import $toast from "@/utils/VueToast";
import TableSkeleton from "@/components/ui/TableSkeleton.vue";
import AddTargetListModal from "@/components/modals/AddTargetListModal.vue";
import UpdateTargetListModal from "@/components/modals/UpdateTargetListModal.vue";

const targetlist = ref([]);
const loadingTarget = ref(false);
const newUrl = ref("");
const tableKey = ref(0);
const isOpenAddModal = ref(false);
const isOpenUpdateModal = ref(false);
const selectedRecord = ref(null);
const isOpenDeleteModal = ref(false); // Thêm biến quản lý modal xóa
const deleteTargetId = ref(null); // ID của mục tiêu muốn xóa
const deleteMessage = ref("");

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
	} },
	{ label: "Phân cấp", field: "parent", sortable: true, filterOptions: {
		styleClass: 'class3',
		enabled: true,
		placeholder: 'Tìm kiếm theo phân cấp',
	} }
]);

// Fetch danh sách Target từ API
const fetchTarget = async () => {
    loadingTarget.value = true;
    try {
        const response = await axios.get("/api/targets");
        targetlist.value = response.data;
    } catch (error) {
        console.error("Lỗi khi fetch Target:", error);
    }
    loadingTarget.value = false;
};

// Xử lý khi nhấn nút xóa
const openDeleteModal = (item) => {
    deleteTargetId.value = item._id;
    // Kiểm tra phân cấp để hiển thị thông báo phù hợp
    if (item.parent === "Cấp quốc gia") {
		deleteMessage.value = `Bạn đang xóa mục tiêu <span class="text-danger">Cấp quốc gia</span>, vui lòng kiểm tra lại các mục tiêu con trước khi xóa, nếu vẫn tiếp tục, các mục tiêu con sẽ bị xóa theo!`;
    } else {
        deleteMessage.value = "Vui lòng kiểm tra lại mục tiêu trước khi xóa!";
    }
    isOpenDeleteModal.value = true;
};

// Xóa mục khỏi Target
const deleteFromTarget = async () => {
    try {
        const response = await axios.delete(`/api/targets/${deleteTargetId.value}`);
        $toast.success(response.data.message);
        await fetchTarget();
        closeDeleteModal();
    } catch (error) {
		if (error.response && error.response.data && error.response.data.message) {
			$toast.error(error.response.data.message);
		} else {
			// Lỗi không xác định
			$toast.error("Lỗi không xác định. Vui lòng liên hệ bé Vàng!");
		}
    }
};

// Đóng modal xóa
const closeDeleteModal = () => {
    isOpenDeleteModal.value = false;
    deleteTargetId.value = null;
};

// Cập nhật mục trong Target
const editTargetItem = (item) => {
    selectedRecord.value = { ...item };
    isOpenUpdateModal.value = true;
};

// Mở modal thêm
const openAddModal = () => {
    isOpenAddModal.value = true;
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

        <TableSkeleton v-if="loadingTarget"></TableSkeleton>

        <!-- Vue Good Table -->
        <vue-good-table
            v-show="!loadingTarget"
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
                        <button class="btn btn-sm btn-danger" @click="openDeleteModal(row)">
                            <fas-icon :icon="['fas', 'trash']" />
                        </button>
                    </div>
                </template>
            </template>
        </vue-good-table>

        <!-- Modal Xác nhận Xóa -->
        <div v-if="isOpenDeleteModal" class="modal-overlay animate__animated animate__fadeIn">
            <div class="modal-container">
                <h4><fas-icon :icon="['fas', 'warning']"/> Xác nhận xóa?</h4>
				<p v-html="deleteMessage"></p>
                <div class="modal-footer">
                    <button @click="closeDeleteModal" class="btn btn-secondary me-2">Hủy</button>
                    <button @click="deleteFromTarget" class="btn btn-danger">OK</button>
                </div>
            </div>
        </div>

        <!-- Modal Thêm Mục tiêu -->
        <AddTargetListModal 
            :isOpenAddModal="isOpenAddModal"
            @add:isOpenAddModal="isOpenAddModal = $event"
            @add="fetchTarget"
        />

        <!-- Modal Cập nhật Mục tiêu -->
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
