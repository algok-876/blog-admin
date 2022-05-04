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
            >{{ isEdit ? "更新文章" : "发布文章" }}</n-button
          >
          <n-button
            @click="
              router.push({
                name: 'Drafts',
              })
            "
            type="warning"
            style="margin-right: 24px"
            v-if="!isEdit"
            size="large"
            >存为草稿</n-button
          >
          <n-button
          @click="resetForm"
          type="warning"
          v-if="!isEdit"
          size="large"
            >重置表单</n-button
          >
          <n-button @click="back"
          type="warning"
          v-else
          size="large"
            >想通了, 不改了</n-button
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
        :isEdit="isEdit"
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
  createArticleDraft,
} from "@/api/index";
import { extractMarkdownImages, compareUnusedImage } from "@/utils/tool";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { useMessage } from "naive-ui";
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
const isPublish = ref(false);
// 当前模式 publish or edit
const isEdit = ref(!!route.params.id);

// 观察路径的改变，路径改变代表模式的改变
// watch(
//   () => route.path,
//   (newVal, oldVal) => {
//     resetForm();
//   }
// );

// function editorChange() {
//   if (editorRef.value === "") return;
//   console.log(extractMarkdownImages(editorRef.value));
// }
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
  if (isEdit.value) return;
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
    if (!errors) {
      let res = null;
      contentImgs.value = extractMarkdownImages(formValue.mdContent);
      if (contentImgs.value.length !== 0) {
        formValue.content_img = contentImgs.value.join(",");
      } else {
        formValue.content_img = "";
      }
      if (isEdit.value) {
        // 编辑模式下 调用修改文章信息接口
        res = await updateArticle(route.params.id, {
          ...formValue,
          content: editorRef.value.d_render,
        });
        router.push({
          name: "Articles",
        });
      } else {
        res = await createArticle({
          ...formValue,
          author_id: userInfo.value._id,
          content: editorRef.value.d_render,
        });
      }
      isPublish.value = true;
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
  stateImgs.value = res.data.content_img.split(",");
}

// 将没有发布的文章添加到草稿箱中
async function createDrafts() {
  if (isPublish.value || isEdit.value) return;
  if (formValue.mdContent || formValue.title || formValue.description) {
    formValue.content_img = extractMarkdownImages(formValue.mdContent).join(
      ","
    );
    await createArticleDraft({
      ...formValue,
      author_id: userInfo.value._id,
    });
  }
}

// 删除没有保存到文章中的残余图片
async function delUseless() {
  let imgs = [];
  // 筛选出没用的图片
  if (!isEdit.value) return;
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
  // 编辑模式下需要获取文章数据
  if (isEdit.value) {
    getArticle();
  }
});

onBeforeUnmount(() => {
  delUseless();
  createDrafts();
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