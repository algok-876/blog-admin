import { createApp } from "vue";
import store from "./stores";
import { useUserStore } from "./stores/user";
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
  NInput,
  NMessageProvider,
  NSelect,
  NGrid,
  NGridItem,
  NDataTable,
  NDialogProvider,
  NModal,
  NCheckbox,
  NCheckboxGroup,
  NPagination,
  NSpace,
  NDatePicker,
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
    NInput,
    NMessageProvider,
    NSelect,
    NGrid,
    NGridItem,
    NDataTable,
    NDialogProvider,
    NModal,
    NCheckbox,
    NCheckboxGroup,
    NPagination,
    NSpace,
    NDatePicker,
  ],
});
const app = createApp(App);
app.use(router);
app.use(store);
app.use(naive);

app.mount("#app");
