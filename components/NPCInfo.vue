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
    return "text-white";
  } else {
    if (props.happiness.result > 1) {
      return "text-red-lighten-1";
    } else if (props.happiness.result == 1) {
      return "text-yellow-lighten-2";
    } else if (props.happiness.result > 0.9) {
      return "text-lime-accent-1";
    } else if (props.happiness.result > 0.85) {
      return "text-light-green-accent-1";
    } else if (props.happiness.result > 0.8) {
      return "text-light-green-accent-2";
    } else {
      return "text-light-green-accent-3";
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

    &.happiness {
      background-color: #0005;

      &:hover {
        background-color: #0006;
      }
    }
  }

  &:hover {
    background-color: #0004;
  }

  &.happiness {
    background-color: #0004;
    font-weight: bold;

    &:hover {
      background-color: #0006;
    }
  }
}

.npc-happiness-info {
  cursor: help;
}
</style>
