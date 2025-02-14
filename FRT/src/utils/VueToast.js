// src/utils/VueToast.js
import { useToast } from 'vue-toast-notification';

const $toast = useToast({
    position: 'top-right',
    duration: 3000,
    dismissible: true,
});

export default $toast;
