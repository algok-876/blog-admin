<template>
  <div class="header">
    <n-button type="info" @click="showRoleModal = true">添加角色</n-button>
  </div>
  <n-data-table :columns="columns" :data="data.roleList" :single-line="false" />

  <!-- 添加角色模态框 -->
  <n-modal
    v-model:show="showRoleModal"
    preset="dialog"
    title="添加角色"
    :show-icon="false"
    positive-text="添加角色"
    @positive-click="addRole"
    negative-text="取消"
    style="width: 600px"
  >
    <template #header>添加角色 </template>
    <div class="form">
      <n-form
        :model="roleModel"
        ref="formRef"
        :rules="roleFormRules"
        label-placement="left"
        :show-require-mark="false"
      >
        <n-form-item path="name" label="角色名称">
          <n-input v-model:value="roleModel.name" />
        </n-form-item>
        <n-form-item path="code" label="角色代码">
          <n-input v-model:value="roleModel.code" />
        </n-form-item>
        <n-form-item path="description" label="角色描述">
          <n-input v-model:value="roleModel.description" />
        </n-form-item>
      </n-form>
    </div>
  </n-modal>

  <!-- 调整角色权限 -->
  <n-modal
    v-model:show="showPermissionModal"
    preset="dialog"
    title="调整用户权限"
    :show-icon="false"
    positive-text="确定调整"
    @positive-click="modifyPermission"
    negative-text="取消"
    style="width: 600px"
  >
    <n-checkbox-group v-model:value="mPermissionCodes">
      <n-grid x-gap="20" y-gap="10" :cols="5">
        <n-gi v-for="permission in data.permission" :key="permission.code">
          <n-checkbox :value="permission.code" :label="permission.name" />
        </n-gi>
      </n-grid>
    </n-checkbox-group>
  </n-modal>
</template>

<script setup>
import {
  getRoleList,
  deleteRole,
  createRole,
  getPermissions,
  getRolePermiss,
  modifyRolePermission,
} from "@/api";
import { reactive, onMounted, h, ref } from "vue";
import { NButton, NPopconfirm } from "naive-ui";
import { clearForm } from "@/utils/form";
// 组件数据
const data = reactive({
  roleList: [],
  permission: [],
  rolePermission: [],
  curOperateRole: "",
});
const showRoleModal = ref(false);
const showPermissionModal = ref(false);
const formRef = ref(null);
const mPermissionCodes = ref([]);

const roleModel = reactive({
  name: "",
  code: "",
  description: "",
});

// 表单验证规则
const roleFormRules = {
  name: [
    {
      required: true,
      message: "请输入角色名称",
    },
  ],
  code: [
    {
      required: true,
      message: "请输入角色代码",
    },
  ],
};

const createColumns = ({ showModifyModel, remove }) => {
  return [
    {
      title: "角色名称",
      key: "name",
    },
    {
      title: "角色代码",
      key: "code",
    },
    {
      title: "描述",
      key: "description",
    },
    {
      title: "操作",
      key: "actions",
      render(row) {
        return [
          h(
            NButton,
            {
              type: "info",
              onClick: () => showModifyModel(row),
            },
            { default: () => "调整权限" }
          ),
          h(
            NPopconfirm,
            {
              negativeText: "取消",
              positiveText: "删除",
              onPositiveClick: () => remove(row),
            },
            {
              default: () => "您确定要删除此角色吗？",
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

// 显示模态框
async function showModifyModel(row) {
  data.curOperateRole = row._id;
  showPermissionModal.value = true;
  // 获取角色拥有的权限
  const res = await getRolePermiss(row._id);
  data.rolePermission = res.data;
  mPermissionCodes.value = res.data.map((x) => x.code);
}

// 调整角色权限
async function modifyPermission() {
  // 权限 code 请求参数
  const permissionCodes = Object.values(mPermissionCodes.value).join(",");
  const res = await modifyRolePermission({
    roleId: data.curOperateRole,
    permissionCodes,
  });
  window.$message.success(res.message);
}

// 删除角色
async function remove(row) {
  const res = await deleteRole(row._id);
  // 更改原来的数据，更新ui
  data.roleList.forEach((role, index) => {
    if (role._id === row._id) {
      data.roleList.splice(index, 1);
      return;
    }
  });
}

// 添加角色
async function addRole() {
  const error = await formRef.value.validate();
  if (!error) {
    const res = await createRole({
      ...roleModel,
    });
    data.roleList.push(res.data);
    clearForm(roleModel, formRef);
    return true;
  }
  return false;
}

const columns = createColumns({
  showModifyModel,
  remove,
});

onMounted(async () => {
  const roleData = await getRoleList();
  data.roleList = roleData.data;
  const permissionData = await getPermissions();
  data.permission = permissionData.data;
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
