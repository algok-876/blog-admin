<template>
  <div class="drafts-container">
    <div class="drafts-list">
      <div class="list-item" v-for="(item, index) in draftsList" :key="item.id">
        <div class="top">
          <p class="title">{{ item.title ? item.title : "无标题" }}</p>
          <!-- 下拉框 -->
          <div class="dropdown">
            <div class="dropdown-button">
              <n-icon size="18" :component="EllipsisHorizontalSharp" />
            </div>
            <div class="dropdown-list">
              <div class="dropdown-item" @click="editorDrafts(item._id)">
                编辑
              </div>
              <div class="dropdown-item" @click="deleteDrafts(item._id, index)">
                删除
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="create_at">{{ handleDetailTime(item.create_at) }}</div>
        </div>
      </div>
      <div class="empty-box" v-if="draftsList.length === 0">
        <img src="@/assets/ed038d31a0ab338af3a27716116e762f.svg" alt="" />
        <div class="empty-text">
          这里什么都没有，<router-link
            class="empty-link"
            :to="{ name: 'Publish' }"
            >开始创作</router-link
          >
          吧
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getArticleDraftList, delArticleDraft } from "@/api/index";
import { handleDetailTime } from "@/utils/tool.js";
import { EllipsisHorizontalSharp } from "@vicons/ionicons5";
import { useRouter } from "vue-router";
const router = useRouter();
let draftsList = ref([]);
// 编辑草稿
function editorDrafts(id) {
  router.push({ name: "ArticleDraft", params: { id: id } });
}
// 删除草稿
function deleteDrafts(id, index) {
  window.$dialog.warning({
    title: "确认删除",
    content: "请确认是否删除这条草稿",
    positiveText: "删除",
    negativeText: "不确定",
    onPositiveClick: async () => {
      let result = await delArticleDraft(id);
      console.log(result);
      if (result.code === "200") {
        draftsList.value.splice(index, 1);
        window.$message.success("成功删除");
      }
    },
    onNegativeClick: () => {
      window.$message.error("已取消");
    },
  });
}
async function initDrafts() {
  let res = await getArticleDraftList();
  draftsList.value = res.data;
}
onMounted(() => {
  initDrafts();
});
</script>

<style lang="scss">
.drafts-container {
  padding: 0 15px;
  .drafts-list {
    max-width: 1100px;
    min-height: calc(100vh - 144px);
    margin: 10px auto;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 0 10px #ccc;
    padding: 15px;
    .list-item {
      border-bottom: 1px solid #ccc;
      padding: 10px 0;
      .top {
        margin-bottom: 5px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .dropdown {
        position: relative;
        &:hover .dropdown-list {
          display: block;
        }
        .dropdown-list {
          display: none;
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          padding: 3px 0;
          box-shadow: 0 0 10px #ccc;
          border-radius: 3px;
          overflow: hidden;
          background: #fff;
          z-index: 99;
          .dropdown-item {
            padding: 5px 15px;
            white-space: nowrap;
            cursor: pointer;
            user-select: none;
            &:hover {
              background: rgb(230, 230, 230);
            }
          }
        }
      }
    }
    .empty-box {
      width: 100%;
      height: 70vh;
      max-height: 70vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .empty-text {
        margin-top: 15px;
        .empty-link {
          text-decoration: none;
          color: rgb(5, 121, 255);
        }
      }
    }
  }
}
</style>