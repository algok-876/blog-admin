<template>
  <div class="drafts-container">
    <n-grid x-gap="20" y-gap="20" :cols="2">
      <n-gi v-for="(item, index) in draftsList" :key="item._id">
        <n-card
          :title="item.title"
          :segmented="{
            content: true,
            footer: 'soft',
          }"
        >
          <template #header-extra>
            <n-icon size="30">
              <document-attach-outline />
            </n-icon>
          </template>
          {{ item.description || "无描述" }}
          <template #footer>
            <div class="card-footer">
              <p>
                创建时间：
                <span class="time">{{ handleDetailTime(item.create_at) }}</span>
              </p>
              <p>
                最近一次更新：<span class="time">{{
                  item.update_at
                    ? handleDetailTime(item.update_at)
                    : "暂无更新时间"
                }}</span>
              </p>
            </div>
          </template>
          <template #action>
            <n-space justify="end">
              <n-button type="success" @click="editorDrafts(item._id)">
                <n-space align="center">
                  <n-icon size="20">
                    <pencil />
                  </n-icon>
                  编辑
                </n-space>
              </n-button>

              <n-popconfirm
                @positive-click="deleteDrafts(item._id, index)"
                positive-text="确认"
                negative-text="取消"
              >
                <template #trigger>
                  <n-button type="warning">删除</n-button>
                </template>
                请确认是否删除这条草稿
              </n-popconfirm>
            </n-space>
          </template>
        </n-card>
      </n-gi>
    </n-grid>

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
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getArticleDraftList, delArticleDraft } from "@/api/index";
import { handleDetailTime } from "@/utils/tool.js";
import { EllipsisHorizontalSharp, Pencil, DocumentAttachOutline } from "@vicons/ionicons5";
import { useRouter } from "vue-router";
const router = useRouter();
let draftsList = ref([]);
// 编辑草稿
function editorDrafts(id) {
  console.log(id);
  router.push({ name: "ArticleDraft", params: { id: id }, query: { mode: 2 } });
}
// 删除草稿
async function deleteDrafts(id, index) {
  let result = await delArticleDraft(id);
  console.log(result);
  if (result.code === "200") {
    draftsList.value.splice(index, 1);
    window.$message.success("成功删除");
  }
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
  .card-footer {
    width: 240px;
    float: right;
    color: rgb(170, 170, 170);
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
</style>