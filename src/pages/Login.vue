<template>
  <div class="container">
    <div class="login">
      <div class="welcome">
        <n-gradient-text type="info" :size="48">欢迎登录</n-gradient-text>
        <p>
          <n-gradient-text type="success" :size="26" style="letter-spacing: 8px"
            >博客后台管理系统</n-gradient-text
          >
        </p>
      </div>
      <div class="form">
        <n-form :model="loginModel" ref="formRef" :rules="rules">
          <n-form-item path="email" label="邮箱">
            <n-input
              v-model:value="loginModel.email"
              @keydown.enter.prevent
              size="large"
              placeholder="请输入邮箱"
            />
          </n-form-item>
          <n-form-item path="password" label="密码">
            <n-input
              v-model:value="loginModel.password"
              type="password"
              size="large"
              placeholder="请输入密码"
            />
          </n-form-item>
          <div class="buttons">
            <n-button type="default" @click="reset">重置</n-button>
            <n-button type="info" @click="login">登录</n-button>
          </div>
        </n-form>
      </div>
    </div>
    <div class="decoration">
      <p class="words">{{ blessings }}</p>
    </div>
  </div>
</template>

<script setup>
import useLogin from "../utils/useLogin";
const { formRef, loginModel, rules, login, reset } = useLogin();
function welcome () {
  const date = new Date()
  const hour = date.getHours()
  let words = ''
  if (hour > 18 || (hour > 1 && hour < 6)) {
    words = 'Good Evening !'
  } else if (hour > 12) {
    words = 'Good Afternoon !'
  } else {
    words = 'Good Morning !'
  }
  return words
}
const blessings = welcome()
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  .login {
    width: 33%;
    padding: 1% 4%;
    .welcome {
      position: relative;
      top: 15%;
    }
    .form {
      top: 23%;
      .buttons {
        display: flex;
        justify-content: space-between;
      }
    }
  }
  .decoration {
    position: relative;
    flex: 1;
    background-image: url(../assets/login-bg.jpg);
    background-size: cover;
    animation: backgroundWalkY linear 70s infinite alternate forwards;
    &::after {
      content: " ";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: false;
      background-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 65%,
        rgba(0, 0, 0, 0.65) 100%
      );
      z-index: 1;
    }
    .words {
      position: absolute;
      bottom: 40px;
      left: 40px;
      z-index: 10;
      color: #fff;
      font-size: 46px;
    }
  }
}
@keyframes backgroundWalkY {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100%;
  }
}
</style>
