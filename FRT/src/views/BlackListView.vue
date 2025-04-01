<script setup>
import { ref, onMounted, onUpdated } from "vue";
import axios from "axios";
import $toast from "@/utils/VueToast";
import TableSkeleton from "@/components/ui/TableSkeleton.vue";
import EditBlackListModal from "@/components/modals/EditBlackListModal.vue";

const blacklist = ref([]);
const loadingBlack = ref(false);
const newUrl = ref("");
const tableKey = ref(0); // Thay đổi để cập nhật lại table
const isEditModalOpen = ref(false);
const selectedRecord = ref(null);

// Cấu hình cột cho Vue Good Table
const columnsForTable = ref([
    { label: "", field: "actions", sortable: false, tdClass: "cell-actions", thClass: "th-actions" },
    { label: "URL Path", field: "url_path", sortable: true }
]);

// Fetch danh sách Blacklist từ API
const fetchBlacklist = async () => {
    loadingBlack.value = true;
    try {
        const response = await axios.get("/api/blacklists/black");
        blacklist.value = response.data;
    } catch (error) {
        console.error("Lỗi khi fetch Blacklist:", error);
    }
    loadingBlack.value = false;
};

// Thêm mục vào Blacklist
const addToBlacklist = async () => {
    if (!newUrl.value.trim()) {
        $toast.warning("Vui lòng nhập URL!");
        return;
    }
    try {
        await axios.post("/api/blacklists/black", { url_path: newUrl.value.trim(), type: "blacklist" });
        $toast.success("Thêm thành công!");
        newUrl.value = "";
        await fetchBlacklist();
    } catch (error) {
        console.error("Lỗi khi thêm:", error);
        $toast.error("Lỗi khi thêm vào Blacklist!");
    }
};

// Xóa mục khỏi Blacklist
const deleteFromBlacklist = async (id) => {
    try {
        await axios.delete(`/api/blacklists/black/${id}`);
        $toast.success("Xóa thành công!");
        await fetchBlacklist();
    } catch (error) {
        console.error("Lỗi khi xóa:", error);
        $toast.error("Lỗi khi xóa!");
    }
};

// Cập nhật mục trong Blacklist
const editBlacklistItem = (item) => {
	selectedRecord.value = { ...item };
	isEditModalOpen.value = true;
};

const saveEditedBlacklist = async (updatedRecord) => {
	try {
		await axios.put(`/api/blacklists/black/${updatedRecord._id}`, { url_path: updatedRecord.url_path });
		$toast.success("Cập nhật thành công!");
		await fetchBlacklist();
	} catch (error) {
		console.error("Lỗi khi cập nhật:", error);
		$toast.error("Lỗi khi cập nhật!");
	}
};

// Gọi API khi component được mount
onMounted(async () => {
    await fetchBlacklist();
});
</script>

<template>
    <section id="target_list">
        <h5 class="sub-title">🚫 Danh sách Blacklist</h5>

        <!-- Form Thêm Mục -->
        <div class="add-item">
            <input v-model="newUrl" placeholder="Nhập URL..." @keyup.enter="addToBlacklist" />
            <button class="btn btn-primary btn-sm" @click="addToBlacklist">Thêm</button>
        </div>

        <TableSkeleton v-if="loadingBlack"></TableSkeleton>

        <!-- Vue Good Table -->
        <vue-good-table
            v-show="!loadingBlack"
            :key="tableKey"
            :columns="columnsForTable"
            :rows="blacklist"
            :pagination-options="{ enabled: false }"
        >
            <template #table-row="{ row, column }">
                <template v-if="column.field === 'actions'">
                    <div class="text-center d-flex justify-content-center gap-2">
                        <button class="btn btn-sm btn-warning btn-edit" @click="editBlacklistItem(row)">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteFromBlacklist(row._id)">
                            🗑️
                        </button>
                    </div>
                </template>
            </template>
        </vue-good-table>

		<EditBlackListModal 
			:isOpen="isEditModalOpen" 
			:record="selectedRecord" 
			@update:isOpen="isEditModalOpen = $event"
			@save="saveEditedBlacklist"
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
    padding: 6px 10px;
    font-size: 14px;
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
