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
      <mavonEditor
        class="md-editor"
        ref="editorRef"
        v-model="formValue.mdContent"
        @imgAdd="editorImgAdd"
        @imgDel="editorImgDel"
      ></mavonEditor>
    </n-form-item>
    <n-form-item>
      <n-button @click="resetForm" type="warning">重置表单</n-button>
      <n-button
        @click="handleValidateClick"
        style="margin-left: 24px"
        type="primary"
        >发布文章</n-button
      >
    </n-form-item>
  </n-form>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { useMessage } from "naive-ui";
import { useRoute, useRouter } from "vue-router";
import {
  getTags,
  getArticleDraftDetail,
  updateArticleDraft,
  createArticle,
  uploadEditorImg,
  deleteEditorImg,
  delArticleDraft,
} from "@/api/index";
import { mavonEditor } from "mavon-editor";
import "mavon-editor/dist/css/index.css";
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
const detailId = route.params.id;

// 观察路径的改变，路径改变代表模式的改变
// watch(
//   () => route.path,
//   (newVal, oldVal) => {
//     resetForm();
//   }
// );

async function editorImgAdd(pos, $file) {
  // 第一步.将图片上传到服务器.
  let formdata = new FormData();
  formdata.append("editor", $file);
  try {
    let res = await uploadEditorImg(formdata);
    // console.log(res.data);
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
  if (!formValue.title) {
    message.error("标题不能为空格");
    return;
  }
  formRef.value.validate(async (errors) => {
    if (!errors) {
      let res = null;
      contentImgs.value = findImgs(formValue.mdContent);
      formValue.content_img = contentImgs.value.join(",");
      res = await createArticle({
        ...formValue,
        author_id: userInfo.value._id,
        content: editorRef.value.d_render,
      });
      isPublish.value = true;
      resetForm();
      message.success(res.message);
      // 删除草稿
      await delArticleDraft(route.params.id);
      back();
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
async function getDetail() {
  const res = await getArticleDraftDetail(detailId);
  Object.keys(res.data).forEach((key) => {
    formValue[key] = res.data[key];
  });
  if (res.data.content_img) {
    stateImgs.value = res.data.content_img.split(",");
  }
}

// 将没有发布的文章添加到草稿箱中
async function updateDrafts() {
  if (isPublish.value) return;
  contentImgs.value = findImgs(formValue.mdContent);
  formValue.content_img = contentImgs.value.join(",");
  await updateArticleDraft(detailId, {
    ...formValue,
    author_id: userInfo.value._id,
  });
}

// 查找出mdContent中的所有图片
function findImgs(content) {
  let patt = new RegExp("!\\[[^\\]]*\\]\\(http://img.gkyyds.xyz/[^\\)]*", "g");
  let imgs = [];
  imgs = content.match(patt);
  if (!imgs) {
    return [];
  }
  imgs.forEach((item, index) => {
    imgs[index] = item.split("](")[1];
  });
  return imgs;
}

// 对比并返回无用的图片数组
function getUseless(oldArr, newArr) {
  let delImgs = [];
  oldArr.forEach((oldItem) => {
    let isDel = true;
    newArr.forEach((newItem) => {
      if (oldItem === newItem) isDel = false;
    });
    if (isDel) delImgs.push(oldItem);
  });
  return delImgs;
}
// 删除没有保存到文章中的残余图片
async function delUseless() {
  let imgs = [];
  // 筛选出没用的图片
  imgs = getUseless(stateImgs.value, contentImgs.value);
  console.log("删除", imgs);
  if (imgs.length !== 0) {
    imgs = imgs.join(",");
    await deleteEditorImg({ imgs });
  }
}

onMounted(() => {
  initTagOptions();
  getDetail();
});
onBeforeUnmount(() => {
  // 卸载之前保存文章
  updateDrafts();
  delUseless();
  resetForm();
});
</script>

<style  lang="scss" scoped>
.md-editor {
  width: 100%;
  height: 420px;
}
</style>