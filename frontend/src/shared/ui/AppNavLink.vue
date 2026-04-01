<template>
  <RouterLink :to="to" custom v-slot="{ href, navigate, isActive, isExactActive }">
    <a
      :href="href"
      :aria-label="label"
      class="group relative rounded-2xl transition duration-200"
      :class="[
        compact ? 'flex h-11 w-11 items-center justify-center rounded-xl' : 'flex items-center gap-3 px-3 py-3',
        isActive || isExactActive ? activeClasses : idleClasses,
      ]"
      @click="navigate"
    >
      <span
        class="shrink-0 transition"
        :class="isActive || isExactActive ? 'text-cyan-100' : 'text-white/55 group-hover:text-white/85'"
      >
        <component :is="iconComponent" :size="18" :stroke-width="2.1" />
      </span>

      <span v-if="!compact" class="min-w-0 flex-1 text-sm font-medium text-white">{{ label }}</span>

      <span
        v-if="compact"
        role="tooltip"
        class="pointer-events-none absolute left-[calc(100%+0.7rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-[#111a25] px-2.5 py-1.5 text-xs font-medium text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)] ring-1 ring-white/8 group-hover:block"
      >
        {{ label }}
      </span>
    </a>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Camera, Image, Settings, type LucideIcon } from 'lucide-vue-next';

const props = defineProps<{
  compact?: boolean;
  icon: string;
  label: string;
  to: string;
}>();

const icons: Record<string, LucideIcon> = {
  image: Image,
  camera: Camera,
  settings: Settings,
};

const iconComponent = computed(() => icons[props.icon] ?? Image);

const idleClasses = 'bg-transparent text-white/70 hover:bg-white/[0.05]';
const activeClasses = 'bg-cyan-300/14 text-cyan-100 shadow-[0_0_0_1px_rgba(125,211,252,0.18),0_10px_24px_-18px_rgba(125,211,252,0.85)]';
</script>