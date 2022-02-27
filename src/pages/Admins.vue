<template>
  <div class="header">
    <n-button type="info" @click="userModal = true">添加用户</n-button>
  </div>
  <n-data-table
    :columns="columns"
    :data="data.adminList"
    :single-line="false"
    :scroll-x="1600"
  />
  <!-- 添加用户表单 -->
  <n-modal
    v-model:show="userModal"
    preset="dialog"
    title="添加用户"
    :show-icon="false"
    positive-text="添加"
    @positive-click="addUser"
    negative-text="取消"
    style="width: 600px"
  >
    <n-form
      :style="{ marginTop: '20px' }"
      :label-width="80"
      :model="userFrom"
      :rules="userRules"
      ref="userFormRef"
    >
      <n-form-item label="用户名" path="username" label-placement="left">
        <n-input v-model:value="userFrom.username" placeholder="输入用户名" />
      </n-form-item>
      <n-form-item label="密码" path="password" label-placement="left">
        <n-input
          type="password"
          v-model:value="userFrom.password"
          placeholder="输入密码"
          :maxlength="16"
        />
      </n-form-item>
      <n-form-item label="邮箱" path="email" label-placement="left">
        <n-input v-model:value="userFrom.email" placeholder="输入邮箱" />
      </n-form-item>
    </n-form>
  </n-modal>

  <!-- 调整用户角色 -->
  <n-modal
    v-model:show="userRolesModal"
    preset="dialog"
    title="调整用户角色"
    :show-icon="false"
    positive-text="确定调整"
    @positive-click="modifyRoles"
    negative-text="取消"
    style="width: 600px"
  >
    <n-form
      :style="{ marginTop: '20px' }"
      :label-width="80"
      :model="rolesFrom"
      :rules="roleRules"
      ref="rolesFormRef"
    >
      <n-form-item label="角色" path="roleIds" label-placement="left">
        <n-select
          v-model:value="rolesFrom.roleIds"
          multiple
          :options="data.rolesList"
        />
      </n-form-item>
    </n-form>
  </n-modal>
</template>


<script setup>
import {
  getAdminList,
  getRolesList,
  createUser,
  deleteUser,
  modifyUserRole,
} from "@/api";
import { reactive, onMounted, h, ref } from "vue";
import { NButton, NPopconfirm, NTag, NAvatar } from "naive-ui";
import { dateToString } from "@/utils/tool.js";
import { clearForm } from "@/utils/form";
// 组件数据
const data = reactive({
  adminList: [],
  rolesList: [],
});
const rolesFrom = reactive({
  userId: "",
  roleIds: [],
});
const userFrom = reactive({
  username: "",
  email: "",
  password: "",
});
const userFormRef = ref(null);
const rolesFormRef = ref(null);
const userRolesModal = ref(false);
const userModal = ref(false);
// 添加用户表单验证
const userRules = {
  username: {
    required: true,
    message: "请输入用户名",
    trigger: "blur",
  },
  password: {
    required: true,
    message: "请输入密码",
    trigger: "blur",
  },
  email: {
    required: true,
    message: "请输入邮箱",
    trigger: "blur",
  },
};
// 角色表单验证
const roleRules = {
  roleIds: {
    required: true,
    trigger: "input",
    validator: (rule, value) => {
      return new Promise((resolve, reject) => {
        if (value.length === 0) {
          reject(Error("请选择用户角色"));
        } else {
          resolve();
        }
      });
    },
  },
};

const createColumns = ({ showModifyModel, remove }) => {
  return [
    {
      title: "用户名",
      key: "username",
      fixed: "left",
    },
    {
      title: "头像",
      key: "avatar",
      render(row) {
        return h(
          NAvatar,
          {
            round: true,
            size: "large",
            src: row.avatar,
          },
          {}
        );
      },
    },
    {
      title: "邮箱",
      key: "email",
    },
    {
      title: "角色",
      key: "roles",
      sorter: {
        compare: (a, b) => a.roles.length - b.roles.length,
        multiple: 1,
      },
      render(row) {
        const tags = row.roles.map((tagKey) => {
          return h(
            NTag,
            {
              style: {
                marginRight: "6px",
              },
              type: "info",
            },
            {
              default: () => tagKey.name,
            }
          );
        });
        return tags;
      },
    },
    {
      title: "创建时间",
      key: "create_at",
      sorter: {
        compare: (a, b) => new Date(a.create_at) - new Date(b.create_at),
        multiple: 1,
      },
      render(row) {
        return dateToString(row.create_at);
      },
    },
    {
      title: "操作",
      key: "actions",
      fixed: "right",
      width: "190",
      render(row) {
        return [
          h(
            NButton,
            {
              type: "info",
              onClick: () => showModifyModel(row),
            },
            { default: () => "调整角色" }
          ),
          h(
            NPopconfirm,
            {
              negativeText: "取消",
              positiveText: "删除",
              onPositiveClick: () => remove(row),
            },
            {
              default: () => "您确定要删除此用户吗？",
              trigger: () =>
                h(
                  NButton,
                  {
                    type: "warning",
                    style: {
                      marginLeft: "20px",
                    },
                  },
                  {
                    default: () => "删除",
                  }
                ),
            }
          ),
        ];
      },
    },
  ];
};
let columns = createColumns({
  showModifyModel,
  remove,
});

// 添加用户
async function addUser() {
  const errors = await userFormRef.value.validate();
  userFrom.username = userFrom.username.trim();
  userFrom.password = userFrom.password.trim();
  userFrom.email = userFrom.email.trim();
  if (!errors) {
    let result = await createUser(userFrom);
    if (result.code === "200") {
      window.$message.success(result.message);
      clearForm(userFrom, userFormRef);
      initAdminList();
      return true;
    }
  } else {
    let errorArr = [];
    errors.forEach((item) => {
      errorArr.push(item[0].message);
    });
    let error = errorArr.join(",");
    console.log(error);
    window.$message.error(error);
  }
  return false;
}

// 显示调整用户角色模态框
function showModifyModel(row) {
  rolesFrom.userId = "";
  rolesFrom.roleIds = [];
  userRolesModal.value = true;
  rolesFrom.userId = row._id;
  row.roles.forEach((item) => {
    rolesFrom.roleIds.push(item._id);
  });
}
// 删除用户
async function remove(row) {
  // console.log(row)
  let result = await deleteUser(row._id);
  window.$message.success(result.message);
  initAdminList();
}

// 调整角色权限
async function modifyRoles() {
  const errors = await rolesFormRef.value.validate();
  if (!errors) {
    rolesFrom.roleIds = rolesFrom.roleIds.join(",");
    let result = await modifyUserRole(rolesFrom);
    window.$message.success(result.message);
    clearForm(rolesFrom, rolesFormRef);
    initAdminList();
    return true;
  } else {
    let errorArr = [];
    errors.forEach((item) => {
      errorArr.push(item[0].message);
    });
    let error = errorArr.join(",");
    window.$message.error(error);
  }
  return false;
}

async function initAdminList() {
  let result = await getAdminList();
  data.adminList = result.data;
}

async function initRolesList() {
  let result = await getRolesList();
  result.data.forEach((role) => {
    data.rolesList.push({
      label: role.name,
      value: role._id,
    });
  });
}
onMounted(() => {
  initAdminList();
  initRolesList();
});
</script>

<style lang="scss" scoped>
.header {
  margin-bottom: 20px;
}
.form {
  margin: 30px 0;
}
</style>
