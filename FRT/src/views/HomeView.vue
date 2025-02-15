<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import $toast from "@/utils/VueToast";
import LogExecComponent from "@/components/LogExecComponent.vue";

const records = ref([]);
const loading = ref(false);

// Hàm fetch dữ liệu từ API
const fetchLogs = async () => {
	loading.value = true;
	try {
		const response = await axios.get("/api/records/");
		records.value = response.data.data; // Giả sử API trả về mảng dữ liệu
	} catch (error) {
		$toast.error("Lỗi khi tải dữ liệu: " + error.message);
	} finally {
		loading.value = false;
	}
};

onMounted(fetchLogs);
</script>

<template>
	<section id="homeview">
		<div class="row">
			<div class="col-md-8">
				<h5 class="sub-title">Tìm kiếm tài khoản lộ lọt</h5>
				<vue-good-table :columns="[
					{ label: 'Username', field: 'username', sortable: true },
					{ label: 'Password', field: 'password', sortable: false },
					{ label: 'URL Path', field: 'url_path', sortable: true },
					// { label: 'Run Time', field: 'run_time', sortable: true },
				]" :rows="records" :pagination-options="{ enabled: true, perPage: 10 }" :search-options="{ enabled: true }">
				</vue-good-table>
			</div>
			<div class="col-md-4">
				<LogExecComponent />
			</div>
		</div>
	</section>
</template>
