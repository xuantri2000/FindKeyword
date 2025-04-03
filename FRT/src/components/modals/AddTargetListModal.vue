<template>
	<div v-if="isOpenAddModal" class="modal-overlay animate__animated animate__fadeIn">
		<div class="modal-container animate__animated">
		<div class="modal-header border-bottom">
			<h5 class="modal-title fw-bold">Thêm mục tiêu</h5>
			<button @click="closeModal" class="btn-close close hover-shake" aria-label="Close"></button>
		</div>
		<div class="modal-body py-4">
			<!-- Tên mục tiêu -->
			<div class="form-group fade-in mb-2" style="animation-delay: 0.15s">
			<label class="form-label mb-0">Tên mục tiêu</label>
			<input v-model="addName" 
				type="text" 
				class="form-control hover-effect" 
				placeholder="Nhập tên mục tiêu">
			</div>
			<!-- URL -->
			<div class="form-group fade-in mb-2" style="animation-delay: 0.2s">
			<label class="form-label mb-0">URL</label>
			<textarea v-model="addUrl" 
				type="text" 
				class="form-control hover-effect" 
				placeholder="Nhập URL">
			</textarea> 
			</div>
			<!-- Chọn đơn vị cha -->
			<div class="form-group fade-in mb-2" style="animation-delay: 0.1s">
				<label class="form-label mb-0">Chọn phân cấp</label>
				<select v-model="selectedParent" class="form-control hover-effect">
					<option value="" selected>Cấp Quốc gia</option>
					<option v-for="parent in parentTargetList" :key="parent._id" :value="parent._id">
					{{ parent.target_name }}
					</option>
				</select>
			</div>
		</div>
		<div class="modal-footer">
			<button @click="closeModal" class="btn btn-secondary hover-effect me-1">Hủy</button>
			<button @click="saveChanges" class="btn btn-primary pulse-effect">Lưu</button>
		</div>
		</div>
	</div>
</template>


<script setup>
import { ref, watch } from 'vue';
import axios from "axios";
import $toast from "@/utils/VueToast";

const props = defineProps({
	isOpenAddModal: Boolean
});

const emit = defineEmits(['add:isOpenAddModal', 'add']);

const addName = ref("");
const addUrl = ref("");
const parentTargetList = ref([]);
const selectedParent = ref("");

const closeModal = () => {
	const modalOverlay = document.querySelector('.modal-overlay');
	modalOverlay.classList.remove('animate__fadeIn');
	modalOverlay.classList.add('animate__fadeOut');

	setTimeout(() => {
		emit('add:isOpenAddModal', false);
		resetForm();
	}, 300);
};

const saveChanges = async () => {
	if (!addName.value.trim() || !addUrl.value.trim()) {
		$toast.warning("Tên mục tiêu và URL không được để trống!")
		return;
	}

	const parent_id = selectedParent.value ? selectedParent.value : null;

	try {
		const response = await axios.post('/api/targets', { target_name: addName.value, target_url: addUrl.value, parent_id });
		$toast.success(response.data.message);
		resetForm();
		emit('add', true);
		closeModal();
	} catch (error) {
		if (error.response && error.response.data && error.response.data.message) {
			$toast.error(error.response.data.message);
		} else {
			// Lỗi không xác định
			$toast.error("Lỗi không xác định. Vui lòng liên hệ bé Vàng!");
		}
	}
};

const resetForm = () => {
	addName.value = "";
	addUrl.value = "";
	selectedParent.value = "";
}

// Watch để tự động gọi hàm khi mở modal
watch(() => props.isOpenAddModal, (newVal) => {
	if (newVal) {
		fetchParentTarget();
	}
});

// Fetch danh sách Target từ API
const fetchParentTarget = async () => {
	try {
		const response = await axios.get("/api/targets/countries");
		parentTargetList.value = response.data;
	} catch (error) {
		console.error("Lỗi khi fetch Target:", error);
	}
};

</script>

<style scoped>

</style>
