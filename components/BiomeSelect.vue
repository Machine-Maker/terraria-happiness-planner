<script lang="ts" setup>
import { useDataStore } from "~/store/data";

const dataStore = useDataStore();
</script>

<template>
  <VSheet rounded color="secondary">
    <VItemGroup selected-class="selected" class="d-flex justify-space-around align-stretch flex-wrap">
      <VItem v-for="biome in dataStore.possibleBiomes" :key="biome" v-slot="{ toggle, selectedClass }">
        <div class="d-flex ma-1 pa-1 justify-center align-center flex-grow-1 biome" :class="selectedClass" @click="toggle">
          <img :src="dataStore.images.biomes[biome]" :alt="biome" />
          <span class="ml-1">{{ biome }}</span>
        </div>
      </VItem>
    </VItemGroup>
    <div class="text-caption no-select text-center">Select a biome to view NPCs' attitudes towards it</div>
  </VSheet>
</template>
<style lang="scss" scoped>
.biome {
  cursor: pointer;
  border-radius: 6px;
  border: transparent 2px solid;
  box-sizing: border-box;
  user-select: none;
  background-color: #0002;

  &:hover {
    background-color: #0004;
  }

  &.selected {
    border-color: gray;
    background-color: #0003;
  }
}
</style>
