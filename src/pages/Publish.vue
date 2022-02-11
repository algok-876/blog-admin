<template>
  <n-form :label-width="80" :rules="rules" ref="formRef" :model="formValue">
    <n-grid x-gap="24" :cols="3">
      <n-gi :span="2">
        <n-form-item label="标题" path="title">
          <n-input
            v-model:value="formValue.title"
            placeholder="输入文章标题"
          ></n-input>
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="标签" path="tag_id">
          <n-select
            v-model:value="formValue.tag_id"
            :options="tagOptions"
          ></n-select>
        </n-form-item>
      </n-gi>
    </n-grid>
    <n-form-item label="摘要" path="description">
      <n-input
        v-model:value="formValue.description"
        type="textarea"
        placeholder="文章摘要或文章简介"
      />
    </n-form-item>
    <n-form-item label="内容" path="content">
      <editor ref="contentRef"></editor>
    </n-form-item>
    <n-form-item>
      <n-button @click="resetForm" attr-type="button" type="warning"
        >重置表单</n-button
      >
      <n-button
        @click="handleValidateClick"
        attr-type="button"
        style="margin-left: 24px"
        type="primary"
        >发布文章</n-button
      >
    </n-form-item>
  </n-form>
</template>

<script setup>
import { ref, onMounted, reactive, provide } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { useMessage } from "naive-ui";
import service from "@/api/service";
import { getTags } from "@/api/index";
import editor from "@/components/editor.vue";

const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
const message = useMessage();
const formRef = ref(null);
const contentRef = ref(null)
let formValue = reactive({
  title: "",
  content: "",
  tag_id: "",
  description: "",
});
const rules = {
  title: {
    required: true,
    message: "请输入标题",
    trigger: "blur",
  },
  content: {
    required: true,
    message: "请输入内容",
    trigger: "blur",
  },
  tag_id: {
    required: true,
    message: "请选择标签",
    trigger: "blur",
  },
};

// 获取富文本编辑器组件的内容
function changeContent(content) {
  formValue.content = content;
}
provide("changeContent", changeContent);


// 重置表单
function resetForm() {
  Object.keys(formValue).forEach((key) => (formValue[key] = ""));
  contentRef.value.clearEditor()
  formRef.value.restoreValidation();
}

function handleValidateClick() {
  formValue.title = formValue.title.trim();
  formValue.content = formValue.content.trim();
  if (!formValue.title) {
    message.error("标题不能为空格");
    return;
  }
  formRef.value.validate(async (errors) => {
    if (!errors) {
      let res = await service.post("/article/create", {
        ...formValue,
        author_id: userInfo.value._id,
      });
      resetForm();
      message.success(res.message);
    } else {
      let errorArr = [];
      errors.forEach((item) => {
        errorArr.push(item[0].message);
      });
      let error = errorArr.join("、");
      console.log(error);
      message.error(error);
    }
  });
}

// 获取文章标签
let tagOptions = ref([]);
async function initTagOptions() {
  const tags = await getTags();
  tags.data.forEach((tag) => {
    tagOptions.value.push({
      label: tag.name,
      value: tag._id,
    });
  });
}

onMounted(() => {
  initTagOptions();
});
</script>