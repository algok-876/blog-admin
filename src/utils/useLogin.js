import { reactive, ref } from "vue";

// 登录数据
const loginModel = reactive({
  email: "",
  password: "",
});

// 登录表单实例
const formRef = ref(null)

// 验证规则
const rules = {
  email: [
    {
      required: true,
      message: "请输入邮箱"
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码"
    },
  ]
}

// 登录
function login () {
  formRef.value.validate(errors => {
    if (!errors) {
      console.log('验证成功')
    }
  })
}

// 重置表单
function reset () {
  loginModel.email = ''
  loginModel.password = ''
}

export default function () {
  return {
    formRef,
    loginModel,
    rules,
    login,
    reset
  }
}
