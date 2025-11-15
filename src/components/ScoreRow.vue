<template>
  <section class="flex flex-col items-center gap-1 w-full p-2">
    <ScoreBox side="white" class="flex-1 w-full" />
    <ScoreBox side="blue" class="flex-1 w-full" />
  </section>
</template>

<script setup>
import ScoreBox from './ScoreBox.vue'
</script>
