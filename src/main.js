import { createApp } from "vue";
import store from "./stores";
import App from "./App.vue";
import router from "./router";
import naive from "./naive-ui";

const app = createApp(App);
app.use(router);
app.use(store);
app.use(naive);

app.mount("#app");
