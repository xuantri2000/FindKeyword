<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import $toast from "@/utils/VueToast";
import LogExecComponent from "@/components/LogExecComponent.vue";

const records = ref([]);
const displayRecords = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = parseInt(import.meta.env.VITE_PER_PAGE);
const batchSize = parseInt(import.meta.env.VITE_BATCH_SIZE);
const totalRecords = ref(1);
const tableKey = ref(0);

const fetchLogs = async (batch) => {
    loading.value = true;
    try {
        const response = await axios.get(`/api/records?batch=${batch}&limit=${batchSize}`);
        
        if (response.data.data.length > 0) {
            if (batch === 1) {
                records.value = response.data.data;
            } else {
                records.value = [...records.value, ...response.data.data];
            }
        }

        totalRecords.value = response.data.totalRecords;
        totalPages.value = Math.ceil(response.data.totalRecords / itemsPerPage);
        
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
    // Extract the page number regardless of event format
    const pageNumber = typeof newPage === 'object' ? newPage.currentPage : parseInt(newPage);
    
    if (!pageNumber || pageNumber < 1) {
        return;
    }

    const startIndex = (pageNumber - 1) * itemsPerPage;
    const requiredBatch = Math.floor(startIndex / batchSize) + 1;
    const currentLastBatch = Math.ceil(records.value.length / batchSize);

    // Check if we need to fetch more data
    if (requiredBatch > currentLastBatch && records.value.length < totalRecords.value) {
        // Fetch all missing batches sequentially
        for (let batch = currentLastBatch + 1; batch <= requiredBatch; batch++) {
            const hasNewData = await fetchLogs(batch);
            if (!hasNewData) break;
        }
    }
    
    updateDisplayRecords(pageNumber);
    currentPage.value = pageNumber;
};

const handleProcessComplete = async () => {
    currentPage.value = 1;
    tableKey.value += 1;
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
                <vue-good-table
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
                        jumpFirstOrLast: true,
                        nextLabel: 'Sau',
                        prevLabel: 'Trước',
                        pageLabel: 'Trang',
                        mode: 'pages'
                    }"
                    @page-change="changePage"
                ></vue-good-table>
            </div>
            <div class="col-md-4">
                <LogExecComponent @process-complete="handleProcessComplete"/>
            </div>
        </div>
    </section>
</template>