<template>
  <RouterLink :to="to" custom v-slot="{ href, navigate, isActive, isExactActive }">
    <a
      ref="linkElement"
      :href="href"
      :aria-label="label"
      class="group relative rounded-2xl transition duration-200"
      :class="[
        compact ? 'flex h-11 w-11 items-center justify-center rounded-xl' : 'flex items-center gap-3 px-3 py-3',
        isActive || isExactActive ? activeClasses : idleClasses,
      ]"
      @click="navigate"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
    >
      <span
        class="shrink-0 transition"
        :class="isActive || isExactActive ? 'text-cyan-100' : 'text-white/55 group-hover:text-white/85'"
      >
        <component :is="iconComponent" :size="18" :stroke-width="2.1" />
      </span>

      <span v-if="!compact" class="min-w-0 flex-1 text-sm font-medium text-white">{{ label }}</span>
    </a>
  </RouterLink>

  <Tooltip v-if="compact" :text="label" :trigger-ref="linkElement" :visible="isTooltipVisible" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Camera, Image, Settings, type LucideIcon } from 'lucide-vue-next';
import Tooltip from './Tooltip.vue';

const props = defineProps<{
  compact?: boolean;
  icon: string;
  label: string;
  to: string;
}>();

const linkElement = ref<HTMLElement | null>(null);
const isTooltipVisible = ref(false);

const showTooltip = () => {
  if (!props.compact) return;
  isTooltipVisible.value = true;
};

const hideTooltip = () => {
  isTooltipVisible.value = false;
};

const icons: Record<string, LucideIcon> = {
  image: Image,
  camera: Camera,
  settings: Settings,
};

const iconComponent = computed(() => icons[props.icon] ?? Image);

const idleClasses = 'bg-transparent text-white/70 hover:bg-white/[0.05]';
const activeClasses = 'bg-cyan-300/14 text-cyan-100 shadow-[0_0_0_1px_rgba(125,211,252,0.18),0_10px_24px_-18px_rgba(125,211,252,0.85)]';
</script>