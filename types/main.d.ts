declare module "terraria" {
  import biomes from "~/assets/biomes.json";
  import npcs from "~/assets/npcs.json";

  type Attitude = "love" | "like" | "dislike" | "hate";

  type Biome = keyof typeof biomes;
  type BiomeData = { [b in Biome]: Biome[] };

  type NPC = keyof typeof npcs;
  type NPCEntry = {
    biomes: { [k in Attitude]?: Biome };
    npcs: { [k in Attitude]: NPC[] };
  };
  type NPCData = { [npc in NPC]: NPCEntry };

  type NPCHolder = {
    npcs: NPC[];
    selected: NPC[];
  };

  type HousingGroup = NPCHolder & {
    biomes: Biome[];
  };

  type SavedHousingGroup = Omit<HousingGroup, "selected">;

  type HousingWorld = NPCHolder & {
    houses: HousingGroup[];
  };

  type SavedHousingWorld = Omit<NPCHolder, "selected"> & {
    houses: SavedHousingGroup[];
  };

  type SavedWorlds = {
    __default?: SavedHousingWorld;
    [key: string]: SavedHousingWorld;
  };

  type HappinessModifier = {
    amount: number;
    cause: AttitudeCause | "crowded" | "solitude";
  };

  type AttitudeCause = {
    target: NPC | Biome;
    attitude: Attitude;
  };

  type HappinessResult = {
    resultFormatted: string;
    result: number;
    modifiers: HappinessModifier[];
  };

  type HappinessClass = {
    class: string;
    level: number;
  };
}
