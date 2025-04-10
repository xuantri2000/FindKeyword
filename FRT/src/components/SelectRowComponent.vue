<script setup>
import { ref, onMounted, watch, onUpdated  } from "vue";
import $toast from '@/utils/VueToast';
import axios from 'axios';

const emit = defineEmits(["clear-selected"]);
const props = defineProps({
	selectedRows: {
		type: Object,
		required: true
	}
});

</script>

<template>
	<div data-v-e50a022f="" class="log-header">
		<h5 data-v-e50a022f="" class="sub-title">Tài khoản đã chọn</h5>
		<button class="reload-btn" @click="emit('clear-selected')">
			<fas-icon :icon="['fas', 'times']" class="text-danger" />
		</button>
	</div>
	<div class="selected-user-list mb-3">
	  <ul>
		<transition-group name="list-fade" tag="ul">
			<li 
				v-for="([file, username], index) in Array.from(selectedRows.entries())" 
				:key="file"
			>
				<span class="index">{{ index + 1 }}.</span>
				<span class="username">{{ username }}</span>
			</li>
		</transition-group>
	  </ul>
	</div>
	<button class="btn btn-warning text-white" @click="handleProcessFiles">Chỉnh sửa</button>
	<hr>
</template>
  <style scoped>
  .selected-user-list {
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	background: #f8f9fa;
	border: 1px solid #dee2e6;
	padding: 15px 20px;
	border-radius: 10px;
	/* box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); */
	max-height: 300px;
	overflow-y: auto;
  }

  .username{
	overflow-x: hidden;
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
  }
  </style>
  