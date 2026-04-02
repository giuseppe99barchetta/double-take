<template>
  <Teleport to="body">
    <Transition name="tooltip-fade">
      <div
        v-if="visible && triggerElement"
        role="tooltip"
        class="pointer-events-none fixed left-0 top-0 z-[9999]"
        :style="tooltipStyle"
      >
        <div class="relative">
          <div class="whitespace-nowrap rounded-md bg-[#111a25] px-2.5 py-1.5 text-xs font-medium text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)] ring-1 ring-white/8">
            {{ text }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue';

const props = defineProps<{
  text: string;
  triggerRef: HTMLElement | null | { value: HTMLElement | null };
  visible: boolean;
}>();

const triggerElement = computed(() => {
  const ref = props.triggerRef;
  // Handle both ref objects and direct elements
  return ref && 'value' in ref ? ref.value : ref;
});

const tooltipStyle = computed(() => {
  if (!props.visible || !triggerElement.value) return {};

  const gap = 12;
  const rect = triggerElement.value.getBoundingClientRect();

  // Position tooltip to the right of trigger, centered vertically.
  const left = rect.right + gap;
  const top = rect.top + rect.height / 2;

  return {
    left: `${left}px`,
    top: `${top}px`,
    transform: 'translateY(-50%)',
  };
});
</script>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
