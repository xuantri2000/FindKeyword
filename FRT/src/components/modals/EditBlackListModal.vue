<template>
	<div v-if="isOpen" class="modal-overlay animate__animated animate__fadeIn">
	  <div class="modal-container animate__animated">
		<div class="modal-header border-bottom">
		  <h5 class="modal-title fw-bold">Chỉnh sửa Blacklist</h5>
		  <button @click="closeModal" class="btn-close close hover-shake" aria-label="Close"></button>
		</div>
		<div class="modal-body py-4">
		  <div class="form-group fade-in" style="animation-delay: 0.1s">
			<label class="form-label">URL Path</label>
			<textarea v-model="editedUrl" 
			  type="text" 
			  class="form-control hover-effect">
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
import { defineProps, ref, watch } from 'vue';

const props = defineProps({
	isOpen: Boolean,
	record: Object
});

const emit = defineEmits(['update:isOpen', 'save']);

const editedUrl = ref("");

watch(() => props.record, (newRecord) => {
	if (newRecord) {
		editedUrl.value = newRecord.url_path;
	}
}, { immediate: true, deep: true });

const closeModal = () => {
	const modalOverlay = document.querySelector('.modal-overlay');
	modalOverlay.classList.remove('animate__fadeIn');
	modalOverlay.classList.add('animate__fadeOut');

	setTimeout(() => {
		emit('update:isOpen', false);
	}, 300);
};

const saveChanges = () => {
	emit('save', { ...props.record, url_path: editedUrl.value });
	closeModal();
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
