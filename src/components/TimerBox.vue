<template>
  <div class="flex flex-col items-center justify-center w-full select-none h-full relative">
    <!-- ⏱️ Timer principal o texto de ganador -->
    <div @click="!store.winner && store.toggleTimer()"
      class="text-[clamp(2.5rem,8vh,7rem)] md:text-[clamp(5rem,6vh,7rem)] lg:text-[clamp(7rem,9vh,8rem)] font-extrabold py-1 px-6 rounded-lg cursor-pointer transition shadow-lg leading-none text-center mt-[-3vh]"
      :class="timerClass">
      <!-- 🥇 Mostrar ganador -->
      <template v-if="store.winner">
        {{ store.winner === 'white' ? 'Ganador Blanco' : 'Ganador Azul' }}
      </template>

      <!-- ⏱️ Mostrar tiempo -->
      <template v-else>
        {{ store.formattedTime }}
      </template>
    </div>

    <!-- 🔘 Botones de categoría -->
    <div v-if="!store.winner" class="flex gap-2 mt-2 flex-wrap justify-center">
      <button v-for="(label, cat) in categories" :key="cat"
        class="px-3 py-1 rounded-lg transition text-xs sm:text-sm md:text-base"
        :class="store.category === cat ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'"
        @click="store.setCategory(cat)">
        {{ label }}
      </button>
    </div>

    <!-- 🕒 Texto debajo -->
    <div v-if="!store.winner" class="mt-1 text-xs sm:text-base font-semibold">
      <span v-if="store.isGolden" class="text-yellow-500">Golden Score</span>
      <span v-else class="text-gray-400">Tiempo oficial</span>
    </div>

    <!-- 🔁 Botón reiniciar -->
    <button v-if="store.winner" @click="store.resetAll()" class="text-sm underline hover:text-white animate-fade-in">
      Reiniciar
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useScoreboardStore } from '@/stores/scoreboard'
const store = useScoreboardStore()

const categories = {
  infantil: '2 min',
  sub15: '3 min',
  mayores: '4 min',
}

// 🎨 Colores dinámicos del timer
const timerClass = computed(() => {
  if (store.winner) {
    // 🏆 Si hay ganador → color del competidor
    return store.winner === 'white'
      ? 'bg-white text-blue-700'
      : 'bg-blue-700 text-white'
  }

  if (store.isGolden) {
    // 🟡 Golden Score
    return store.isRunning
      ? 'bg-green-500 text-black' // corriendo
      : 'bg-red-600 text-white' // pausado
  }

  // ⏱️ Tiempo normal
  return store.isRunning
    ? 'bg-green-500 text-black' // corriendo
    : 'bg-red-600 text-white' // pausado
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease forwards;
}
</style>
