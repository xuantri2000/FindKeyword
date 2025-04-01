<template>
	<div v-if="isOpenAddModal" class="modal-overlay animate__animated animate__fadeIn">
	  <div class="modal-container animate__animated">
		<div class="modal-header border-bottom">
		  <h5 class="modal-title fw-bold">Thêm mục tiêu</h5>
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
import axios from "axios";
import $toast from "@/utils/VueToast";

const props = defineProps({
	isOpenAddModal: Boolean
});

const emit = defineEmits(['add:isOpenAddModal', 'add']);

const addName = ref("");
const addUrl = ref("");

const closeModal = () => {
	const modalOverlay = document.querySelector('.modal-overlay');
	modalOverlay.classList.remove('animate__fadeIn');
	modalOverlay.classList.add('animate__fadeOut');

	setTimeout(() => {
		emit('add:isOpenAddModal', false);
	}, 300);
};

const saveChanges = async () => {
	if (!addName.value.trim() || !addUrl.value.trim()) {
		$toast.warning("Tên mục tiêu và URL không được để trống!")
		return;
	}
	try {
		const response = await axios.post('/api/targets', { target_name: addName.value, target_url: addUrl.value });
		$toast.success("Thêm thành công!");
		addName.value = "";
		addUrl.value = "";
		emit('add', true);
		closeModal();
	} catch (error) {
		$toast.error(error);
	}
};

</script>

<style scoped>
.fade-in {
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}
.animate__fadeIn {
  animation: fadeIn 0.5s;
}
.animate__fadeOut {
  animation: fadeOut 0.5s;
}
.btn-close:focus {
  box-shadow: none;
  outline: none;
}
.modal-header {
  justify-content: space-between;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
</style>
