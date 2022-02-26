<template>
  <div class="profile">
    <n-divider title-placement="left" dashed>
      <n-gradient-text type="info" :size="18"> 基本信息 </n-gradient-text>
    </n-divider>
    <n-space :vertical="true" class="content" :size="30">
      <n-space align="center">
        <div class="label">邮箱</div>
        <n-input :value="userInfo.email" type="text" :readonly="true" />
      </n-space>
      <n-space align="center">
        <div class="label">用户名</div>
        <n-space>
          <n-input v-model:value="username" type="text" />
          <n-button type="primary">修改用户名</n-button>
        </n-space>
      </n-space>
      <n-space align="center">
        <div class="label">你当前的角色</div>
        <div>
          <n-tag
            type="info"
            v-for="(role, index) in userInfo.roles"
            :key="index"
          >
            {{ role.name }}
          </n-tag>
        </div>
      </n-space>
    </n-space>

    <n-divider title-placement="left" dashed>
      <n-gradient-text type="info" :size="18"> 更改密码 </n-gradient-text>
    </n-divider>

    <n-space class="content">
      <n-form
        :model="updatePwd"
        ref="formRef"
        :rules="rules"
        label-placement="left"
      >
        <n-form-item path="old_password" label="旧密码">
          <n-input
            v-model:value="updatePwd.old_password"
            @keydown.enter.prevent
            placeholder="请输入旧密码"
          />
        </n-form-item>
        <n-form-item path="new_password" label="新密码">
          <n-input
            v-model:value="updatePwd.new_password"
            type="password"
            placeholder="请输入新密码"
          />
        </n-form-item>
        <n-form-item path="confirm_password" label="确认新密码">
          <n-input
            v-model:value="updatePwd.confirm_password"
            type="password"
            placeholder="请再次确认密码"
          />
        </n-form-item>
        <div class="buttons">
          <n-space>
            <n-button type="default" @click="reset">重置</n-button>
            <n-button type="info" @click="updatePassword">确认更改，重新登录</n-button>
          </n-space>
        </div>
      </n-form>
    </n-space>

    <n-divider title-placement="left" dashed>
      <n-gradient-text type="info" :size="18"> 更改头像 </n-gradient-text>
    </n-divider>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { clearForm } from "../utils/form"
import { updateUserPassword } from '@/api' 
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
const message = useMessage()
const router = useRouter()
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
const formRef = ref(null)
// 用户名model
const username = ref(userInfo.value.username);
// 更新密码表单model
const updatePwd = reactive({
  old_password: "",
  new_password: "",
  confirm_password: "",
});
// 表单验证规则
const rules = {
  old_password: [{ required: true, message: "请填写旧密码" }],
  new_password: [{ required: true, message: "请填写新密码" }],
  confirm_password: [
    {
      validator(rule, value) {
        console.log(value)
        if (value !== updatePwd.new_password) {
          return new Error("两次密码不一致");
        }
        return true;
      },
    },
  ],
};

// 用户修改密码
async function updatePassword () {
  try {
    await formRef.value.validate()
    const result = await updateUserPassword(
      updatePwd.old_password,
      updatePwd.new_password,
      updatePwd.confirm_password
    )
    // 成功
    message.success(result.message)
    // 退出登录
    userStore.logout()
    router.push({
      name: 'Login'
    })
  } catch (err) {
    // 提示错误信息
    err.message && message(err.message)
  }
}

// 重置表单
function reset () {
  clearForm(updatePwd, formRef)
}

</script>

<style lang="scss">
.profile {
  .content {
    margin-left: 45px;
  }
  .label {
    width: 100px;
  }
  .n-form-item-label {
    width: 112px;
    text-align: left;
  }
}
</style>