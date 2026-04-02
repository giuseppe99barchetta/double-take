<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-180 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-140 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && match"
        class="fixed inset-0 z-40 flex items-center justify-center bg-[#02060dcc] p-4 sm:p-6"
        @click.self="emit('close')"
      >
        <div class="relative flex max-h-[92vh] w-full max-w-[min(1320px,96vw)] flex-col rounded-2xl border border-white/12 bg-[#08111b]/80 p-3 shadow-2xl backdrop-blur md:p-4">
          <div class="mb-3 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-white">{{ subjectLabel }}</p>
              <p class="truncate text-xs text-white/55">{{ match.cameraLabel }} • {{ confidenceLabel }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/85 transition hover:border-white/25 hover:bg-white/[0.08]"
                @click="emit('update:overlayVisible', !overlayVisible)"
              >
                {{ overlayVisible ? 'Hide overlays' : 'Show overlays' }}
              </button>
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-lg leading-none text-white/85 transition hover:border-white/25 hover:bg-white/[0.08]"
                @click="emit('close')"
              >
                <span class="sr-only">Close viewer</span>
                ×
              </button>
            </div>
          </div>

          <div class="relative flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-xl bg-black/45 p-2">
            <div class="relative w-fit max-w-full">
              <img
                :src="match.imageUrl || match.thumbnailUrl"
                :alt="`Recognition snapshot for ${subjectLabel}`"
                class="block h-auto max-h-screen max-w-full w-auto rounded-lg object-contain"
              >
              <MatchOverlay :detections="match.detections" :visible="overlayVisible" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import MatchOverlay from '@/features/matches/components/MatchOverlay.vue';
import type { MatchEvent } from '@/features/matches/types';

const props = defineProps<{
  match: MatchEvent | null;
  open: boolean;
  overlayVisible: boolean;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'update:overlayVisible', value: boolean): void;
}>();

const subjectLabel = computed(() => props.match?.subjectName ?? 'Unknown');
const confidenceLabel = computed(() => `${props.match?.confidence ?? 0}%`);

const onWindowKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) {
    emit('close');
  }
};

onMounted(() => {
  window.addEventListener('keydown', onWindowKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onWindowKeydown);
});
</script>
