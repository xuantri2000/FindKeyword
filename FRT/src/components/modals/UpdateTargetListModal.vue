<template>
	<div v-if="isOpenUpdateModal" class="modal-overlay animate__animated animate__fadeIn">
	  <div class="modal-container animate__animated">
		<div class="modal-header border-bottom">
		  <h5 class="modal-title fw-bold">Chỉnh sửa mục tiêu</h5>
		  <button @click="closeModal" class="btn-close close hover-shake" aria-label="Close"></button>
		</div>
		<div class="modal-body py-4">
		  <div class="form-group fade-in mb-2" style="animation-delay: 0.1s">
			<label class="form-label mb-0">Tên mục tiêu</label>
			<input v-model="addName" 
			  type="text" 
			  class="form-control hover-effect" 
			  placeholder="Nhập tên mục tiêu">
		  </div>
		  <div class="form-group fade-in" style="animation-delay: 0.2s">
			<label class="form-label mb-0">URL</label>
			<textarea v-model="addUrl" 
			  type="text" 
			  class="form-control hover-effect" 
			  placeholder="Nhập URL">
			</textarea> 
		  </div>
			<!-- Chọn đơn vị cha -->
			<div v-if="!isNationalLevel" class="form-group fade-in mb-2" style="animation-delay: 0.1s">
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
		  <button @click="closeModal" class="btn btn-secondary hover-effect me-1">
			Hủy
		  </button>
		  <button @click="saveChanges" class="btn btn-primary pulse-effect">
			Lưu
		  </button>
		</div>
	  </div>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import $toast from '@/utils/VueToast';

const props = defineProps({
	isOpenUpdateModal: Boolean,
	record: Object
});

const emit = defineEmits(['update:isOpenUpdateModal', 'save']);

const addName = ref("");
const addUrl = ref("");
const parentTargetList = ref([]);
const selectedParent = ref("");
const isNationalLevel = ref(false);

watch(() => props.isOpenUpdateModal, (newVal) => {
	if (newVal) {
		checkNationalLevel();
		if (!isNationalLevel.value) {
			fetchParentTarget();
		}
	}
});

watch(() => props.record, (newRecord) => {
	if (newRecord) {
		addName.value = newRecord.target_name;
		addUrl.value = newRecord.target_url;

		const parent_id = newRecord.parent_id ? newRecord.parent_id : "";
		selectedParent.value = parent_id;
	}
}, { immediate: true, deep: true });

// Kiểm tra nếu mục tiêu là cấp quốc gia
const checkNationalLevel = () => {
	if (props.record && props.record.parent === "Cấp quốc gia") {
		isNationalLevel.value = true;
	} else {
		isNationalLevel.value = false;
	}
};

// Fetch danh sách Target từ API
const fetchParentTarget = async () => {
	try {
		const response = await axios.get(`/api/targets/countries?excludeId=${props.record._id}`);
		parentTargetList.value = response.data;
	} catch (error) {
		console.error("Lỗi khi fetch Target:", error);
	}
};

const closeModal = () => {
	const modalOverlay = document.querySelector('.modal-overlay');
	modalOverlay.classList.remove('animate__fadeIn');
	modalOverlay.classList.add('animate__fadeOut');

	setTimeout(() => {
		emit('update:isOpenUpdateModal', false);
	}, 300);
};

const saveChanges = async () => {
	if (!addName.value.trim() || !addUrl.value.trim()) {
		$toast.warning("Tên mục tiêu và URL không được để trống!");
		return;
	}

	const parent_id = selectedParent.value ? selectedParent.value : null;

	try {
		const response = await axios.put(`/api/targets/${props.record._id}`, {
			target_name: addName.value,
			target_url: addUrl.value,
			parent_id
		});
		$toast.success(response.data.message);
		emit('save');
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
</script>

<style scoped>

</style>