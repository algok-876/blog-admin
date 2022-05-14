<template>
  <n-layout style="height: 100vh">
    <n-layout-header bordered position="relative">
      <div class="header">
        <div class="logo">
          <img src="../assets/logo.png" alt="" />
        </div>
        <h1>
          <n-gradient-text :size="28" type="success">
            博客后台管理系统
          </n-gradient-text>
        </h1>
      </div>
      <user-avatar></user-avatar>
    </n-layout-header>
    <n-layout has-sider position="absolute" style="top: 64px; bottom: 0">
      <n-layout-sider
        collapse-mode="width"
        :collapsed-width="70"
        :width="240"
        show-trigger="arrow-circle"
        :native-scrollbar="false"
        bordered
        :collapsed="collapsed"
        @collapse="collapsed = true"
        @expand="collapsed = false"
      >
        <n-menu
          :options="menuOptions"
          :collapsed="collapsed"
          :collapsed-width="70"
          v-model:value="menuStore.menuItemKey"
        ></n-menu>
      </n-layout-sider>
      <n-layout-content
        content-style="padding: 24px;"
        :native-scrollbar="false"
      >
        <router-view></router-view>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup>
import { ref } from "vue"
import menuOptions from "../utils/menu"
import userAvatar from "../components/userAvatar.vue"
import { useMenuStore } from "../stores/menu"
const collapsed = ref(false)
const menuStore = useMenuStore()
</script>
<style lang="scss" scoped>
.n-layout-header {
  display: flex;
  padding: 0 20px;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  // background-color: #e2e1e4;
}
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  .logo {
    margin-right: 1em;
    img {
      width: 70px;
    }
  }
}
.n-menu-item-content-header {
  color: #fff;
}
</style>
