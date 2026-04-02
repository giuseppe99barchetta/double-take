<template>
  <div v-if="visible && detections.length > 0" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      v-for="(detection, index) in detections"
      :key="`${index}-${detection.subject ?? 'unknown'}-${detection.confidence}`"
      class="absolute rounded-md border-2 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
      :class="detection.isRecognized ? 'border-cyan-300' : 'border-orange-300'"
      :style="toBoxStyle(detection)"
    >
      <div
        class="absolute z-10 max-w-[120px] rounded bg-black/70 font-medium leading-tight text-white opacity-90 transition-opacity duration-150 group-hover:opacity-100"
        :class="[labelVerticalClass(detection), labelHorizontalClass(detection)]"
      >
        <span class="block truncate">{{ detection.subject ?? 'Unknown' }}</span>
        <span class="block text-[10px] text-white/80">{{ detection.confidence }}%</span>
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

const NEAR_TOP_THRESHOLD_PCT = 8;
const RIGHT_EDGE_THRESHOLD_PCT = 92;

const toBoxStyle = (detection: MatchDetection) => ({
  left: `${detection.box.leftPct}%`,
  top: `${detection.box.topPct}%`,
  width: `${detection.box.widthPct}%`,
  height: `${detection.box.heightPct}%`,
});

const labelVerticalClass = (detection: MatchDetection) =>
  detection.box.topPct < NEAR_TOP_THRESHOLD_PCT ? 'top-full mt-1' : 'bottom-full mb-1';

const labelHorizontalClass = (detection: MatchDetection) =>
  detection.box.leftPct + detection.box.widthPct > RIGHT_EDGE_THRESHOLD_PCT ? 'right-0' : 'left-0';
</script>
