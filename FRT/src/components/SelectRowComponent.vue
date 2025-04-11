<script setup>
import { ref } from "vue";
import $toast from '@/utils/VueToast';
import axios from 'axios';

const emit = defineEmits(["clear-selected", "reload"]);
const props = defineProps({
	selectedRows: {
		type: Object,
		required: true
	}
});

const isOpen = ref(false);
const editedRecord = ref({
	login_status: "pending",
	note: "",
});

const closeModal = () => {
	isOpen.value = false;
};

const handleProcessFiles = () => {
	// Reset trạng thái mỗi khi mở modal
	editedRecord.value.login_status = "pending";
	editedRecord.value.note = "";
	isOpen.value = true;
};

const saveChanges = async () => {
	try {
		const ids = Array.from(props.selectedRows.keys());
		if (ids.length === 0) {
			$toast.error("Không có bản ghi nào được chọn.");
			return;
		}

		const payload = {
			ids: ids,
			login_status: editedRecord.value.login_status,
			note: editedRecord.value.note,
		};

		const res = await axios.put("/api/records/batch/status", payload);

		if (res.status === 200) {
			$toast.success(res.data.message);
			closeModal();
			emit("reload");
		} else {
			$toast.error("Cập nhật thất bại.");
		}
	} catch (err) {
		console.error(err);
		$toast.error("Lỗi hệ thống khi cập nhật.");
	}
};
</script>

<template>
	<div class="log-header">
		<h5 class="sub-title">Tài khoản đã chọn</h5>
		<button class="reload-btn" @click="emit('clear-selected')">
			<fas-icon :icon="['fas', 'times']" class="text-danger" />
		</button>
	</div>

	<div class="selected-user-list mb-3">
		<transition-group name="list-fade" tag="ul">
			<li 
				v-for="([file, username], index) in Array.from(selectedRows.entries())" 
				:key="file"
			>
				<span class="index">{{ index + 1 }}.</span>
				<span class="username">{{ username }}</span>
			</li>
		</transition-group>
	</div>

	<button class="btn btn-warning text-white" @click="handleProcessFiles">Chỉnh sửa</button>
	<hr />

	<div v-if="isOpen" class="modal-overlay animate__animated animate__fadeIn">
		<div class="modal-container animate__animated">
			<div class="modal-header border-bottom">
				<h5 class="modal-title fw-bold">Chỉnh sửa thông tin</h5>
				<button @click="closeModal" class="btn-close close hover-shake" aria-label="Close"></button>
			</div>

			<div class="modal-body py-4">
				<div class="form-group mb-1 fade-in" style="animation-delay: 0.4s">
					<label class="form-label">Tình trạng đăng nhập</label>
					<div>
						<input type="radio" id="success" value="success" v-model="editedRecord.login_status" class="form-check-input" />
						<label for="success" class="form-check-label ms-1">Thành công</label>
					</div>
					<div>
						<input type="radio" id="failure" value="failure" v-model="editedRecord.login_status" class="form-check-input" />
						<label for="failure" class="form-check-label ms-1">Thất bại</label>
					</div>
					<div>
						<input type="radio" id="pending" value="pending" v-model="editedRecord.login_status" class="form-check-input" />
						<label for="pending" class="form-check-label ms-1">Chưa đăng nhập</label>
					</div>
				</div>
				<hr>
				<div class="form-group mb-1 fade-in" style="animation-delay: 0.5s">
					<label class="form-label">Ghi chú</label>
					<textarea
					v-model="editedRecord.note" 
					type="text" 
					rows="5"
					class="form-control hover-effect">
					</textarea>
				</div>
			</div>

			<div class="modal-footer">
				<button @click="closeModal" class="btn btn-secondary hover-effect me-1">Hủy</button>
				<button @click="saveChanges" class="btn btn-primary pulse-effect">Lưu</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.selected-user-list {
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	background: #f8f9fa;
	border: 1px solid #dee2e6;
	padding: 5px 15px;
	border-radius: 10px;
	max-height: 205px;
	overflow-y: auto;
}

.selected-user-list ul {
	list-style: none;
	padding: 0;
	margin: 0;
}

.selected-user-list li {
	padding: 6px 0;
	display: flex;
	align-items: center;
	border-bottom: 1px solid #e0e0e0;
}

.selected-user-list li:last-child {
	border-bottom: none;
}

.index {
	font-weight: bold;
	margin-right: 10px;
	color: #28a745;
	width: 15px;
	text-align: right;
}

.username {
	flex: 1;
	overflow-x: hidden;
}
</style>
