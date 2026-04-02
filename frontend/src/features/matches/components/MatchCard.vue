<template>
  <BaseCard class="overflow-hidden">
    <template #default>
      <article
        class="group flex flex-col h-full"
        :class="layout === 'list' ? 'md:flex-row' : ''"
      >
        <div
          class="relative overflow-hidden shrink-0"
          :class="mediaClass"
        >
          <button
            type="button"
            class="block h-full w-full cursor-zoom-in"
            :aria-label="`Open ${displayName} image in fullscreen`"
            @click="emit('preview', match.id)"
          >
            <img
              :src="match.thumbnailUrl"
              :alt="imageAlt"
              class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              :class="layout === 'list' ? 'aspect-[4/3] md:h-full md:aspect-auto' : ''"
            >
          </button>

          <MatchOverlay :detections="match.detections" :visible="overlayVisible" />

          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08111b]/70 via-transparent to-transparent" />

        </div>

        <div class="flex min-w-0 flex-1 flex-col p-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h2 class="truncate text-base font-semibold tracking-tight text-white">{{ displayName }}</h2>
            </div>
            <div class="text-right">
              <p class="text-[0.62rem] uppercase tracking-[0.2em] text-white/35">Confidence</p>
              <p class="mt-0.5 text-sm font-semibold text-white">{{ confidenceLabel }}</p>
            </div>
          </div>

          <div class="mt-1.5 flex min-w-0 items-center text-xs text-white/45">
            <span>{{ formattedDate }}</span>
          </div>

          <div class="mt-3 flex items-center gap-2 border-t border-white/8 pt-2.5">
            <button
              type="button"
              class="rounded-full border border-emerald-300/20 bg-emerald-300/12 px-2.5 py-1.5 text-xs font-medium text-emerald-100 transition hover:bg-emerald-300/18 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="isUnknown"
              @click="emit('confirm', match.id)"
            >
              Confirm
            </button>
            <button
              type="button"
              class="rounded-full border border-white/10 bg-transparent px-2.5 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
              @click="emit('ignore', match.id)"
            >
              Ignore
            </button>
          </div>
        </div>
      </article>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseCard from '@/shared/ui/BaseCard.vue';
import MatchOverlay from '@/features/matches/components/MatchOverlay.vue';

import type { MatchCardLayout, MatchEvent } from '@/features/matches/types';

const props = defineProps<{
  layout: MatchCardLayout;
  match: MatchEvent;
  overlayVisible: boolean;
}>();

const emit = defineEmits<{
  (event: 'confirm', id: string): void;
  (event: 'ignore', id: string): void;
  (event: 'preview', id: string): void;
}>();

const isUnknown = computed(() => props.match.subjectName === null);
const displayName = computed(() => props.match.subjectName ?? 'Unknown');
const confidenceLabel = computed(() => `${props.match.confidence}%`);
const imageAlt = computed(() => `Recognition snapshot for ${displayName.value}`);
const mediaClass = computed(() => {
  if (props.layout === 'list') {
    return 'md:w-[280px]';
  }

  return 'aspect-[4/3]';
});
const formattedDate = computed(() =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(props.match.timestamp)),
);
</script>