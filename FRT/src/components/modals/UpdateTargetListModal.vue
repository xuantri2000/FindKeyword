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

watch(() => props.record, (newRecord) => {
	if (newRecord) {
		addName.value = newRecord.target_name;
		addUrl.value = newRecord.target_url;
	}
}, { immediate: true, deep: true });

const closeModal = () => {
	emit('update:isOpenUpdateModal', false);
};

const saveChanges = async () => {
	if (!addName.value.trim() || !addUrl.value.trim()) {
		$toast.warning("Tên mục tiêu và URL không được để trống!");
		return;
	}
	try {
		await axios.put(`/api/targets/${props.record._id}`, {
			target_name: addName.value,
			target_url: addUrl.value
		});
		$toast.success("Cập nhật thành công!");
		emit('save');
		closeModal();
	} catch (error) {
		$toast.error("Lỗi khi cập nhật mục tiêu!");
		console.error(error);
	}
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}
</style>
