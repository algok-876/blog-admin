<template>
  <div class="header">
    <div class="search">
      <n-input type="text" placeholder="请输入标题关键字">
        <template #suffix
          ><n-icon
            class="search-btn"
            @click="searchArticle"
            :component="Search"
          ></n-icon></template
      ></n-input>
    </div>
  </div>
  <div class="article-list">
    <div class="article-item" v-for="item in articleList" :key="item._id">
      {{ item.title }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { Search } from "@vicons/ionicons5";
import { getArticles } from "@/api/index.js";
let articleList = ref([]);
function searchArticle() {
  console.log("结果已出来了");
}
async function initArticleList() {
  let result = await getArticles();
  articleList.value = result.data;
  console.log(articleList);
}
onMounted(() => {
  initArticleList();
});
</script>

<style>
.search-btn {
  cursor: pointer;
}
</style>