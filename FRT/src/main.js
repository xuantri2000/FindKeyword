import './assets/main.css';
import "@/assets/bootstrap/css/bootstrap.css";
import "@/assets/bootstrap/js/bootstrap.bundle.min.js";

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Import Vue Toast Notification
import 'vue-toast-notification/dist/theme-sugar.css';

const app = createApp(App);

app.use(router);
app.mount("#app");
