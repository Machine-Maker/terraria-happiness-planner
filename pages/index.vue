<script lang="ts" setup>
import { Attitude, AttitudeCause, Biome, HappinessModifier, HappinessResult, HousingGroup, HousingWorld, NPC, NPCHolder } from "terraria";
import { Ref } from "vue";
import { useDataStore } from "~/store/data";

const attitudeHappiness: { [k in Attitude]: number } = {
  love: -0.12,
  like: -0.06,
  dislike: 0.06,
  hate: 0.12,
};

enum TerrariaDataTypes {
  NPC = "terraria/npc",
}

const dataStore = useDataStore();

const world: Ref<HousingWorld> = ref({
  houses: [],
  npcs: [...dataStore.possibleNpcs],
});

function addHouse() {
  const house: HousingGroup = {
    npcs: [],
    biomes: [],
  };
  house.biomes.push(validBiomes(house)[0]);
  world.value.houses.push(house);
}

function removeHouse(houseIdx: number) {
  const house = world.value.houses[houseIdx];
  for (const npc of house.npcs) {
    moveNpc(npc, world.value, house);
  }
  world.value.houses.splice(houseIdx, 1);
}

function validBiomes(house: HousingGroup, includeCurrent = false) {
  const validBiomes = new Set<Biome>();
  for (const possibleBiome of dataStore.possibleBiomes) {
    if (house.biomes.includes(possibleBiome)) {
      if (includeCurrent) {
        validBiomes.add(possibleBiome);
      }
    } else if (house.biomes.every((b) => dataStore.biomes[b].includes(possibleBiome))) {
      validBiomes.add(possibleBiome);
    }
  }
  return Array.from(validBiomes);
}

function addNpc(holder: NPCHolder, npc: NPC) {
  holder.npcs.push(npc);
}

function removeNpc(holder: NPCHolder, npc: NPC) {
  holder.npcs = holder.npcs.filter((v) => v !== npc);
}

function onNpcDragStart(event: DragEvent, npc: NPC) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(TerrariaDataTypes.NPC, npc);
    npcLog("Started dragging npc: %s", npc);
  }
}

function onNpcDragEnter(event: DragEvent) {
  if (event.dataTransfer && event.dataTransfer.types.includes(TerrariaDataTypes.NPC)) {
    event.dataTransfer.dropEffect = "copy";
    event.preventDefault();
  }
}

function allowDrop(event: DragEvent, type: string) {
  if (event.dataTransfer && event.dataTransfer.types.includes(type)) {
    event.dataTransfer.dropEffect = "copy";
    event.preventDefault();
  }
}

function dropNpc(event: DragEvent, newHolder: NPCHolder) {
  if (event.dataTransfer) {
    const npc = event.dataTransfer.getData(TerrariaDataTypes.NPC) as NPC;
    if (newHolder.npcs.includes(npc)) {
      return;
    }
    moveNpc(npc, newHolder);
  }
}

function moveNpc(npc: NPC, newHolder: NPCHolder, currentHolder?: NPCHolder) {
  const currentNpcHolder = currentHolder || findNpcHolder(npc);
  if (!currentNpcHolder) {
    npcLog("Could not find the current NPCHolder for %s", npc);
  } else {
    npcLog("Moving npc %s from current holder %s to new holder %s", npc, "houses" in currentNpcHolder ? "'world'" : "'house'");
    removeNpc(currentNpcHolder, npc);
    addNpc(newHolder, npc);
  }
}

function findNpcHolder(npc: NPC): NPCHolder | undefined {
  if (world.value.npcs.includes(npc)) {
    return world.value;
  } else {
    return world.value.houses.find((house) => house.npcs.includes(npc));
  }
}

