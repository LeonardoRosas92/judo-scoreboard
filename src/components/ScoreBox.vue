<template>
  <div class="flex flex-col items-center justify-center w-full rounded-2xl p-2 select-none"
    :class="side === 'white' ? 'bg-white text-black' : 'bg-blue-700 text-white'">
    <div class="grid grid-cols-4 gap-3 w-full h-full">
      <div v-for="type in ['ippon', 'waza', 'yuko', 'shido']" :key="type"
        class="flex flex-col items-center justify-center rounded-xl transition cursor-pointer"
        @click="handleTap(side, type)" @mousedown="startHold(side, type)" @mouseup="cancelHold" @mouseleave="cancelHold"
        @touchstart.prevent="startHold(side, type)" @touchend.prevent="cancelHold"
        @click.right.prevent="store.decrementScore(side, type)">
        <!-- Nombre de la marcación -->
        <span class="text-sm sm:text-xl font-extrabold uppercase mb-2"
          :class="side === 'white' ? 'text-blue-700' : 'text-white'">
          {{ type === 'waza' ? 'WAZARI' : type.toUpperCase() }}
        </span>

        <!-- Caja con número -->
        <div
          class="flex justify-center items-center w-full h-[clamp(10vh,12vh,14vh)] md:h-[clamp(30vh,20vh,35vh)] rounded-xl shadow-lg leading-none font-extrabold tracking-tight select-none"
          :class="side === 'white' ? 'text-blue-700' : 'text-white'">
          <span
            class="text-[clamp(3rem,5vh,7rem)] md:text-[clamp(7rem,10vh,12rem)] lg:text-[clamp(10rem,10vh,12rem)] xl:text-[clamp(13rem,13vh,15rem)] leading-none">
            {{ store[side][type] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useScoreboardStore } from '@/stores/scoreboard'
const store = useScoreboardStore()
defineProps({ side: String })

let holdTimeout = null

// 👆 Clic normal → sumar
function handleTap(side, type) {
  store.incrementScore(side, type)
}

// ✋ Toque prolongado → restar
function startHold(side, type) {
  cancelHold() // evita duplicar si ya había un timeout
  holdTimeout = setTimeout(() => {
    store.decrementScore(side, type)
    // Vibración opcional (descomenta si deseas feedback háptico)
    // if (navigator.vibrate) navigator.vibrate(80)
  }, 600) // tiempo del toque largo
}

function cancelHold() {
  if (holdTimeout) {
    clearTimeout(holdTimeout)
    holdTimeout = null
  }
}
</script>
