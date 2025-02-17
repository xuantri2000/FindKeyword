<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import $toast from "@/utils/VueToast";
import LogExecComponent from "@/components/LogExecComponent.vue";

const records = ref([]); // Mảng lưu cache dữ liệu
const displayRecords = ref([]); // Mảng hiển thị trên giao diện
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = parseInt(import.meta.env.VITE_PER_PAGE);
const batchSize = parseInt(import.meta.env.VITE_BATCH_SIZE);
const totalRecords = ref(1);

const fetchLogs = async (batch) => {
    loading.value = true;
    try {
        const response = await axios.get(`/api/records?batch=${batch}&limit=${batchSize}`);
        
        if (response.data.data.length > 0) {
            records.value = [...records.value, ...response.data.data]; // Append records thay vì ghi đè
        }

        totalRecords.value = response.data.totalRecords;
        totalPages.value = Math.ceil(response.data.totalRecords / itemsPerPage);
        
        // Nếu chưa có dữ liệu hiển thị, lấy từ batch đầu tiên
        if (displayRecords.value.length === 0) {
            displayRecords.value = records.value.slice(0, itemsPerPage);
        }
    } catch (error) {
        $toast.error("Lỗi khi tải dữ liệu: " + error.message);
    } finally {
        loading.value = false;
    }
};

const changePage = (newPage) => {
    const batchStartIndex = (newPage.currentPage - 1) * itemsPerPage;
    const batchEndIndex = batchStartIndex + itemsPerPage;

    // Nếu dữ liệu đã đủ, chỉ cần hiển thị phần tương ứng
    if (batchStartIndex < totalRecords.value) {
        displayRecords.value = records.value.slice(batchStartIndex, batchEndIndex);
    }

    // Nếu batchEndIndex vượt quá số dữ liệu hiện có và chưa đủ totalRecords, mới fetch tiếp
    if (batchEndIndex > records.value.length && records.value.length < totalRecords.value) {
        const nextFetchPage = Math.ceil(records.value.length / batchSize) + 1;
        fetchLogs(nextFetchPage).then(() => {
            displayRecords.value = records.value.slice(batchStartIndex, batchEndIndex);
        });
    }

    currentPage.value = newPage.currentPage;
};



onMounted(() => fetchLogs(1));
</script>

<template>
    <section id="homeview">
        <div class="row">
            <div class="col-md-8">
                <h5 class="sub-title">Tìm kiếm tài khoản lộ lọt</h5>
                <vue-good-table
                    :columns="[
                        { label: 'Tài khoản', field: 'username', sortable: false },
                        { label: 'Mật khẩu', field: 'password', sortable: false },
                        { label: 'URL Path', field: 'url_path', sortable: false },
                        // { label: 'Nguồn', field: 'log_resource', sortable: false },
                    ]"
                    :rows="displayRecords"
					:total-rows="totalRecords"
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
                <LogExecComponent @process-complete="fetchLogs(1)"/>
            </div>
        </div>
    </section>
</template>
