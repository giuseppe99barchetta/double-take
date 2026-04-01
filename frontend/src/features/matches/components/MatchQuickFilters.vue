<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      v-for="filter in quickFilters"
      :key="filter.id"
      type="button"
      :aria-pressed="filter.active"
      class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition duration-200"
      :class="filter.active ? 'border-cyan-300/30 bg-cyan-300/12 text-cyan-100' : 'border-white/10 bg-[#0c1621] text-white/65 hover:border-white/15 hover:bg-white/[0.04] hover:text-white'"
      @click="$emit('apply', filter.id)"
    >
      <span>{{ filter.label }}</span>
      <span
        v-if="typeof filter.count === 'number'"
        class="rounded-full px-2 py-0.5 text-[0.7rem]"
        :class="filter.active ? 'bg-cyan-300/18 text-cyan-50' : 'bg-white/[0.06] text-white/45'"
      >
        {{ filter.count }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MatchQuickFilter, MatchQuickFilterId } from '@/features/matches/types';

defineProps<{
  quickFilters: MatchQuickFilter[];
}>();

defineEmits<{
  (event: 'apply', value: MatchQuickFilterId): void;
}>();
</script>