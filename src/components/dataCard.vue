<template>
  <div
    :class="['data-card', props.option.chart === props.articleChart ? 'data-card-active' : '']"
    @click="changeChart"
  >
    <div class="left">
      <div class="title">
        <n-icon class="data-card-icon" :component="props.option.icon"></n-icon>
        <span>{{ props.option.title }}</span>
      </div>
      <div class="today">
        <span>今日新增</span>
        <span class="today-count">{{ props.option.data.today }}</span>
      </div>
    </div>
    <div class="right">
      <div class="count">
        <n-number-animation
          :from="props.option.data.count / 2"
          :to="props.option.data.count"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { Pulse } from "@vicons/ionicons5";
const props = defineProps({
  option: {
    type: Object,
    default() {
      return {
        title: "数据总数",
        chart: "data",
        data: {
          count: 0,
          today: 0,
          yesterday: 0,
        },
        icon: Pulse,
      };
    },
  },
  articleChart: {
    type: String,
  },
});
const emits = defineEmits(["update:ArticleChart"]);
function changeChart() {
  emits("update:ArticleChart", props.option.chart);
}
</script>

<style lang="scss" scoped>
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
  background: #94ffc9;
}
</style>