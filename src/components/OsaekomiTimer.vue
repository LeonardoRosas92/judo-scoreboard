<template>
  <div class="flex flex-col items-center text-center rounded-xl">
    <div @click="store.toggleOsaekomi(side)"
      class="flex flex-col items-center justify-center cursor-pointer p-4 rounded-xl w-[clamp(7rem,18vw,14rem)] md:w-[clamp(9rem,24vw,18rem)] h-[clamp(6rem,16vh,12rem)] md:h-[clamp(8em,24vh,18rem)] transition shadow-lg"
      :class="[
        // color base según el competidor
        side === 'white' ? 'bg-white text-blue-700' : 'bg-blue-700 text-white',
        // color dinámico si el osaekomi está corriendo
        store.osaekomi[side].running ? ' text-green-500' : ''
      ]">
      <!-- Título -->
      <span class="text-xl sm:text-2xl xl:text-4xl font-semibold mb-1">
        Osaekomi
      </span>

      <!-- Timer -->
      <span class="text-[clamp(1rem,6vh,10rem)] md:text-[clamp(3rem,8vh,12rem)] font-extrabold leading-none">
        {{ formattedOsaekomi }}
      </span>
    </div>

    <!-- Botón reiniciar -->
    <button class="text-sm xl:text-lg mt-2 underline  hover:text-gray-100" @click="store.resetOsaekomi(side)">
      Reiniciar
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useScoreboardStore } from "@/stores/scoreboard";

const props = defineProps({ side: String });
const side = props.side;
const store = useScoreboardStore();

const formattedOsaekomi = computed(() => {
  const seconds = store.osaekomi[side].seconds || 0;
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
});
</script>
