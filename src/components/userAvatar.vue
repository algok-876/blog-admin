<template>
  <div class="user-tool">
    <n-space align="center">
      <n-avatar size="large" round v-if="!userInfo.avatar">{{
        username.substr(0, 1).toUpperCase()
      }}</n-avatar>
      <n-avatar size="large" :src="userInfo.avatar" round v-else></n-avatar>
      <n-dropdown :options="options" trigger="click" @select="onSelect">
        <n-button text>{{ username }}</n-button>
      </n-dropdown>
    </n-space>
  </div>
</template>

<script setup>
import { h, computed } from "vue";
import { NIcon } from "naive-ui";
import {
  PersonCircleOutline as UserIcon,
  Pencil as EditIcon,
  LogOutOutline as LogoutIcon,
} from "@vicons/ionicons5";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
const userStore = useUserStore();
const router = useRouter();
const { userInfo } = storeToRefs(userStore);

// 用户名首字母
const username = computed(() => {
  return userInfo.value ? userInfo.value.username : "";
});

console.log(userStore);
const renderIcon = (icon) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon),
    });
  };
};

const options = [
  {
    label: "个人中心",
    key: "profile",
    icon: renderIcon(UserIcon),
  },
  {
    label: "编辑用户资料",
    key: "editProfile",
    icon: renderIcon(EditIcon),
  },
  {
    label: "退出登录",
    key: "logout",
    icon: renderIcon(LogoutIcon),
  },
];

// 下拉菜单选择事件
function onSelect(key, options) {
  if (key === "logout") {
    // 退出登录
    userStore.logout().then(() => {
      router.push({
        name: "Login",
      });
    });
  } else if (key === "editProfile") {
    // 编辑用户资料
  } else {
    // 个人中心
    router.push({
      name: "Profile",
    });
  }
}
</script>

<style lang="scss" scoped>
.user-tool {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
