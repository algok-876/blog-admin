<template>
  <n-form :label-width="80" :rules="rules" ref="formRef" :model="formValue">
    <n-form-item label="标题" path="title">
      <n-input
        v-model:value="formValue.title"
        placeholder="输入文章标题"
      ></n-input>
    </n-form-item>
    <n-form-item label="内容" path="content">
      <div id="content" style="width: 100%"></div>
    </n-form-item>
    <n-form-item label="标签" path="tag_id">
      <n-select
        v-model:value="formValue.tag_id"
        :options="tagOptions"
        style="max-width: 200px"
      ></n-select>
    </n-form-item>
    <n-form-item>
      <n-button @click="handleValidateClick" attr-type="button"
        >发布文章</n-button
      >
    </n-form-item>
  </n-form>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { useMessage } from "naive-ui";
import service from "@/api/service";
import E from "wangeditor";
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
const message = useMessage();
const formRef = ref(null);
let formValue = ref({
  title: "",
  content: "",
  tag_id: "",
  author_id: userInfo.value._id,
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
function handleValidateClick() {
  formValue.value.content = editor.txt.html();
  formValue.value.title = formValue.value.title.trim();
  formValue.value.content = formValue.value.content.trim();
  if (!formValue.value.title) {
    message.error("标题不能为空格");
    return;
  }

  formRef.value.validate(async (errors) => {
    if (!errors) {
      let res = await service.post("/article/create", { ...formValue.value });
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
async function getTags() {
  const tags = await service.get("/tag/list");
  tags.data.forEach((tag) => {
    tagOptions.value.push({
      label: tag.name,
      value: tag._id,
    });
  });
}

//   富文本编辑器
let editor = "";
onMounted(() => {
  getTags();
  editor = new E("#content");
  editor.config.height = 450;
  editor.create();
});
</script>