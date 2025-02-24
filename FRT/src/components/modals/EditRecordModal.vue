<template>
	<div v-if="isOpen" class="modal-overlay animate__animated animate__fadeIn">
	  <div class="modal-container animate__animated">
		<div class="modal-header border-bottom">
		  <h5 class="modal-title fw-bold">Chỉnh sửa thông tin</h5>
		  <button @click="closeModal" class="btn-close close hover-shake" aria-label="Close"></button>
		</div>
		<div class="modal-body py-4">
			<div class="form-group fade-in" style="animation-delay: 0.1s">
				<label class="form-label me-1">Tài khoản:</label>
				<span>{{ editedRecord.username }}</span>
			</div>
		  
		  <div class="form-group mb-2 fade-in" style="animation-delay: 0.1s">
			<label class="form-label me-1">Mật khẩu:</label>
			<span>{{ editedRecord.password }}</span>
		  </div>
		  <hr>
		  
		  <div class="form-group mb-1 fade-in" style="animation-delay: 0.2s">
			<label class="form-label">URL Path</label>
			<input 
			  v-model="editedRecord.url_path" 
			  type="text" 
			  class="form-control hover-effect"
			/>
		  </div>
		  
		  <div class="form-group mb-3 fade-in" style="animation-delay: 0.3s">
			<input type="checkbox" v-model="applyToAll" class="form-check-input" id="applyToAll" />
			<label class="form-check-label ms-1" for="applyToAll"> Áp dụng toàn bộ cơ sở dữ liệu</label>
		  </div>
		  <hr>
		  
		  <div class="form-group mb-1 fade-in" style="animation-delay: 0.4s">
			<label class="form-label">Tình trạng đăng nhập</label>
			<div>
			  <input type="radio" id="success" value="true" v-model="loginStatus" class="form-check-input" />
			  <label for="success" class="form-check-label ms-1">Thành công</label>
			</div>
			<div>
			  <input type="radio" id="failure" value="false" v-model="loginStatus" class="form-check-input" />
			  <label for="failure" class="form-check-label ms-1">Thất bại</label>
			</div>
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
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  record: Object
});

const emit = defineEmits(['update:isOpen', 'save']);

const editedRecord = ref({ ...props.record });
const applyToAll = ref(false);
const loginStatus = ref(null);

watch(() => props.record, (newRecord) => {
  editedRecord.value = { ...newRecord };
}, { deep: true });

const closeModal = () => {
  const modalOverlay = document.querySelector('.modal-overlay');
  modalOverlay.classList.remove('animate__fadeIn');
  modalOverlay.classList.add('animate__fadeOut');

  setTimeout(() => {
    emit('update:isOpen', false);
	applyToAll.value = false;
  }, 300);
};

const saveChanges = () => {
  emit('save', { ...editedRecord.value, applyToAll: applyToAll.value, loginStatus: loginStatus.value });
  closeModal();
};
</script>
  
<style scoped>
.fade-in {
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}
.animate__fadeIn{
  animation: fadeIn 0.5s;
}
.animate__fadeOut{
  animation: fadeOut 0.5s;
}
.btn-close:focus {
  box-shadow: none;
  outline: none;
}
.modal-header{
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
  width: 600px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
</style>