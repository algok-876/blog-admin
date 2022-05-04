<template>
  <n-form :label-width="80" :rules="rules" ref="formRef" :model="formValue">
    <n-form-item>
      <div class="btn-area">
        <n-button-group>
          <n-button
            @click="handleValidateClick"
            style="margin-left: 24px"
            type="primary"
            size="large"
            >{{ btnText }}</n-button
          >
          <n-button
            @click="saveToDrafts"
            type="warning"
            style="margin-right: 24px"
            v-if="!isDraftEdit && !isArticleEdit"
            size="large"
            >存为草稿</n-button
          >
          <n-button
            @click="updateDrafts"
            type="warning"
            style="margin-right: 24px"
            v-if="isDraftEdit"
            size="large"
            >继续保存至草稿</n-button
          >
          <n-button
            @click="resetForm"
            type="warning"
            size="large"
            >清空</n-button
          >
        </n-button-group>
      </div>
    </n-form-item>
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
      <mavonEditor
        class="md-editor"
        ref="editorRef"
        v-model="formValue.mdContent"
        @imgAdd="editorImgAdd"
        @imgDel="editorImgDel"
      ></mavonEditor>
      <!-- <editor
        ref="editorDiv"
        v-model:value="formValue.content"
        :isArticleEdit.value="isArticleEdit.value"
      ></editor> -->
    </n-form-item>
  </n-form>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
  computed,
  watch,
} from "vue";
// 获取接口数据的方法
import {
  getTags,
  getArticleDetail,
  updateArticle,
  createArticle,
  uploadEditorImg,
  deleteEditorImg,
  createArticleDraft, // 创建草稿
  getArticleDraftDetail, // 获取草稿详情
  updateArticleDraft, // 更新草稿
  delArticleDraft, // 删除草稿
} from "@/api/index";
import { extractMarkdownImages, compareUnusedImage } from "@/utils/tool";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { idID, useMessage } from "naive-ui";
import { useRoute, useRouter } from "vue-router";

// 路由对象
const route = useRoute();
const router = useRouter();

// 用户全局状态数据
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
const message = useMessage();
const formRef = ref(null);
const editorRef = ref(null);
// 当前模式 1->修改文章  2->编辑草稿
const isPublish = ref(route.query.mode ? false : true);
const isArticleEdit = ref(route.query.mode == 1);
const isDraftEdit = ref(route.query.mode == 2);
let id = route.params.id; // 当前文章或草稿 id

// 按钮文本
const btnText = computed(() => {
  if (isPublish.value) return "发布此文章";
  if (isArticleEdit.value) return "更新此文章";
  if (isDraftEdit.value) return "发布此草稿";
});

// 模式 参数变化时进行初始化
watch(() => route.query.mode, (newVal, oldVal) => {
  // 离开时自动保存草稿
  if (isDraftEdit.value) updateDrafts()
  newVal == 1 ? isArticleEdit.value = true : isArticleEdit.value = false;
  newVal == 2 ? isDraftEdit.value = true : isDraftEdit.value = false;
  newVal ? isPublish.value = false : isPublish.value = true;
  resetForm()
  id = route.params.id
})

async function editorImgAdd(pos, $file) {
  // 第一步.将图片上传到服务器.
  let formdata = new FormData();
  formdata.append("editor", $file);
  try {
    let res = await uploadEditorImg(formdata);
    editorRef.value.$img2Url(pos, res.data.url);
  } catch (error) {
    editorRef.value.$img2Url(pos, "");
    window.$message.error("上传失败");
  }
}
async function editorImgDel(filename) {
  if (isArticleEdit.value) return;
  let res = await deleteEditorImg({ imgs: filename[0] });
  console.log(res);
  if (res.code === "200") {
    window.$message.success("删除成功");
  }
}

// 表单数据
let formValue = reactive({
  title: "",
  mdContent: "",
  tag_id: "",
  description: "",
  content_img: "",
});

// 编辑器中的图片
let stateImgs = ref([]);
let contentImgs = ref([]);
const rules = {
  title: {
    required: true,
    message: "请输入标题",
    trigger: "blur",
  },
  mdContent: {
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
  formValue.mdContent = formValue.mdContent.trim();
  formRef.value.validate(async (errors) => {
    if (errors) return;
    let res = null;
    contentImgs.value = extractMarkdownImages(formValue.mdContent);
    if (contentImgs.value.length !== 0) {
      formValue.content_img = contentImgs.value.join(",");
    } else {
      formValue.content_img = "";
    }

    if (isArticleEdit.value) {
      // 文章编辑模式下 调用修改文章信息接口
      res = await updateArticle(id, {
        ...formValue,
        content: editorRef.value.d_render,
      });
      router.push({
        name: "Articles",
      });
      return
    }

    if (isPublish.value || isDraftEdit.value) {
      // 发布文章或草稿
      res = await createArticle({
        ...formValue,
        author_id: userInfo.value._id,
        content: editorRef.value.d_render,
      });
      if (isDraftEdit.value) {
        delArticleDraft(route.params.id);
      }
      return
    }
    back();
    resetForm();
    message.success(res.message);
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

// 不同的模式下 获取文章详情或者草稿详情
async function initForm() {
  if (isPublish.value) return;
  const id = route.params.id;
  let res = null;
  if (isArticleEdit.value) {
    // 获取文章详情
    res = await getArticleDetail(id);
  } else if (isDraftEdit.value) {
    // 获取草稿详情
    res = await getArticleDraftDetail(id);
  }
  // 复制对应的字段
  Object.keys(res.data).forEach((key) => {
    formValue[key] = res.data[key];
  });
  stateImgs.value = res.data.content_img.split(",");
}

// 将没有发布的文章添加到草稿箱中
async function saveToDrafts() {
  if (formValue.title && formValue.tag_id) {
    formValue.content_img = extractMarkdownImages(formValue.mdContent).join(
      ","
    );
    await createArticleDraft({
      ...formValue,
      author_id: userInfo.value._id,
    });
  } else {
    message.error("标题和标签是必须的");
    return;
  }
  router.push({ name: "Drafts" });
}

// 更新草稿
async function updateDrafts() {
  if (isPublish.value) return;
  contentImgs.value = extractMarkdownImages(formValue.mdContent);
  formValue.content_img = contentImgs.value.join(",");
  await updateArticleDraft(id, {
    ...formValue,
    author_id: userInfo.value._id,
  });
  message.success('已保存')
}

// 删除没有保存到文章中的残余图片
async function delUseless() {
  let imgs = [];
  // 筛选出没用的图片
  if (!isArticleEdit.value) return;
  if (isPublish.value) {
    // 在编辑模式下
    imgs = compareUnusedImage(stateImgs.value, contentImgs.value);
  } else {
    contentImgs.value = extractMarkdownImages(formValue.mdContent);
    imgs = compareUnusedImage(contentImgs.value, stateImgs.value);
  }
  console.log("删除", imgs);
  if (imgs.length !== 0) {
    imgs = imgs.join(",");
    await deleteEditorImg({ imgs });
  }
}

onMounted(() => {
  initTagOptions();
  initForm();
});

onBeforeUnmount(() => {
  delUseless();
  resetForm();
});
</script>

<style  lang="scss" scoped>
.md-editor {
  width: 100%;
  height: 420px;
}
.btn-area {
  display: flex;
  width: 100%;
  justify-content: flex-end;
}
</style>