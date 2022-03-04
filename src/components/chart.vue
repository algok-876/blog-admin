<template>
  <div
    class="chart"
    :style="{ width: '100%', height: '450px' }"
    ref="chartref"
  ></div>
</template>

<script setup>
import { ref, onMounted, reactive, defineProps, watch } from "vue";
import * as echarts from "echarts";

let props = defineProps({
  data: {
    type: Array,
    defaule: [],
  },
  labels: {
    type: Array,
    defaule: [],
  },
});
let chartref = ref(null);
let chart = ref();
const option = reactive({
  tooltip: {},
  xAxis: {
    data: [],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      smooth: true,
      type: "line",
      data: [],
    },
  ],
});

function initChart() {
  // console.log(option);
  chart.value.setOption(option);
}

watch(
  () => [props.data, props.labels],
  () => {
    option.series[0].data = props.data;
    option.xAxis.data = props.labels;
    initChart();
  },
  {
    deep: true,
  }
);

onMounted(() => {
  // console.log(chartref.value)
  chart.value = echarts.init(chartref.value);
  initChart();
});
</script>

<style></style>
