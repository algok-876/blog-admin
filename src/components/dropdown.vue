<template>
  <div class="dropdown">
    <div class="dropdown-button">
      <slot></slot>
    </div>
    <div class="dropdown-list">
      <div
        class="dropdown-item"
        @click="clickItem(item, item.key)"
        v-for="item in prop.options"
        :key="item.key"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
let prop = defineProps({
  options: {
    type: Array,
    default: [],
  },
});
let emits = defineEmits(["select"]);
function clickItem(item, key) {
  emits("select", key);
}
</script>

<style lang="scss">
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
</style>