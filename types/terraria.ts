import biomes from "~/assets/biomes.json";
import npcs from "~/assets/npcs.json";

export type Attitude = "love" | "like" | "dislike" | "hate";

export type Biome = keyof typeof biomes;
export type BiomeData = { [b in Biome]: Biome[] };

export type NPC = keyof typeof npcs;
export type NPCEntry = {
  biomes: { [k in Attitude]?: Biome };
  npcs: { [k in Attitude]: NPC[] };
};
export type NPCData = { [npc in NPC]: NPCEntry };

export type NPCHolder = {
  npcs: NPC[];
  selected: NPC[];
};

export type HousingGroup = NPCHolder & {
  biomes: Biome[];
};

export type SavedHousingGroup = Omit<HousingGroup, "selected">;

export type HousingWorld = NPCHolder & {
  houses: HousingGroup[];
};

export type SavedHousingWorld = Omit<NPCHolder, "selected"> & {
  houses: SavedHousingGroup[];
};

export type SavedWorlds = {
  __default?: SavedHousingWorld;
  [key: string]: SavedHousingWorld | undefined;
};

export type HappinessModifier = {
  amount: number;
  cause: AttitudeCause | "crowded" | "solitude";
};

export type AttitudeCause = {
  target: NPC | Biome;
  attitude: Attitude;
};

export type HappinessResult = {
  resultFormatted: string;
  result: number;
  modifiers: HappinessModifier[];
};

export type HappinessClass = {
  class: string;
  level: number;
};
