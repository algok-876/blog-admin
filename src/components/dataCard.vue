<template>
  <div class="data-card">
    <div class="left">
      <div class="title">
        <n-icon class="data-card-icon" :component="props.icon"></n-icon>
        <span>{{ props.title }}</span>
      </div>
      <div class="today">
        <span>今日新增</span>
        <span class="today-count">{{ props.today }}</span>
      </div>
    </div>
    <div class="right">
      <div class="count">
        <n-number-animation :from="props.count / 2" :to="props.count" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { Pulse } from "@vicons/ionicons5";
const props = defineProps({
  title: {
    type: String,
  },
  count: {
    type: Number,
    defaule: 0,
  },
  today: {
    type: Number,
    defaule: 0,
  },
  icon: {
    type: Object,
    defaule: Pulse,
  },
});
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
</style>