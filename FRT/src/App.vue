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
				<RouterLink class="navbar__link" to="/"><i data-feather="home"></i><span>Home</span></RouterLink>
			</li>
			<li class="navbar__item">
				<RouterLink class="navbar__link" to="/about"><i data-feather="message-square"></i><span>About</span></RouterLink>        
			</li>
		</ul>
	</nav>
  </header>

  <main class="page-content">
	<RouterView />
  </main>
</template>