<script lang="ts" setup>
import { Attitude, AttitudeCause, Biome, HappinessModifier, HappinessResult, HousingGroup, type NPC, NPCHolder } from "terraria";
import { useDataStore } from "~/store/data";
import { TerrariaDataTypes } from "~/types/enums";
import { WritableComputedRef } from "vue";

const attitudeHappiness: { [k in Attitude]: number } = {
  love: -0.12,
  like: -0.06,
  dislike: 0.06,
  hate: 0.12,
};

const props = withDefaults(
  defineProps<{
    npcHolder: NPCHolder;
    modelValue: NPC[];
    showHappiness?: boolean;
    house?: HousingGroup;
    selectedBiome?: Biome;
  }>(),
  {
    showHappiness: false,
    house: undefined, // TODO why is this needed?
    selectedBiome: undefined, // TODO this seems to be a bug
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: NPC[]): void;
  (e: "moveNpc", npc: NPC, newHolder: NPCHolder): void;
}>();

const modelProp: WritableComputedRef<NPC[]> = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const dataStore = useDataStore();

function onDrag(event: DragEvent) {
  if (event.target instanceof HTMLElement && window.visualViewport) {
    let deltaY = 0;
    if (event.clientY < event.target.clientHeight) {
      deltaY = -event.target.clientHeight;
    } else if (event.clientY > window.visualViewport.height - document.getElementById("footer")!.clientHeight - event.target.clientHeight) {
      deltaY = event.target.clientHeight;
    }
    if (deltaY != 0) {
      window.scrollBy({
        top: deltaY,
        behavior: "smooth",
      });
    }
  }
}

function onNpcDragStart(event: DragEvent, npc: NPC) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(TerrariaDataTypes.NPC, npc);
    npcLog("Started dragging npc: %s", npc);
  }
}

function allowNpcDrop(event: DragEvent) {
  if (event.dataTransfer && event.dataTransfer.types.includes(TerrariaDataTypes.NPC)) {
    event.dataTransfer.dropEffect = "copy";
    event.preventDefault();
  }
}

function onNpcDragEnter(event: DragEvent) {
  if (event.dataTransfer && event.dataTransfer.types.includes(TerrariaDataTypes.NPC)) {
    event.dataTransfer.dropEffect = "copy";
    event.preventDefault();
    // TODO show preview of drop
  }
}

function dropNpc(event: DragEvent, newHolder: NPCHolder) {
  if (event.dataTransfer) {
    const npc = event.dataTransfer.getData(TerrariaDataTypes.NPC) as NPC;
    if (newHolder.npcs.includes(npc)) {
      return;
    }
    emit("moveNpc", npc, newHolder);
  }
}

function calculateHappiness(npc: NPC): HappinessResult | undefined {
  if (!props.house || !props.showHappiness) return;
  let happiness = 1.0;
  const modifiers: HappinessModifier[] = [];
  if (props.house.npcs.length > 4) {
    const amount = +0.05 * (props.house.npcs.length - 4);
    happiness += amount;
    modifiers.push({ amount, cause: "crowded" });
  } else if (props.house.npcs.length < 4) {
    happiness += -0.05;
    modifiers.push({ amount: -0.05, cause: "solitude" });
  }
  happiness += calculateNpcBiomeHappiness(props.house, npc, modifiers, "love");
  happiness += calculateNpcBiomeHappiness(props.house, npc, modifiers, "like");
  happiness += calculateNpcBiomeHappiness(props.house, npc, modifiers, "dislike");
  happiness += calculateNpcBiomeHappiness(props.house, npc, modifiers, "hate");

  happiness += calculateNpcNeighborsHappiness(props.house, npc, modifiers, "love");
  happiness += calculateNpcNeighborsHappiness(props.house, npc, modifiers, "like");
  happiness += calculateNpcNeighborsHappiness(props.house, npc, modifiers, "dislike");
  happiness += calculateNpcNeighborsHappiness(props.house, npc, modifiers, "hate");

  const result = clamp(happiness, 0.75, 1.5);
  return {
    result,
    resultFormatted: formatAsPercent(result),
    modifiers: modifiers,
  };
}

function calculateNpcBiomeHappiness(house: HousingGroup, npc: NPC, modifiers: HappinessModifier[], attitude: AttitudeCause["attitude"]): number {
  const biome = dataStore.npcs[npc].biomes[attitude];
  if (biome && house.biomes.includes(biome)) {
    modifiers.push({ amount: attitudeHappiness[attitude], cause: { attitude, target: biome } });
    return attitudeHappiness[attitude];
  }
  return 0;
}

function calculateNpcNeighborsHappiness(house: HousingGroup, npc: NPC, modifiers: HappinessModifier[], attitude: AttitudeCause["attitude"]): number {
  const otherNpcs = dataStore.npcs[npc].npcs[attitude];
  let happinessDelta = 0;
  if (otherNpcs.length) {
    for (const otherNpc of otherNpcs) {
      if (house.npcs.includes(otherNpc)) {
        happinessDelta += attitudeHappiness[attitude];
        modifiers.push({ amount: attitudeHappiness[attitude], cause: { attitude, target: otherNpc } });
      }
    }
  }
  return happinessDelta;
}
</script>

<template>
  <VSheet
    elevation="3"
    rounded
    color="info"
    class="d-flex align-center flex-wrap"
    @dragover="allowNpcDrop"
    @dragenter="onNpcDragEnter"
    @drop="dropNpc($event, npcHolder)"
  >
    <slot />
    <VItemGroup v-if="npcHolder.npcs.length" v-model="modelProp" multiple selected-class="selected" class="d-flex flex-wrap flex-full">
      <NPCInfo
        v-for="npc in npcHolder.npcs"
        :key="`npc-${npc}`"
        :happiness="calculateHappiness(npc)"
        :npc="npc"
        :image="dataStore.getNpcImage(npc)"
        @dragstart="onNpcDragStart($event, npc)"
        @drag="onDrag"
      />
    </VItemGroup>
  </VSheet>
</template>
