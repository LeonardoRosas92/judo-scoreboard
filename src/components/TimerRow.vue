<template>
  <section class="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 w-full">
    <!-- Osaekomi izquierda -->
    <OsaekomiTimer side="white" class="flex-1 w-full order-2 md:order-1" />

    <!-- Cronómetro principal -->
    <div class="flex-1 flex justify-center w-full order-1 md:order-2">
      <TimerBox />
    </div>

    <!-- Osaekomi derecha -->
    <OsaekomiTimer side="blue" class="flex-1 w-full order-3 md:order-3" />
  </section>
</template>

<script setup>
import OsaekomiTimer from './OsaekomiTimer.vue'
import TimerBox from './TimerBox.vue'
</script>
