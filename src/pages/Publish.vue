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
      <editor ref="editorDiv" v-model:value="formValue.content" :isEdit="isEdit"></editor>
    </n-form-item>
    <n-form-item>
      <n-button @click="resetForm" type="warning" v-if="!isEdit"
        >重置表单</n-button
      >
      <n-button @click="back" type="default" v-else>想通了, 不改了</n-button>
      <n-button
        @click="handleValidateClick"
        style="margin-left: 24px"
        type="primary"
        >{{ isEdit ? "更新文章" : "发布文章" }}</n-button
      >
    </n-form-item>
  </n-form>
</template>

<script setup>
import { ref, onMounted, reactive, provide, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { useMessage } from "naive-ui";
import { useRoute, useRouter } from "vue-router";
import service from "@/api/service";
import {
  getTags,
  getArticleDetail,
  updateArticle,
  createArticle,
} from "@/api/index";
import editor from "@/components/editor.vue";
// 路由对象
const route = useRoute();
const router = useRouter();

// 用户全局状态数据
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
const message = useMessage();
const formRef = ref(null);
const editorDiv = ref(null);

// 当前模式 publish or edit
const isEdit = computed(() => {
  return !!route.params.id;
});

// 观察路径的改变，路径改变代表模式的改变
watch(
  () => route.path,
  (newVal, oldVal) => {
    resetForm();
  }
);

// 表单数据
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

// 重置表单
function resetForm() {
  Object.keys(formValue).forEach((key) => (formValue[key] = ""));
  formRef.value.restoreValidation();
}

// 返回到文章列表页
function back() {
  router.push({
    name: "Articles",
  });
}

// 处理表单提交
function handleValidateClick() {
  formValue.title = formValue.title.trim();
  formValue.content = formValue.content.trim();
  if (!formValue.title) {
    message.error("标题不能为空格");
    return;
  }
  formRef.value.validate(async (errors) => {
    if (!errors) {
      let res = null;
      if (isEdit.value) {
        // 编辑模式下 调用修改文章信息接口
        console.log(route.params.id);
        res = await updateArticle(route.params.id, {
          ...formValue,
        });
        router.push({
          name: "Articles",
        });
      } else {
        res = await createArticle({
          ...formValue,
          author_id: userInfo.value._id,
        });
      }
      editorDiv.value.handlePublish();
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

// 编辑模式下需要获取需要修改的文章的数据
async function getArticle() {
  const id = route.params.id;
  const res = await getArticleDetail(id);
  Object.keys(res.data).forEach((key) => {
    formValue[key] = res.data[key];
  });
}

onMounted(() => {
  initTagOptions();
  // 编辑模式下需要获取文章数据
  if (isEdit.value) {
    getArticle();
  }
});
</script>
