import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import {
  create,
  NButton,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NLayoutHeader,
  NMenu,
  NIcon,
  NAvatar,
  NGradientText,
  NDropdown,
  NForm,
  NFormItem,
  NInput
} from "naive-ui";

const naive = create({
  components: [
    NButton,
    NLayout,
    NLayoutSider,
    NLayoutContent,
    NLayoutHeader,
    NMenu,
    NIcon,
    NAvatar,
    NGradientText,
    NDropdown,
    NForm,
    NFormItem,
    NInput
  ],
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(naive);

app.mount("#app");
