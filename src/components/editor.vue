<template>
  <div id="editor"></div>
</template>

<script setup>
import wangEditor from "wangeditor";
import {
  onMounted,
  onBeforeUnmount,
  defineProps,
  defineEmits,
  watch,
  defineExpose,
  reactive,
  ref,
} from "vue";
import { getToken } from "../utils/auth";
import { idID } from "naive-ui";
import { deleteEditorImg } from "@/api/index";
const props = defineProps({
  height: {
    type: Number,
    default: 600,
  },
  value: {
    type: String,
  },
  isEdit: {
    type: Boolean,
    default: true,
  },
});

// 事件触发器
const emits = defineEmits(["update:value"]);

let oldImgs = ref([]);
let newImgs = ref([]);
let editor = null;
function initEditor() {
  const Editor = new wangEditor(`#editor`);
  Editor.config.height = props.height;
  Editor.config.onchange = (newHtml) => {
    emits("update:value", newHtml);
  };
  Editor.config.uploadImgServer =
    "http://localhost:3000/api/v1/admin/upload/editor";
  Editor.config.uploadFileName = "editor";
  Editor.config.uploadImgHeaders = {
    authorization: "bearer " + getToken(),
  };
  Editor.config.uploadImgHooks = {
    fail: function (xhr, editor, resData) {
      console.log("fail", resData);
    },
  };
  // 创建编辑器
  Editor.create();

  editor = Editor;
}

function getImg() {
  let imgArr = [];
  let contentJson = editor.txt.getJSON();
  getAllImg(contentJson);
  function getAllImg(json) {
    if (!json) return;
    json.forEach((item) => {
      getAllImg(item.children);
      if (item.tag === "img") {
        imgArr.push(item.attrs[0].value);
      }
    });
  }
  return imgArr;
}

// 对比并返回无用的图片数组
function delUseless(oldArr, newArr) {
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

// 处理文章发布后的事件
function handlePublish() {
  newImgs.value = getImg();
  let delImgsArr = delUseless(oldImgs.value, newImgs.value);
  console.log(delImgsArr);
  oldImgs.value = newImgs.value;
  console.log(oldImgs.value);
  console.log(newImgs.value);
  deleteImgs(delImgsArr);
}

// 删除数组中对应的图片
async function deleteImgs(imgArr) {
  if (imgArr.length === 0) return;
  let imgs = imgArr.join(",");
  console.log(imgs);
  await deleteEditorImg({ imgs });
}

watch(
  () => props.value,
  (newVal, oldVal) => {
    if (oldVal !== "" && newVal === "") {
      // 清空编辑器
      editor.txt.clear();
    } else if (oldVal === "" && newVal && props.isEdit) {
      editor.txt.html(newVal);
      oldImgs.value = getImg();
    }
  }
);

onBeforeUnmount(() => {
  newImgs.value = getImg();
  // 删除没有上传到新闻内容中的残余图片
  let delImgsArr = delUseless(newImgs.value, oldImgs.value);
  console.log(delImgsArr);
  deleteImgs(delImgsArr);
  editor.destroy();
  editor = null;
});
onMounted(() => {
  initEditor();
});
defineExpose({ handlePublish });
</script>

<style>
#editor {
  width: 100%;
}
</style>
