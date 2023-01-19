<script setup lang="ts">
import biomes from "~/assets/biomes.json"
import npcs from "~/assets/npcs.json"

const biome1 = ref<keyof typeof biomes>("Ocean");
const biome2 = ref<keyof typeof biomes>(biomes["Ocean"][0] as any);

const selectedNpcs = ref<(keyof typeof npcs)[]>([])

</script>

<template>
  <select v-model="biome1">
    <option selected />
    <option v-for="biome in Object.keys(biomes)" :key="biome">{{ biome }}</option>
  </select>
  <select v-model="biome2" :disabled="!biome1">
    <option selected />
    <option v-for="biome in biomes[biome1]" :key="biome">{{ biome }}</option>
  </select>
  <br>
  <select v-for="i in selectedNpcs.length + 1" :key="`npc-select-${i}`" v-model="selectedNpcs[i - 1]">
    <option selected />
    <option v-for="npc in Object.keys(npcs)" :key="`npc-select-${i}-${npc}`">{{ npc }}</option>
  </select>
</template>