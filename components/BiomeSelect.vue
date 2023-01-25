<script lang="ts" setup>
import { Biome, NPC } from "terraria";
import { useDataStore } from "~/store/data";
import { WritableComputedRef } from "vue";

const props = defineProps<{
  modelValue?: Biome;
  selectedNpcs: NPC[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value?: Biome): void;
}>();

const modelProp: WritableComputedRef<Biome | undefined> = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const dataStore = useDataStore();

type HappinessResult = {
  class: string;
  level: number;
};

function getHighlightClass(biome: Biome) {
  if (props.selectedNpcs.length) {
    let result: HappinessResult | undefined;
    for (const selectedNpc of props.selectedNpcs) {
      const npcBiomeData = dataStore.npcs[selectedNpc].biomes;
      if (npcBiomeData.love === biome) {
        if (!result || result.level > 0) {
          result = { class: "happiness-very-excellent-bg", level: 2 };
        }
      } else if (npcBiomeData.like === biome) {
        if (!result || (result.level > 0 && result.level < 2)) {
          result = { class: "happiness-excellent-bg", level: 1 };
        }
      } else if (npcBiomeData.dislike === biome || npcBiomeData.hate == biome) {
        result = { class: "happiness-bad-bg", level: -1 };
      }
    }
    return result?.class || "";
  }
}
</script>

<template>
  <VSheet rounded color="secondary" elevation="3">
    <VItemGroup v-model="modelProp" selected-class="selected" class="d-flex justify-space-around align-stretch flex-wrap">
      <VItem v-for="biome in dataStore.possibleBiomes" :key="biome" v-slot="{ toggle, selectedClass }" :value="biome">
        <div class="d-flex ma-1 pa-1 justify-center align-center flex-grow-1 biome" :class="[selectedClass, getHighlightClass(biome)]" @click="toggle">
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

    &:hover {
      background-color: #0004;
    }
  }
}
</style>
