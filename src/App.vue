<template>
  <n-message-provider>
    <RouterView />
    <content />
  </n-message-provider>
</template>

<script setup>
import content from '@/components/content.vue'
</script>

<style>
@import "@/assets/base.css";
</style>
