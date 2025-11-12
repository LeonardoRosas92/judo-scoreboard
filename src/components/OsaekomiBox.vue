<template>
  <div class="flex flex-col items-center text-center">
    <div @click="store.toggleOsaekomi(side)" class="text-3xl font-bold cursor-pointer p-2 rounded-lg"
      :class="store.osaekomi[side].running ? 'bg-green-500 text-white' : 'bg-gray-400 text-black'">
      Osaekomi: {{ formattedOsaekomi }}
    </div>

    <button class="text-sm mt-1 underline text-gray-600 hover:text-black" @click="store.resetOsaekomi(side)">
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

// 🕒 Computed para mostrar 00:00
const formattedOsaekomi = computed(() => {
  const seconds = store.osaekomi[side].seconds || 0;
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
});
</script>
