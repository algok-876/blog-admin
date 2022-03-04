<template>
  <div class="core-data">
    <n-grid class="info" x-gap="30" :cols="4">
      <n-gi>
        <dataCard :option="allCount.article" v-model:chart-type="chartType" />
      </n-gi>
      <n-gi>
        <dataCard :option="allCount.visit" v-model:chart-type="chartType" />
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
  articleChartData,
  articleCount,
  visitCount,
  visitChartData,
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
let chartType = ref("article");

let allCount = reactive({
  article: {
    title: "文章总数",
    chart: "article",
    data: {
      count: 0,
      today: 0,
      yesterday: 0,
    },
    icon: Book,
  },
  visit: {
    title: "访问总数",
    chart: "visit",
    data: {
      count: 0,
      today: 0,
      yesterday: 0,
    },
    icon: Person,
  },
});

// 将选择的时间转换为请求参数
function dayToParams(day) {
  return day === 7 ? "week" : "month";
}

async function initArticleCount() {
  let result = await articleCount();
  allCount.article.data = result.data;
}

// 获取文章数据
async function fetchArticleChart() {
  let result = await articleChartData(dayToParams(time.value));
  data.value = result.data;
  labels.value = result.labels;
  ChartTitle.value = `近${time.value}天文章发布量`;
  // console.log(result);
}

async function initVisitCount() {
  let result = await visitCount();
  allCount.visit.data = result.data;
}

// 获取访问人数图表数据
async function fetchVisitChart() {
  let result = await visitChartData(dayToParams(time.value));
  data.value = result.data;
  labels.value = result.labels;
  ChartTitle.value = `近${time.value}天访问人数`;
}

// 初始化图表数据
function inintChart() {
  switch (chartType.value) {
    case "article":
      fetchArticleChart();
      break;
    case "visit":
      fetchVisitChart();
      break;
    default:
      fetchArticleChart();
      break;
  }
}
watch(
  () => [time.value, chartType.value],
  () => {
    console.log(chartType.value);
    inintChart();
  }
);
onMounted(() => {
  initArticleCount();
  inintChart();
  initVisitCount();
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