function calculateHappiness(house: HousingGroup, npc: NPC): HappinessResult {
  let happiness = 1.0;
  const modifiers: HappinessModifier[] = [];
  if (house.npcs.length > 4) {
    const amount = +0.05 * (4 - house.npcs.length);
    happiness += amount;
    modifiers.push({ amount, cause: "crowded" });
  } else if (house.npcs.length < 4) {
    happiness += -0.05;
    modifiers.push({ amount: -0.05, cause: "solitude" });
  }
  happiness += calculateNpcBiomeHappiness(house, npc, modifiers, "love");
  happiness += calculateNpcBiomeHappiness(house, npc, modifiers, "like");
  happiness += calculateNpcBiomeHappiness(house, npc, modifiers, "dislike");
  happiness += calculateNpcBiomeHappiness(house, npc, modifiers, "hate");

  happiness += calculateNpcNeighborsHappiness(house, npc, modifiers, "love");
  happiness += calculateNpcNeighborsHappiness(house, npc, modifiers, "like");
  happiness += calculateNpcNeighborsHappiness(house, npc, modifiers, "dislike");
  happiness += calculateNpcNeighborsHappiness(house, npc, modifiers, "hate");

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
  <VContainer>
    <VRow dense>
      <VCol cols="12" lg="9">
        <BiomeSelect />
      </VCol>
      <VCol cols="12" lg="3">
        <VBtn v-if="world.npcs.length" block color="primary" class="h-100" @click="addHouse">
          <v-icon icon="mdi-plus" size="2.5rem" />
          <v-icon icon="mdi-home" size="3rem" />
        </VBtn>
      </VCol>
    </VRow>
    <VRow dense>
      <VCol cols="12" sm="4" lg="3" xl="2">
        <VSheet
          elevation="3"
          rounded
          color="info"
          class="pa-2 d-flex flex-wrap"
          @dragenter="onNpcDragEnter"
          @dragover="allowDrop($event, 'terraria/npc')"
          @drop="dropNpc($event, world)"
        >
          <span class="flex-full-text text-center text-caption">Drag NPCs to Houses</span>
          <NPCInfo v-for="npc in world.npcs" :key="`npc-left-${npc}`" :npc="npc" :image="dataStore.getNpcImage(npc)" @dragstart="onNpcDragStart($event, npc)">
            <img :src="`/images/npcs/${npc.replace(' ', '_')}.webp`" :alt="npc" />
            <span class="ml-1 flex-grow-1 text-right">{{ npc }}</span>
          </NPCInfo>
        </VSheet>
      </VCol>
      <VCol cols="12" sm="8" lg="9" xl="10">
        <VRow>
          <VCol v-for="(house, houseIdx) in world.houses" :key="`house-${houseIdx}`" cols="12" lg="6" xl="4">
            <VSheet elevation="3" rounded class="pa-3 fab-parent">
              <VBtn class="fab close" icon="mdi-close" size="small" color="error" density="comfortable" @click="removeHouse(houseIdx)" />
              <VSelect
                v-model="house.biomes"
                :items="validBiomes(house, true)"
                color="primary"
                label="Biomes"
                density="comfortable"
                class="mb-1"
                multiple
                clearable
                hide-details
              />
              <VSheet
                elevation="3"
                rounded
                color="info"
                min-height="50"
                class="d-flex flex-wrap align-center px-2 py-1"
                @dragenter="onNpcDragEnter"
                @dragover="allowDrop($event, 'terraria/npc')"
                @drop="dropNpc($event, house)"
              >
                <NPCInfo
                  v-for="npc in house.npcs"
                  :key="`house-${houseIdx}-npc-${npc}`"
                  :npc="npc"
                  :image="dataStore.getNpcImage(npc)"
                  :happiness="calculateHappiness(house, npc)"
                  class="flex-full"
                  @dragstart="onNpcDragStart($event, npc)"
                />
                <span class="flex-full-text text-caption my-4">Drop NPCs Here</span>
              </VSheet>
            </VSheet>
          </VCol>
        </VRow>
      </VCol>
    </VRow>
  </VContainer>
</template>
