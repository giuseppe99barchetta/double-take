<template>
  <div class="relative min-h-screen overflow-hidden bg-[#08111b]">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.06]" />
    </div>

    <Sidebar @expand-change="isSidebarExpanded = $event" />

    <div class="relative min-h-screen w-full min-w-0 transition-[padding-left] duration-200 ease-out" :class="isSidebarExpanded ? 'pl-52' : 'pl-16'">
      <div class="flex min-h-[calc(100vh-1.5rem)] min-w-0 flex-1 flex-col px-3 py-3 sm:px-4 lg:px-6 lg:py-5">
        <header class="flex items-center gap-3 border-b border-white/8 px-1 pb-3 sm:hidden">
          <BrandMark />
        </header>

        <main class="min-w-0 flex-1 py-3 sm:py-4 lg:py-5">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BrandMark from '@/shared/ui/BrandMark.vue';
import Sidebar from './components/Sidebar.vue';

const isSidebarExpanded = ref(false);
</script>