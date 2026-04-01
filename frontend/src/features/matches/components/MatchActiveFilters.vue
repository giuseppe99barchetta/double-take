<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <TransitionGroup
      tag="div"
      class="flex flex-wrap items-center gap-2"
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-1 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in absolute"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-1 opacity-0 scale-95"
      move-class="transition duration-200"
    >
      <div
        v-for="filter in activeFilters"
        :key="filter.id"
        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0c1621] px-3 py-1.5 text-sm text-white/80"
      >
        <span class="text-white/40">{{ filter.label }}</span>
        <span class="font-medium text-white">{{ filter.value }}</span>
        <button
          type="button"
          class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-white/65 transition hover:bg-white/12 hover:text-white"
          @click="$emit('remove', filter.id)"
        >
          <span class="sr-only">Remove {{ filter.label }} filter</span>
          <span class="text-xs leading-none">×</span>
        </button>
      </div>
    </TransitionGroup>

    <button
      type="button"
      class="inline-flex items-center justify-center rounded-full border border-white/10 bg-transparent px-4 py-1.5 text-sm font-medium text-white/70 transition hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
      @click="$emit('clear')"
    >
      Clear all
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MatchActiveFilter, MatchActiveFilterId } from '@/features/matches/types';

defineProps<{
  activeFilters: MatchActiveFilter[];
}>();

defineEmits<{
  (event: 'clear'): void;
  (event: 'remove', value: MatchActiveFilterId): void;
}>();
</script>