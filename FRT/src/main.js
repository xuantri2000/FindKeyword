import './assets/main.css';
import "@/assets/bootstrap/css/bootstrap.css";
import "@/assets/bootstrap/js/bootstrap.bundle.min.js";
import { VueGoodTable } from 'vue-good-table-next';

// Import Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faAdd, faEdit, faTrash, faBan, faSync, faRedo, faFolderOpen, faFolder, faSearch, faBullseye } from '@fortawesome/free-solid-svg-icons';

// Thêm các icon vào thư viện
library.add(faEdit, faTrash, faBan, faSync, faRedo, faFolderOpen, faFolder, faAdd, faSearch, faBullseye);

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Import Vue Toast Notification
import 'vue-toast-notification/dist/theme-sugar.css';

const app = createApp(App);

app.use(router);

// Đăng ký global components
app.component('fas-icon', FontAwesomeIcon);
app.component('VueGoodTable', VueGoodTable);

app.mount("#app");
