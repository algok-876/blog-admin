<template>
  <n-space justify="left" style="margin-bottom: 15px" class="header">
    <n-button @click="AddTag" type="info">添加一个标签</n-button>
    <n-grid x-gap="20" :cols="2">
      <n-gi>
        <n-input
          placeholder="搜索关键字"
          v-model:value="keyword"
          clearable
          @clear="clearKeyword"
          @keydown.enter="filterTags"
        ></n-input>
      </n-gi>
      <n-gi>
        <n-date-picker
          start-placeholder="选择开始日期"
          end-placeholder="选择结束日期"
          type="datetimerange"
          clearable
          v-model:value="dateRange"
          :default-time="['00:00:00', '23:59:59']"
          @update:value="filterTags"
        />
      </n-gi>
    </n-grid>
  </n-space>
  <div class="tags-list">
    <n-data-table
      :columns="columns"
      :data="tagsList"
      :single-line="false"
      :scroll-x="900"
    />
  </div>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="isCreate ? '创建标签' : '更新标签'"
    :positive-text="isCreate ? '确认创建' : '确认更新'"
    @positive-click="handleValidateClick"
    negative-text="取消"
  >
    <n-form
      :style="{ marginTop: '20px' }"
      :label-width="80"
      :model="formValue"
      :rules="rules"
      ref="formRef"
    >
      <n-form-item label="标签名称" path="name" label-placement="left">
        <n-input v-model:value="formValue.name" placeholder="输入标签名称" />
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<script setup>
import { onMounted, ref, h, reactive } from "vue";
import { getTags, createTag, deleteTag, updataTag } from "@/api/index.js";
import { NButton } from "naive-ui";
import { dateToString } from "@/utils/tool.js";

let tagsList = ref([]);
const createColumns = ({ onUpdata, onDelete }) => {
  return [
    {
      title: "标签名称",
      key: "name",
      mavWidth: 350,
      ellipsis: true,
    },
    {
      title: "该标签下文章总数",
      key: "article_count",
      sorter: {
        compare: (a, b) => a.article_count - b.article_count,
        multiple: 2,
      },
    },
    {
      title: "创建日期",
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
      width: 200,
      render(row, index) {
        return [
          h(
            NButton,
            {
              onClick: () => onUpdata(row, index),
              type: "info",
              style: {
                marginRight: "3px",
              },
            },
            {
              default: () => "修改",
            }
          ),
          h(
            NButton,
            {
              onClick: () => onDelete(row, index),
              type: "warning",
              style: {
                marginRight: "3px",
              },
            },
            {
              default: () => "删除",
            }
          ),
        ];
      },
    },
  ];
};

// 标签表单变量以及规则
let showModal = ref(false);
let isCreate = ref(null);
const formRef = ref(null);
let formValue = reactive({
  name: "",
  id: "",
});
const rules = {
  name: {
    required: true,
    message: "请输入标签名称",
    trigger: "blur",
  },
};
// 验证表单并提交
function handleValidateClick() {
  formRef.value.validate(async (errors) => {
    formValue.name = formValue.name.trim();
    if (!errors) {
      if (isCreate.value) {
        await createTag({ name: formValue.name })
          .then((result) => {
            window.$message.success(result.message);
            resetForm();
            initTagsList();
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        await updataTag(formValue.id, { name: formValue.name })
          .then((result) => {
            console.log(result);
            window.$message.success(result.message);
            resetForm();
            initTagsList();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } else {
      let errorArr = [];
      errors.forEach((item) => {
        errorArr.push(item[0].message);
      });
      let error = errorArr.join(",");
      window.$message.error(error);
    }
  });
}

// 添加标签
function AddTag() {
  resetForm();
  isCreate.value = true;
  showModal.value = true;
}

// 重置表单
function resetForm() {
  Object.keys(formValue).forEach((key) => (formValue[key] = ""));
}

const onUpdata = async function (row) {
  // 调用一次接口判断该用户是否有权限
  await updataTag(row._id, { name: row.name });
  resetForm();
  isCreate.value = false;
  showModal.value = true;
  formValue.name = row.name;
  formValue.id = row._id;
};
const onDelete = async function (row, index) {
  window.$dialog.warning({
    title: "确认删除",
    content: "请确认是否删除这条文章",
    positiveText: "删除",
    negativeText: "不确定",
    onPositiveClick: async () => {
      await deleteTag(row._id)
        .then((res) => {
          tagsList.value.splice(index, 1);
          window.$message.success(res.message);
        })
        .catch((error) => {
          console.log(error);
        });
      return true;
    },
    onNegativeClick: () => {
      window.$message.error("已取消");
    },
  });
};

const columns = createColumns({
  onUpdata,
  onDelete,
});

// 清除关键字
function clearKeyword() {
  keyword.value = "";
  initTagsList();
}

function filterDate() {
  let startTime, endTime;
  if (!dateRange.value) {
    startTime = 0;
    endTime = Date.now();
  } else {
    startTime = dateRange.value[0];
    endTime = dateRange.value[1];
  }
  return { startTime, endTime };
}

function filterTags() {
  const { startTime, endTime } = filterDate();
  initTagsList(startTime, endTime, keyword.value);
}

// 搜索关键词
let keyword = ref("");
let dateRange = ref(null);

async function initTagsList(startTime = 0, endTime = Date.now(), keyword = "") {
  let option = { startTime, endTime, keyword };
  let result = await getTags(option);
  tagsList.value = result.data;
}

onMounted(() => {
  initTagsList();
});
</script>
