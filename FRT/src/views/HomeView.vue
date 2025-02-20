<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import $toast from "@/utils/VueToast";
import LogExecComponent from "@/components/LogExecComponent.vue";
import TableSkeleton from "@/components/ui/TableSkeleton.vue";
import CustomPagination from "@/components/ui/CustomPagination.vue";

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

const fetchLogs = async (batch) => {
    if (loadedBatches.value.has(batch)) return true;

    loading.value = true;
    try {
        const response = await axios.get(`/api/records?batch=${batch}&limit=${batchSize}`);
        
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
        await fetchLogs(requiredBatch);
    }
    
    updateDisplayRecords(newPage);
};

const handleProcessComplete = async () => {
    currentPage.value = 1;
    tableKey.value += 1;
    loadedBatches.value.clear();
    await fetchLogs(1);
    updateDisplayRecords(1);
};

onMounted(async () => {
    await fetchLogs(1);
    updateDisplayRecords(1);
});
</script>

<template>
    <section id="homeview">
        <div class="row">
            <div class="col-md-8">
                <h5 class="sub-title">Tìm kiếm tài khoản lộ lọt</h5>
				<TableSkeleton v-show="loading"></TableSkeleton>
                <vue-good-table
					v-show="!loading"
                    :key="tableKey"
                    :columns="[
                        { label: 'Tài khoản', field: 'username', sortable: false },
                        { label: 'Mật khẩu', field: 'password', sortable: false },
                        { label: 'URL Path', field: 'url_path', sortable: false },
                    ]"
                    :rows="displayRecords"
                    :total-rows="totalRecords"
                    :loading="loading"
                    :pagination-options="{
                        enabled: true,
                        perPage: itemsPerPage,
                        perPageDropdownEnabled: false,
                    }"
                >
                  <!-- 📌 Ghi đè pagination -->
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
            <div class="col-md-4">
                <LogExecComponent @process-complete="handleProcessComplete"/>
            </div>
        </div>
    </section>
</template>