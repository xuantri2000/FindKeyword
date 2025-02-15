<script setup>
import { ref, onMounted, watch } from "vue";
import $toast from '@/utils/VueToast';
import axios from 'axios';
import LogExecComponent from '@/components/LogExecComponent.vue';
</script>

<template>
	<section id="homeview">
		<div class="row">
			<div class="col-md-7">
				<h5 class="sub-title">Tìm kiếm tài khoản lộ lọt</h5>
			</div>
			<div class="col-md-5">
				<LogExecComponent></LogExecComponent>
			</div>
		</div>
	</section>
</template>
