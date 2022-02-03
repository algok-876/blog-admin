<template>
  <div class="user-tool">
    <n-avatar size="large" round style="marign-right: 25px;">W</n-avatar>
    <n-dropdown 
    :options="options" 
    trigger="click"
    @select="onSelect"
    >
      <n-button text>Wang Wei</n-button>
    </n-dropdown>
  </div>
</template>

<script setup>
import { h } from "vue";
import { NIcon } from "naive-ui";
import {
  PersonCircleOutline as UserIcon,
  Pencil as EditIcon,
  LogOutOutline as LogoutIcon,
} from "@vicons/ionicons5";

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
function onSelect (key, options) {
  if (key === 'logout') {
    // 退出登录
  } else if (key === 'editProfile') {
    // 编辑用户资料
  } else {
    // 个人中心
  }
}
</script>

<style lang="scss" scoped>
.user-tool {
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>