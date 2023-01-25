<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
<script setup lang="ts">
import { HappinessModifier, HappinessResult, NPC } from "terraria";

const props = defineProps<{
  npc: NPC;
  happiness?: HappinessResult | undefined;
  image: string;
}>();

const textColor = computed(() => {
  if (!props.happiness) {
    return "";
  } else {
    if (props.happiness.result > 1) {
      return "happiness-bad-text";
    } else if (props.happiness.result == 1) {
      return "happiness-normal-text";
    } else if (props.happiness.result > 0.9) {
      return "happiness-ok-text";
    } else if (props.happiness.result > 0.85) {
      return "happiness-good-text";
    } else if (props.happiness.result > 0.8) {
      return "happiness-excellent-text";
    } else {
      return "happiness-very-excellent-text";
    }
  }
});

function printCause(modifier: HappinessModifier): string {
  if (modifier.cause === "crowded") {
    return "Overcrowding";
  } else if (modifier.cause === "solitude") {
    return "Solitude";
  } else {
    return `(${modifier.cause.attitude}) ${modifier.cause.target}`;
  }
}
</script>
<template>
  <VItem v-slot="{ toggle, selectedClass }" :value="npc">
    <div
      class="npc d-flex align-center pa-1 ma-1"
      :class="[happiness ? 'flex-full happiness ' : 'flex-grow-1', selectedClass]"
      draggable="true"
      v-bind="$attrs"
      @click="toggle"
    >
      <img :src="image" :alt="npc" />
      <template v-if="happiness">
        <span class="ml-1" :class="textColor">{{ happiness.resultFormatted }}</span>
        <VMenu open-on-hover>
          <template #activator="{ props: menuProps }">
            <VIcon icon="mdi-information" size="x-small" v-bind="menuProps" class="npc-happiness-info ml-1" />
          </template>
          <VSheet color="accent" rounded class="pa-2">
            <div v-for="(modifier, idx) in happiness.modifiers" :key="`npc-${npc}-happiness-${idx}`">
              {{ formatAsPercent(modifier.amount, true) + " " + printCause(modifier) }}
            </div>
          </VSheet>
        </VMenu>
      </template>
      <span class="flex-grow-1 text-right" :class="textColor">{{ npc }}</span>
    </div>
  </VItem>
</template>
<style lang="scss" scoped>
.npc {
  cursor: pointer;
  background-color: #0002;
  border-radius: 6px;
  border: transparent 2px solid;
  box-sizing: border-box;

  &.selected {
    border-color: darkgray;
    background-color: #0003;

    &:hover {
      background-color: #0005;
    }
  }

  &:hover {
    background-color: #0004;
  }

  &.happiness {
    font-weight: bold;
  }
}

.npc-happiness-info {
  cursor: help;
}
</style>
