<template>
  <div class="flex flex-col gap-3">
    <div class="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_220px_220px_auto]">
      <label class="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1621] px-4 py-3">
        <i class="pi pi-search text-sm text-white/35" />
        <input
          :value="searchQuery"
          type="search"
          placeholder="Search by subject"
          class="h-5 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          @input="handleSearchInput"
        >
      </label>

      <label class="flex items-center rounded-2xl border border-white/10 bg-[#0c1621] px-4 py-3">
        <select
          :value="statusFilter"
          class="h-5 w-full bg-transparent text-sm text-white outline-none"
          @change="handleStatusFilterChange"
        >
          <option v-for="option in statusFilterOptions" :key="option.value" :value="option.value" class="bg-slate-950 text-white">
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="flex items-center rounded-2xl border border-white/10 bg-[#0c1621] px-4 py-3">
        <select
          :value="sortOrder"
          class="h-5 w-full bg-transparent text-sm text-white outline-none"
          @change="handleSortOrderChange"
        >
          <option v-for="option in sortOptions" :key="option.value" :value="option.value" class="bg-slate-950 text-white">
            {{ option.label }}
          </option>
        </select>
      </label>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition"
        :class="advancedOpen || minConfidence !== 0 || maxConfidence !== 100 ? 'border-cyan-300/25 bg-cyan-300/12 text-cyan-100' : 'border-white/10 bg-[#0c1621] text-white/70 hover:border-white/15 hover:text-white'"
        @click="advancedOpen = !advancedOpen"
      >
        <i class="pi pi-sliders-h text-sm" />
        Filters
      </button>
    </div>

    <Transition
      enter-active-class="transition duration-180 ease-out"
      enter-from-class="-translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-1 opacity-0"
    >
      <div v-if="advancedOpen" class="rounded-2xl border border-white/10 bg-[#0c1621] p-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-medium text-white">Confidence range</p>
          <span class="text-sm text-white/55">{{ minConfidence }}% - {{ maxConfidence }}%</span>
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <label class="space-y-2">
            <span class="text-xs uppercase tracking-[0.22em] text-white/35">Minimum</span>
            <input
              :value="minConfidence"
              type="range"
              min="0"
              max="100"
              class="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-300"
              @input="handleMinConfidenceInput"
            >
          </label>

          <label class="space-y-2">
            <span class="text-xs uppercase tracking-[0.22em] text-white/35">Maximum</span>
            <input
              :value="maxConfidence"
              type="range"
              min="0"
              max="100"
              class="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-300"
              @input="handleMaxConfidenceInput"
            >
          </label>
        </div>
      </div>
    </Transition>

    <div class="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
      <div class="text-sm text-white/55">{{ resultsSummary }}</div>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-full border border-white/10 bg-transparent px-4 py-1.5 text-sm font-medium text-white/70 transition hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!hasActiveFilters"
        @click="$emit('reset')"
      >
        Clear filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { MatchCardLayout, MatchSortOrder, MatchStatusFilter } from '@/features/matches/types';

defineProps<{
  hasActiveFilters: boolean;
  maxConfidence: number;
  minConfidence: number;
  resultsSummary: string;
  searchQuery: string;
  sortOptions: ReadonlyArray<{ label: string; value: MatchSortOrder }>;
  sortOrder: MatchSortOrder;
  statusFilter: MatchStatusFilter;
  statusFilterOptions: ReadonlyArray<{ label: string; value: MatchStatusFilter }>;
  viewMode: MatchCardLayout;
  viewOptions: ReadonlyArray<{ label: string; value: MatchCardLayout }>;
}>();

const advancedOpen = ref(false);

const emit = defineEmits<{
  (event: 'reset'): void;
  (event: 'update:maxConfidence', value: number): void;
  (event: 'update:minConfidence', value: number): void;
  (event: 'update:searchQuery', value: string): void;
  (event: 'update:sortOrder', value: MatchSortOrder): void;
  (event: 'update:statusFilter', value: MatchStatusFilter): void;
  (event: 'update:viewMode', value: MatchCardLayout): void;
}>();

const handleSearchInput = (event: Event) => {
  emit('update:searchQuery', (event.target as HTMLInputElement).value);
};

const handleStatusFilterChange = (event: Event) => {
  emit('update:statusFilter', (event.target as HTMLSelectElement).value as MatchStatusFilter);
};

const handleSortOrderChange = (event: Event) => {
  emit('update:sortOrder', (event.target as HTMLSelectElement).value as MatchSortOrder);
};

const handleMinConfidenceInput = (event: Event) => {
  emit('update:minConfidence', Number((event.target as HTMLInputElement).value));
};

const handleMaxConfidenceInput = (event: Event) => {
  emit('update:maxConfidence', Number((event.target as HTMLInputElement).value));
};
</script>