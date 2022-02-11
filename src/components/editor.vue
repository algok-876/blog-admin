<template>
  <div id="editor"></div>
</template>

<script>
import wangEditor from "wangeditor";
import { onMounted, onBeforeUnmount, inject } from "vue";
export default {
  props: {
    height: {
      type: Number,
      default: 300,
    },
  },
  setup(props) {
    let editor = null;
    // 回调内容给父组件
    let changeContent = inject("changeContent");

    function initEditor() {
      const Editor = new wangEditor(`#editor`);
      Editor.config.height = props.height;
      Editor.config.onchange = (newHtml) => {
        changeContent(newHtml);
      };
      // 创建编辑器
      Editor.create();

      editor = Editor;
    }
    const clearEditor = function () {
      editor.txt.clear();
    };
    onBeforeUnmount(() => {
      editor.destroy();
      editor = null;
    });
    onMounted(() => {
      initEditor();
    });
    return { initEditor, changeContent, clearEditor };
  },
};
</script>

<style>
#editor {
  width: 100%;
}
</style>