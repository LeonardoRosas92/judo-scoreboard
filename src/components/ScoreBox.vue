<template>
  <div class="flex flex-col items-center justify-center w-full rounded-2xl p-2 select-none"
    :class="side === 'white' ? 'bg-white text-blue-700' : 'bg-white text-blue-700'">
    <div class="grid grid-cols-4 gap-3 w-full h-full">
      <div v-for="type in ['ippon', 'waza', 'yuko', 'shido']" :key="type"
        class="flex flex-col items-center justify-center rounded-xl transition cursor-pointer select-none"
        @click="handleTap(side, type)" @contextmenu.prevent="store.decrementScore(side, type)"
        @touchstart="startHold(side, type)" @touchend="cancelHold" @mousedown="startHold(side, type)"
        @mouseup="cancelHold" @mouseleave="cancelHold">
        <!-- Nombre de la marcación -->
        <span class="text-sm sm:text-xl xl:text-5xl font-extrabold uppercase mb-2"
          :class="side === 'white' ? 'text-black' : 'text-blue-700'">
          {{ type === 'waza' ? 'WAZARI' : type.toUpperCase() }}
        </span>

        <!-- Caja con número -->
        <div
          class="flex justify-center items-center w-full h-[clamp(10vh,12vh,14vh)] md:h-[clamp(16vh,15vh,30vh)] rounded-xl shadow-lg leading-none font-extrabold tracking-tight select-none"
          :class="side === 'white' ? 'bg-white text-black' : 'bg-white text-blue-700'">
          <span
            class="text-[clamp(3rem,5vh,7rem)] md:text-[clamp(5rem,9vh,10rem)] lg:text-[clamp(4rem,9vh,9rem)] xl:text-[clamp(7rem,10vh,10rem)] leading-none">
            {{ store[side][type] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useScoreboardStore } from '@/stores/scoreboard'

// ✅ Sin warning ESLint
const { side } = defineProps({
  side: {
    type: String,
    required: true,
  },
})

const store = useScoreboardStore()

// ============================
// 🎯 Control universal táctil
// ============================
let holdTimeout = null
let lastTapTime = 0

function handleTap(side, type) {
  const now = Date.now()
  const timeDiff = now - lastTapTime

  // Doble toque rápido → resta
  if (timeDiff < 300) {
    store.decrementScore(side, type)
  } else {
    store.incrementScore(side, type)
  }

  lastTapTime = now
}

// Mantener presionado → resta
function startHold(side, type) {
  holdTimeout = setTimeout(() => {
    store.decrementScore(side, type)
  }, 700)
}

function cancelHold() {
  clearTimeout(holdTimeout)
  holdTimeout = null
}
</script>
