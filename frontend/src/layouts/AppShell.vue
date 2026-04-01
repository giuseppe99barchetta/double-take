<template>
  <div class="relative min-h-screen overflow-hidden bg-[#08111b]">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.06]" />
    </div>

    <div class="relative mx-auto flex min-h-screen max-w-[1440px] gap-4 px-3 py-3 sm:px-4 lg:gap-6 lg:px-6 lg:py-5">
      <aside class="w-16 shrink-0">
        <div class="sticky top-3 flex h-[calc(100vh-1.5rem)] flex-col items-center rounded-[1.25rem] bg-[#0c1621] px-2 py-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-cyan-100">
            <LogoMark class="h-5 w-5" />
          </div>

          <nav class="mt-6 flex flex-1 flex-col items-center gap-2" aria-label="Primary">
            <AppNavLink
              v-for="item in navigationItems"
              :key="item.to"
              compact
              :icon="item.icon"
              :label="item.label"
              :to="item.to"
            />
          </nav>
        </div>
      </aside>

      <div class="flex min-h-[calc(100vh-1.5rem)] min-w-0 flex-1 flex-col">
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
import { navigationItems } from '@/shared/config/navigation';
import LogoMark from '@/components/ui/LogoMark.vue';
import AppNavLink from '@/shared/ui/AppNavLink.vue';
import BrandMark from '@/shared/ui/BrandMark.vue';
</script>