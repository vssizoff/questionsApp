import {createApp} from "vue";
import App from "./App.vue";
import router from "./router.js";
import axios from "axios";
import {SERVER_BASE_URL} from "@/api/index.js";
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';

axios.defaults.baseURL = SERVER_BASE_URL;
axios.interceptors.response.use(response => response, error => error);

const app = createApp(App);
app.use(ToastService);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: true
        }
    },
    ripple: true
});

app.mount('#app');