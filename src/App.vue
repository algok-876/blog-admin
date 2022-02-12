<template>
  <n-message-provider>
    <n-dialog-provider>
      <RouterView />
      <content />
    </n-dialog-provider>
  </n-message-provider>
</template>

<script setup>
import content from "@/components/content.vue";
</script>

<style>
@import "@/assets/base.css";
</style>
