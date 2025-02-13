<script setup>
import { ref, onMounted } from "vue";

const message = ref("");

onMounted(async () => {
    try {
        const response = await fetch("api/records/select");
        const data = await response.json();
        message.value = data.message;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});
</script>

<template>
  <div>
    <h1>Search App</h1>
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
h1 {
    color: #42b983;
}
</style>
