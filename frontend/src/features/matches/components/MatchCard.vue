<template>
  <article
    class="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0c1621] transition duration-200 hover:border-white/15"
    :class="layout === 'list' ? 'flex flex-col md:flex-row' : 'flex h-full flex-col'"
  >
    <div
      class="relative overflow-hidden"
      :class="layout === 'list' ? 'md:w-[280px] md:shrink-0' : ''"
    >
      <img
        :src="match.snapshotUrl"
        :alt="imageAlt"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        :class="layout === 'list' ? 'aspect-[4/3] md:h-full md:aspect-auto' : 'aspect-[4/3]'"
      >

      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08111b]/70 via-transparent to-transparent" />

      <div
        v-if="isUnknown"
        class="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[0.68rem] font-medium text-white"
      >
        Unknown
      </div>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold tracking-tight text-white">{{ displayName }}</h2>
        </div>
        <div class="text-right">
          <p class="text-[0.65rem] uppercase tracking-[0.22em] text-white/35">Confidence</p>
          <p class="mt-1 text-base font-semibold text-white">{{ confidenceLabel }}</p>
        </div>
      </div>

      <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/45">
        <span>{{ match.cameraLabel }}</span>
        <span class="text-white/20">•</span>
        <span>{{ formattedDate }}</span>
      </div>

      <div class="mt-4 flex items-center gap-2 border-t border-white/8 pt-3">
        <button
          type="button"
          class="rounded-full border border-emerald-300/20 bg-emerald-300/12 px-3 py-1.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/18 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="isUnknown"
          @click="emit('confirm', match.id)"
        >
          Confirm
        </button>
        <button
          type="button"
          class="rounded-full border border-white/10 bg-transparent px-3 py-1.5 text-sm font-medium text-white/70 transition hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
          @click="emit('ignore', match.id)"
        >
          Ignore
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { MatchCardLayout, MatchEvent } from '@/features/matches/types';

const props = defineProps<{
  layout: MatchCardLayout;
  match: MatchEvent;
}>();

const emit = defineEmits<{
  (event: 'confirm', id: string): void;
  (event: 'ignore', id: string): void;
}>();

const isUnknown = computed(() => props.match.subjectName === null);
const displayName = computed(() => props.match.subjectName ?? 'Unknown');
const confidenceLabel = computed(() => `${props.match.confidence}%`);
const imageAlt = computed(() => `Recognition snapshot for ${displayName.value}`);
const formattedDate = computed(() =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(props.match.timestamp)),
);
</script>