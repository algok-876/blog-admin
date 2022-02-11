<template>
  <div id="editor"></div>
</template>

<script setup>
import wangEditor from "wangeditor";
import { onMounted, onBeforeUnmount, defineProps, defineEmits, watch } from "vue";
const props = defineProps({
  height: {
    type: Number,
    default: 300,
  },
  value: {
    type: String
  }
});

// 事件触发器
const emits = defineEmits(['update:value'])

let editor = null
function initEditor() {
  const Editor = new wangEditor(`#editor`);
  Editor.config.height = props.height;
  Editor.config.onchange = (newHtml) => {
    emits('update:value', newHtml)
  };
  // 创建编辑器
  Editor.create();

  editor = Editor
}

watch(() => props.value, (newVal, oldVal) => {
  if (oldVal !== '' && newVal === '') {
    // 清空编辑器
    editor.txt.clear()
  }
})

onBeforeUnmount(() => {
  editor.destroy();
  editor = null;
});
onMounted(() => {
  initEditor();
});
</script>

<style>
#editor {
  width: 100%;
}
</style>