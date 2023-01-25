import { defineStore } from "pinia";
import biomeData from "~/assets/biomes.json";
import npcData from "~/assets/npcs.json";
import { Biome, BiomeData, NPC, NPCData } from "terraria";
import { filename } from "pathe/utils";
import { Ref } from "vue";

export const useDataStore = defineStore("data", () => {
  const biomes = ref(biomeData as BiomeData);
  const possibleBiomes: Ref<Biome[]> = ref(Object.keys(biomes.value) as Biome[]);

  const npcs = ref(npcData as NPCData);
  const possibleNpcs = ref(Object.keys(npcs.value) as NPC[]);

  const images = {
    npcs: gatherImages(import.meta.glob("~/assets/images/npcs/*.webp", { eager: true }) as Record<string, any>),
    biomes: gatherImages(import.meta.glob("~/assets/images/biomes/*.webp", { eager: true }) as Record<string, any>),
  };

  function gatherImages(modules: Record<string, any>) {
    return Object.fromEntries(Object.entries(modules).map(([key, value]) => [filename(key), value.default]));
  }

  function getNpcImage(npc: NPC) {
    return images.npcs[npc.replace(" ", "_")];
  }

  return { biomes, possibleBiomes, npcs, possibleNpcs, images, getNpcImage };
});
