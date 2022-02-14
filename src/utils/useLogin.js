import { reactive, ref } from "vue";
import { useUserStore } from "../stores/user";
import store from "../stores";
const userStore = useUserStore(store);

// 登录数据
const loginModel = reactive({
  email: "",
  password: "",
});

// 登录表单实例
const formRef = ref(null);

// 验证规则
const rules = {
  email: [
    {
      required: true,
      message: "请输入邮箱",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
    },
  ],
};

// 登录
function login(cb) {
  formRef.value.validate(async (errors) => {
    if (!errors) {
      try {
        const res = await userStore.login(
          loginModel.email,
          loginModel.password
        );
        cb();
      } catch (err) {
        console.log(err);
        window.$message.error("邮箱或密码错误，请检查");
      }
    }
  });
}

// 重置表单
function reset() {
  loginModel.email = "";
  loginModel.password = "";
}

export default function () {
  return {
    formRef,
    loginModel,
    rules,
    login,
    reset,
  };
}
