<script lang="ts" setup>
import type { Biome, HousingGroup, HousingWorld, NPC, NPCHolder, SavedHousingWorld, SavedWorlds } from "~/types/terraria";
import { type ComputedRef, type Ref } from "vue";
import { useDataStore } from "~/store/data";
import NPCSelect from "~/components/NPCSelect.vue";

const dataStore = useDataStore();

const world: Ref<HousingWorld> = ref({
  houses: [],
  npcs: [...dataStore.possibleNpcs],
  selected: [],
});

const selectedBiome: Ref<Biome | undefined> = ref<Biome>();

const selectedNpcs: ComputedRef<NPC[]> = computed(() => {
  const npcs = [...world.value.selected];
  for (const house of world.value.houses) {
    npcs.push(...house.selected);
  }
  return npcs;
});

watch(selectedNpcs, (newVal) => {
  if (newVal.length) {
    selectedBiome.value = undefined;
  }
  refreshCanLoad();
});

watch(selectedBiome, (newVal) => {
  if (newVal) {
    world.value.selected = [];
    for (const house of world.value.houses) {
      house.selected = [];
    }
  }
  refreshCanLoad();
});

watch(world, () => refreshCanLoad());

const canLoad: Ref<boolean> = ref(false);
onMounted(() => {
  refreshCanLoad();
  if (canLoad.value) {
    load();
  }
});

function refreshCanLoad() {
  if (process.server || world.value.houses.length) {
    return false;
  }
  const defaultWorld = (JSON.parse(window.localStorage.getItem("worlds") || "{}") as SavedWorlds)["__default"];
  canLoad.value = !!defaultWorld;
}

function load() {
  if (process.server) return;
  const worldsData = JSON.parse(window.localStorage.getItem("worlds") || "{}") as SavedWorlds;
  if (!worldsData.__default) return;
  clear();
  world.value.houses = worldsData.__default.houses.map((h) => ({ npcs: h.npcs, selected: [], biomes: h.biomes }));
  world.value.npcs = [...worldsData.__default.npcs];
}

function save() {
  if (process.server) return;
  const defaultWorldData: SavedHousingWorld = {
    houses: world.value.houses.map((h) => ({ npcs: h.npcs, biomes: h.biomes })),
    npcs: [...world.value.npcs],
  };
  const worldsData: SavedWorlds = {
    __default: defaultWorldData,
  };
  window.localStorage.setItem("worlds", JSON.stringify(worldsData));
  refreshCanLoad();
}

function clear() {
  world.value = {
    houses: [],
    npcs: [...dataStore.possibleNpcs],
    selected: [],
  };
  selectedBiome.value = undefined;
}

function addHouse() {
  const house: HousingGroup = {
    npcs: [],
    biomes: [],
    selected: [],
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

function validBiomes(house: HousingGroup, includeCurrent = false): Biome[] {
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

function moveNpc(npc: NPC, newHolder: NPCHolder, currentHolder?: NPCHolder) {
  const currentNpcHolder = currentHolder || findNpcHolder(npc);
  if (!currentNpcHolder) {
    npcLog("Could not find the current NPCHolder for %s", npc);
  } else {
    npcLog("Moving npc %s from current holder %s to new holder %s", npc, "houses" in currentNpcHolder ? "'world'" : "'house'");
    currentNpcHolder.npcs = currentNpcHolder.npcs.filter((v) => v !== npc);
    newHolder.npcs.push(npc);
    if (currentNpcHolder.selected.includes(npc)) {
      currentNpcHolder.selected = currentNpcHolder.selected.filter((v) => v !== npc);
      newHolder.selected.push(npc);
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
</script>

<template>
  <VContainer>
    <VRow dense>
      <VCol cols="12" sm="4">
        <VBtn :disabled="!canLoad" color="primary" prepend-icon="mdi-download" block @click="load">Load</VBtn>
      </VCol>
      <VCol cols="12" sm="4">
        <VBtn :disabled="!world.houses.length" color="primary" prepend-icon="mdi-content-save" block @click="save">Save</VBtn>
      </VCol>
      <VCol cols="12" sm="4">
        <VBtn :disabled="!(world.houses.length || world.selected.length || selectedBiome)" color="primary" prepend-icon="mdi-backspace" block @click="clear">
          Clear
        </VBtn>
      </VCol>
    </VRow>
    <VRow dense>
      <VCol cols="12" lg="9">
        <BiomeSelect v-model="selectedBiome" :selected-npcs="selectedNpcs" />
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
        <NPCSelect v-model="world.selected" :npc-holder="world" :selected-biome="selectedBiome" :selected-npcs="selectedNpcs" class="pa-2" @move-npc="moveNpc">
          <div class="flex-full-text text-caption">Drag NPCs to Houses</div>
        </NPCSelect>
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
              <NPCSelect
                v-model="house.selected"
                :npc-holder="house"
                :house="house"
                :selected-biome="selectedBiome"
                :selected-npcs="selectedNpcs"
                min-height="50"
                class="pa-1"
                show-happiness
                @move-npc="moveNpc"
              >
                <div class="flex-full-text text-caption">Drop NPCs Here</div>
              </NPCSelect>
            </VSheet>
          </VCol>
        </VRow>
      </VCol>
    </VRow>
  </VContainer>
</template>
