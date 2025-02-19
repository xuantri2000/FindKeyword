<template>
	<div class="skeleton-container">
	  <div class="skeleton-header"></div>
	  <div v-for="i in 5" :key="i" class="skeleton-item"></div>
	</div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .skeleton-container {
	overflow-y: auto;
	max-height: 50vh;
	margin-top: 10px;
	background: #f8f9fa;
	padding: 15px;
	border-radius: 8px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
	display: flex;
	flex-direction: column;
	gap: 10px;
  }
  
  .skeleton-header {
	width: 50%;
	height: 16px;
	background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 4px;
  }
  
  .skeleton-item {
	width: 100%;
	height: 20px;
	background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 4px;
  }
  
  @keyframes loading {
	0% {
	  background-position: 200% 0;
	}
	100% {
	  background-position: -200% 0;
	}
  }
  </style>
  