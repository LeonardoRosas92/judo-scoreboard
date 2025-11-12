<template>
  <main class="min-h-screen flex flex-col bg-neutral-400 text-white select-none">
    <!-- Header -->
    <HeaderBox class="flex-none" />

    <!-- Competidores + Timers -->
    <section
      class="flex flex-col md:flex-col lg:flex-col xl:flex-col 2xl:flex-col items-center justify-center flex-1 gap-4">
      <ScoreRow class="w-full flex-1" />
      <TimerRow class="w-full flex-1" />
    </section>
  </main>
</template>

<script setup>
import HeaderBox from './components/HeaderBox.vue'
import ScoreRow from './components/ScoreRow.vue'
import TimerRow from './components/TimerRow.vue'
</script>
