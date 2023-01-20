declare module "terraria" {
  import biomes from "~/assets/biomes.json";
  import npcs from "~/assets/npcs.json";

  type Biome = keyof typeof biomes;
  type BiomeData = { [b in Biome]: Biome[] };

  type NPC = keyof typeof npcs;
  type NPCEntry = {
    biomes: { [k in "love" | "like" | "dislike" | "hate"]?: Biome };
    npcs: { [k in "love" | "like" | "dislike" | "hate"]: NPC[] };
  };
  type NPCData = { [npc in NPC]: NPCEntry };

  type NPCHolder = {
    npcs: NPC[];
  };

  type HousingGroup = NPCHolder & {
    biomes: Biome[];
  };

  type HousingWorld = NPCHolder & {
    houses: HousingGroup[];
  };

  type HappinessModifier = {
    amount: number;
    cause: AttitudeCause | "crowded" | "solitude";
  };

  type AttitudeCause = {
    target: NPC | Biome;
    attitude: "love" | "like" | "dislike" | "hate";
  };

  type HappinessResult = {
    resultFormatted: string;
    result: number;
    modifiers: HappinessModifier[];
  };
}
