<template>
    <table class="table table-striped table-skeleton">
        <thead>
            <tr>
                <th v-for="n in 5" :key="n">
                    <div class="skeleton-cell"></div>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="n in 5" :key="n">
                <td v-for="n in 5" :key="n">
                    <div class="skeleton-cell"></div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.table-skeleton {
    width: 100%;
    border: 1px solid #DCDFE6; /* Viền xung quanh toàn bộ bảng */
    border-collapse: collapse; /* Xóa viền giữa các ô */
}

.table-skeleton th, .table-skeleton td {
    padding: 0.75em; /* Căn chỉnh khoảng cách trong ô */
    border: none !important; /* Gỡ bỏ viền mặc định */
}

.table-skeleton td {
    border-bottom: 1px solid #DCDFE6 !important; /* Viền dưới cho các ô dữ liệu */
}

.table-skeleton th {
    border-bottom: 1px solid #DCDFE6; /* Viền dưới cho tiêu đề */
}


.skeleton-cell {
    width: 100%;
    height: 20px;
    padding: 0.75em 0.75em 0.75em 0.75em;
    background-color: #e0e0e0;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    animation: slide 1.5s infinite ease-in-out;
}

@keyframes slide {
    0% {
        background-position: -200%;
    }
    50% {
        background-position: 50%;
    }
    100% {
        background-position: 200%;
    }
}

.skeleton-cell:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(200, 200, 200, 0.6) 50%, rgba(255, 255, 255, 0) 100%);
    animation: shine 1.5s infinite ease-in-out;
}

@keyframes shine {
    0% {
        left: -100%;
    }
    50% {
        left: 100%;
    }
    100% {
        left: 200%;
    }
}

.table thead th {
    background-color: #f8f9fa;
}

.table tbody td {
    border: 1px solid #ddd;
    padding: 10px;
}
</style>
