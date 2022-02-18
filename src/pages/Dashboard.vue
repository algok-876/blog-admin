<template>
  <div class="core-data">
    <n-grid class="info" x-gap="15" :cols="5">
      <n-gi>
        <dataCard
          :title="'文章总数'"
          :count="allCount.article.count"
          :today="allCount.article.today"
          :icon="Book"
        ></dataCard>
      </n-gi>
      <n-gi>
        <dataCard
          :title="'访问总数'"
          :count="allCount.visit.count"
          :today="allCount.visit.today"
          :icon="Person"
        ></dataCard>
      </n-gi>
    </n-grid>
    <div class="chart-title">
      <div class="title">
        <h2>{{ ChartTitle }}</h2>
      </div>
      <div class="time-select">
        <div>时间选择</div>
        <div class="line">|</div>
        <n-select
          :style="{ width: '90px' }"
          v-model:value="time"
          :options="timeOptions"
        />
      </div>
    </div>
    <chart v-model:data="data" v-model:labels="labels"></chart>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from "vue";
import { Book, Person } from "@vicons/ionicons5";
import {
  articleCountWeek,
  articleCountMonth,
  articleCount,
} from "@/api/index.js";
import chart from "@/components/chart.vue";
import dataCard from "@/components/dataCard.vue";

let data = ref([]);
let labels = ref([]);
let ChartTitle = ref("");
let time = ref(7);
let timeOptions = [
  {
    label: "近7天",
    value: 7,
  },
  {
    label: "近30天",
    value: 30,
  },
];
let chartActile = ref("article");
let allCount = reactive({
  article: {
    count: 0,
    today: 0,
    yesterday: 0,
  },
  visit: {
    count: 0,
    today: 0,
    yesterday: 0,
  },
});

async function initArticleCount() {
  let result = await articleCount();
  allCount.article = result.data;
}

// 获取近7天的数据
async function initArticleWeek() {
  let result = await articleCountWeek();
  data.value = result.data;
  labels.value = result.labels;
  ChartTitle.value = "近7天文章发布量";
  // console.log(result);
}
// 获取近30天的数据
async function initArticleMonth() {
  let result = await articleCountMonth();
  data.value = result.data;
  labels.value = result.labels;
  ChartTitle.value = "近30天文章发布量";
  // console.log(result);
}
function initArticleChart() {
  if (time.value === 7) {
    initArticleWeek();
  } else if (time.value === 30) {
    initArticleMonth();
  }
}
function inintChart() {
  switch (chartActile.value) {
    case "article":
      initArticleChart();
      break;
    default:
      initArticleChart();
      break;
  }
}
watch(time, () => {
  inintChart();
});
onMounted(() => {
  initArticleCount();
  inintChart();
});
</script>

<style lang="scss" scoped>
.core-data {
  .info {
    .data-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 20px;
      box-shadow: 0 0 7px gray;
      border-radius: 10px;
      cursor: pointer;
      .left {
        .title {
          margin-bottom: 5px;
          .data-card-icon {
            margin-right: 8px;
          }
        }
        .today .today-count {
          margin-left: 8px;
        }
      }
      .count {
        font-size: 23px;
      }
    }
    .data-card-active {
      background: #e7f5ee;
    }
  }
  .chart-title {
    margin-top: 25px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .time-select {
      display: flex;
      align-items: center;
      .line {
        margin: 0 15px;
      }
    }
  }
}
</style>