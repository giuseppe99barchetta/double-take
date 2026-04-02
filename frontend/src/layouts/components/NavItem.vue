<template>
  <RouterLink :to="to" custom v-slot="{ href, navigate, isActive, isExactActive }">
    <a
      ref="linkElement"
      :href="href"
      :aria-label="label"
      class="group relative flex h-11 items-center rounded-xl px-3 transition-all duration-200 ease-out"
      :class="[
        expanded ? 'w-full justify-start gap-3' : 'w-11 justify-center',
        isActive || isExactActive ? activeClasses : idleClasses,
      ]"
      @click="navigate"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
    >
      <span
        class="shrink-0 transition-all duration-200 ease-out group-hover:scale-105"
        :class="isActive || isExactActive ? 'text-cyan-100' : 'text-white/60 group-hover:text-white/90'"
      >
        <component :is="iconComponent" :size="18" :stroke-width="2.1" />
      </span>

      <span
        class="pointer-events-none min-w-0 overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out"
        :class="expanded ? 'max-w-[140px] translate-x-0 opacity-100' : 'max-w-0 -translate-x-1 opacity-0'"
      >
        {{ label }}
      </span>
    </a>
  </RouterLink>

  <Tooltip v-if="enableTooltip" :text="label" :trigger-ref="linkElement" :visible="isTooltipVisible" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Camera, Image, Settings, type LucideIcon } from 'lucide-vue-next';
import Tooltip from '@/shared/ui/Tooltip.vue';

const props = withDefaults(
  defineProps<{
    icon: string;
    label: string;
    to: string;
    expanded?: boolean;
    enableTooltip?: boolean;
  }>(),
  {
    expanded: false,
    enableTooltip: true,
  },
);

const linkElement = ref<HTMLElement | null>(null);
const isTooltipVisible = ref(false);

const showTooltip = () => {
  if (!props.enableTooltip) return;
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

const idleClasses = 'bg-transparent text-white/75 hover:bg-white/[0.06]';
const activeClasses =
  'border border-cyan-200/30 bg-cyan-300/14 text-cyan-100 shadow-[0_0_0_1px_rgba(125,211,252,0.15),0_8px_24px_-16px_rgba(125,211,252,0.85)]';
</script>