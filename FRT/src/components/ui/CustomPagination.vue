<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  totalRecords: Number, 
  totalPages: Number, 
  currentPage: Number
});

const emit = defineEmits(["change-page"]);

const pageInput = ref(props.currentPage);

// Khi currentPage thay đổi, cập nhật pageInput
watch(() => props.currentPage, (newPage) => {
  pageInput.value = newPage;
});

const handlePageChange = (page) => {
  const pageNumber = parseInt(page, 10);
  if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= props.totalPages) {
    emit("change-page", pageNumber);
  }
};
</script>

<template>
  <div class="vgt-wrap__footer vgt-clearfix">
    <div class="footer__navigation__page-info">
      <span>{{ totalRecords }} bản ghi</span>
    </div>
    <div class="footer__navigation">
      <button 
        class="footer__navigation__page-btn" 
        @click="handlePageChange(1)"
        :disabled="currentPage === 1"
      >
        ««
      </button>
      <button 
        class="footer__navigation__page-btn" 
        @click="handlePageChange(currentPage - 1)"
        :disabled="currentPage === 1"
      >
        «
      </button>
      
      <div class="footer__navigation__page-info"> 
        <input 
			autocomplete="off"
          type="text" 
          v-model="pageInput" 
          @keyup.enter="handlePageChange(pageInput)"
          class="pagination-input"
        /> 
        / {{ totalPages }}
      </div>
      
      <button 
        class="footer__navigation__page-btn" 
        @click="handlePageChange(currentPage + 1)"
        :disabled="currentPage === totalPages"
      >
        »
      </button>
      <button 
        class="footer__navigation__page-btn" 
        @click="handlePageChange(totalPages)"
        :disabled="currentPage === totalPages"
      >
        »»
      </button>
    </div>
  </div>
</template>
