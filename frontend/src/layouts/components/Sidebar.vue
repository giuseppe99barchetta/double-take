<template>
  <aside class="fixed inset-y-0 left-0 z-40 p-3">
    <div
      class="flex h-full flex-col overflow-visible rounded-[1.25rem] bg-[#0c1621] py-3 transition-[width] duration-200 ease-out"
      :class="isExpanded ? 'w-52 px-3' : 'w-16 px-2'"
      @mouseenter="setExpanded(true)"
      @mouseleave="setExpanded(false)"
    >
      <div class="flex h-10 items-center" :class="isExpanded ? 'justify-start' : 'justify-center'">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-cyan-100">
          <LogoMark class="h-5 w-5" />
        </div>
      </div>

      <nav class="mt-6 flex flex-1 flex-col gap-2" aria-label="Primary">
        <NavItem
          v-for="item in navigationItems"
          :key="item.to"
          :icon="item.icon"
          :label="item.label"
          :to="item.to"
          :expanded="isExpanded"
          :enable-tooltip="!isExpanded"
        />
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { navigationItems } from '@/shared/config/navigation';
import LogoMark from '@/components/ui/LogoMark.vue';
import NavItem from './NavItem.vue';

const emit = defineEmits<{
  (event: 'expand-change', value: boolean): void;
}>();

const isExpanded = ref(false);

const setExpanded = (value: boolean) => {
  isExpanded.value = value;
};

watch(isExpanded, (value) => {
  emit('expand-change', value);
});
</script>