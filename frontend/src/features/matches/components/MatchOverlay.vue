<template>
  <div v-if="visible && detections.length > 0" class="pointer-events-none absolute inset-0">
    <div
      v-for="(detection, index) in detections"
      :key="`${index}-${detection.subject ?? 'unknown'}-${detection.confidence}`"
      class="absolute rounded-md border-2 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
      :class="detection.isRecognized ? 'border-cyan-300' : 'border-orange-300'"
      :style="toBoxStyle(detection)"
    >
      <div
        class="absolute left-0 top-0 max-w-[calc(100%-0.35rem)] translate-x-[0.2rem] translate-y-[0.2rem] rounded-md px-2 py-1 text-[0.68rem] font-medium leading-tight text-white backdrop-blur"
        :class="detection.isRecognized ? 'bg-cyan-950/72' : 'bg-orange-950/72'"
      >
        <span class="block truncate">{{ detection.subject ?? 'Unknown' }}</span>
        <span class="block text-[0.62rem] text-white/80">{{ detection.confidence }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MatchDetection } from '@/features/matches/types';

defineProps<{
  detections: MatchDetection[];
  visible: boolean;
}>();

const toBoxStyle = (detection: MatchDetection) => ({
  left: `${detection.box.leftPct}%`,
  top: `${detection.box.topPct}%`,
  width: `${detection.box.widthPct}%`,
  height: `${detection.box.heightPct}%`,
});
</script>
