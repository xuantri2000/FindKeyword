<script setup>
import { RouterLink, RouterView } from 'vue-router';
import Logo from '@/components/Logo.vue';
import feather from 'feather-icons';
import { onMounted } from 'vue';

onMounted(() => {
  feather.replace();
});
</script>

<template>
<div class="layout">
	<nav class="navbar">
		<ul class="navbar__menu">
			<li class="navbar__item">
				<RouterLink class="navbar__link" to="/"><i data-feather="home"></i><span>Home</span></RouterLink>
			</li>
			<li class="navbar__item">
				<RouterLink class="navbar__link" to="/about"><i data-feather="message-square"></i><span>Blacklist</span></RouterLink>
			</li>
		</ul>
	</nav>

	<main class="page-content">
		<div class="title-section">
			<h1 class="title"><Logo></Logo> Công cụ tìm kiếm tải khoản lộ lọt</h1>
		</div>
		<div class="container pt-2">
			<RouterView />
		</div>
	</main>
</div>
</template>