<script lang="ts" setup>
import biomeData from "~/assets/biomes.json";
import npcData from "~/assets/npcs.json";
import { Attitude, AttitudeCause, Biome, BiomeData, HappinessModifier, HappinessResult, HousingGroup, HousingWorld, NPC, NPCData, NPCHolder } from "terraria";
import { Ref } from "vue";

const attitudeHappiness: { [k in Attitude]: number } = {
  love: -0.12,
  like: -0.06,
  dislike: 0.06,
  hate: 0.12,
};
const biomes = biomeData as BiomeData;
const possibleBiomes = Object.keys(biomes) as Biome[];
const npcs = npcData as NPCData;

enum TerrariaDataTypes {
  NPC = "terraria/npc",
}

const world: Ref<HousingWorld> = ref({
  houses: [],
  npcs: Object.keys(npcs) as NPC[],
});

function addHouse() {
  const house: HousingGroup = {
    npcs: [],
    biomes: [],
  };
  house.biomes.push(validBiomes(house)[0]);
  world.value.houses.push(house);
}

function validBiomes(house: HousingGroup, includeCurrent = false) {
  const validBiomes = new Set<Biome>();
  for (const possibleBiome of possibleBiomes) {
    if (house.biomes.includes(possibleBiome)) {
      if (includeCurrent) {
        validBiomes.add(possibleBiome);
      }
    } else if (house.biomes.every((b) => biomes[b].includes(possibleBiome))) {
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
    event.dataTransfer.setData("terraria/npc", npc);
    npcLog("Started dragging npc: %s", npc);
  }
}

function onNpcDragEnter(event: DragEvent) {
  console.log(event.target);
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

function moveNpc(event: DragEvent, newHolder: NPCHolder) {
  if (event.dataTransfer) {
    const npc = event.dataTransfer.getData("terraria/npc") as NPC;
    if (newHolder.npcs.includes(npc)) {
      return;
    }
    const currentNpcHolder = findNpcHolder(npc);
    if (!currentNpcHolder) {
      npcLog("Could not find the current NPCHolder for %s", npc);
    } else {
      npcLog("Moving npc %s from current holder %s to new holder %s", npc, "houses" in currentNpcHolder ? "'world'" : "'house'");
      removeNpc(currentNpcHolder, npc);
      addNpc(newHolder, npc);
    }
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
  const biome = npcs[npc].biomes[attitude];
  if (biome && house.biomes.includes(biome)) {
    modifiers.push({ amount: attitudeHappiness[attitude], cause: { attitude, target: biome } });
    return attitudeHappiness[attitude];
  }
  return 0;
}

function calculateNpcNeighborsHappiness(house: HousingGroup, npc: NPC, modifiers: HappinessModifier[], attitude: AttitudeCause["attitude"]): number {
  const otherNpcs = npcs[npc].npcs[attitude];
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
    <VBtn v-if="world.npcs.length" block color="primary" class="mb-2" @click="addHouse">+ House</VBtn>
    <VRow>
      <VCol cols="4">
        <VSheet
          elevation="3"
          rounded
          color="info"
          class="pa-2 d-flex flex-wrap"
          @dragenter="onNpcDragEnter"
          @dragover="allowDrop($event, 'terraria/npc')"
          @drop="moveNpc($event, world)"
        >
          <NPCInfo v-for="npc in world.npcs" :key="`npc-left-${npc}`" :npc="npc" @dragstart="onNpcDragStart($event, npc)">
            <img :src="`/images/npcs/${npc.replace(' ', '_')}.webp`" :alt="npc" />
            <span class="ml-1 flex-grow-1 text-right">{{ npc }}</span>
          </NPCInfo>
        </VSheet>
      </VCol>
      <VCol cols="8">
        <VRow>
          <VCol v-for="(house, i) in world.houses" :key="`house-${i}`" cols="6">
            <VSheet elevation="3" rounded class="pa-3">
              <VSelect v-model="house.biomes" :items="validBiomes(house, true)" color="primary" label="Biomes" density="compact" multiple clearable />
              <VSheet
                elevation="3"
                rounded
                color="info"
                min-height="50"
                class="d-flex flex-column align-center px-2 py-1"
                @dragenter="onNpcDragEnter"
                @dragover="allowDrop($event, 'terraria/npc')"
                @drop="moveNpc($event, house)"
              >
                <NPCInfo
                  v-for="npc in house.npcs"
                  :key="`house-${i}-npc-${npc}`"
                  :npc="npc"
                  :happiness="calculateHappiness(house, npc)"
                  @dragstart="onNpcDragStart($event, npc)"
                />
                <span class="font-italic text-caption mt-3">Drop NPCs Here</span>
              </VSheet>
            </VSheet>
          </VCol>
        </VRow>
      </VCol>
    </VRow>
  </VContainer>
</template>
