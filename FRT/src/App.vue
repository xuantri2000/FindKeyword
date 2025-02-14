<script setup>
import { RouterLink, RouterView } from 'vue-router';
import feather from 'feather-icons';
import { onMounted } from 'vue';

onMounted(() => {
  feather.replace();
});
</script>

<template>
  <header>
	<nav class="navbar">
		<ul class="navbar__menu">
			<li class="navbar__item">
				<RouterLink href="#" class="navbar__link"><i data-feather="home"></i><span>Home</span></RouterLink>
			</li>
			<li class="navbar__item">
				<RouterLink	RouterLink href="#" class="navbar__link"><i data-feather="message-square"></i><span>Messages</span></RouterLink>        
			</li>
			<li class="navbar__item">
				<RouterLink href="#" class="navbar__link"><i data-feather="users"></i><span>Customers</span></RouterLink>        
			</li>
			<li class="navbar__item">
				<RouterLink href="#" class="navbar__link"><i data-feather="folder"></i><span>Projects</span></RouterLink>        
			</li>
		</ul>
	</nav>
  </header>

  <RouterView />
</template>