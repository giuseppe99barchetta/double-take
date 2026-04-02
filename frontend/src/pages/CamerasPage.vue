<template>
  <PageContainer>
    <header class="flex flex-col gap-4 border-b border-white/8 pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="w-full">
        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-white lg:text-3xl">Stream topology</h1>
        <p class="mt-2 text-sm leading-6 text-white/55">Configured camera sources and recognition triggers.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <div class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:border-white/15 hover:bg-white/8">
          <span class="text-white/40">Cameras</span>
          <span class="ml-2 font-semibold text-white">{{ cameras.length }}</span>
        </div>
        <div class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:border-white/15 hover:bg-white/8">
          <span class="text-white/40">MQTT</span>
          <span class="ml-2 font-semibold" :class="mqttStatus?.connected ? 'text-emerald-300' : 'text-amber-300'">
            {{ mqttStatus?.connected ? 'Connected' : (mqttStatus ? 'Offline' : '—') }}
          </span>
        </div>
      </div>
    </header>

    <!-- Error -->
    <BaseCard v-if="error">
      <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-rose-300/70">Error</p>
      <p class="mt-2 text-sm text-rose-200/80">{{ error }}</p>
    </BaseCard>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <BaseCard
        v-for="n in 3"
        :key="n"
        class="animate-pulse"
      >
        <div class="h-4 w-1/2 rounded bg-white/5" />
        <div class="mt-4 space-y-2">
          <div class="h-3 w-full rounded bg-white/5" />
          <div class="h-3 w-3/4 rounded bg-white/5" />
        </div>
      </BaseCard>
    </div>

    <!-- Empty state -->
    <BaseCard v-else-if="!loading && cameras.length === 0">
      <div class="flex flex-col gap-3 py-4">
        <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">No cameras configured</p>
        <p class="max-w-xl text-sm leading-7 text-white/60">
          Add camera entries under the <code class="rounded bg-white/10 px-1.5 py-0.5 text-xs">cameras:</code> key in
          your config.yml to see them here. Each camera needs a <code class="rounded bg-white/10 px-1.5 py-0.5 text-xs">snapshot.url</code> to enable recognition triggers.
        </p>
      </div>
    </BaseCard>

    <!-- Camera grid -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <BaseCard
        v-for="cam in cameras"
        :key="cam.name"
        content-class="space-y-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[0.65rem] uppercase tracking-widest text-white/40">Camera</p>
            <h2 class="mt-1 truncate text-base font-semibold capitalize text-white">{{ cam.name.replace(/_/g, ' ') }}</h2>
          </div>
          <span
            class="mt-1 shrink-0 rounded-full border px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-widest"
            :class="cam.snapshotUrl
              ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200'
              : 'border-amber-300/20 bg-amber-300/10 text-amber-200'"
          >
            {{ cam.snapshotUrl ? 'Snapshot' : 'No snapshot' }}
          </span>
        </div>

        <dl class="space-y-2 text-xs">
          <div v-if="cam.snapshotUrl" class="flex items-baseline justify-between gap-2">
            <dt class="shrink-0 text-white/40">URL</dt>
            <dd class="truncate text-right text-white/70">{{ cam.snapshotUrl }}</dd>
          </div>
          <div v-if="cam.snapshotTopic" class="flex items-baseline justify-between gap-2">
            <dt class="shrink-0 text-white/40">MQTT topic</dt>
            <dd class="truncate text-right text-white/70">{{ cam.snapshotTopic }}</dd>
          </div>
        </dl>

        <div class="border-t border-white/8 pt-3">
          <div v-if="cam.triggerState === 'error'" class="mb-3 rounded-[1rem] border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs text-rose-200">
            {{ cam.triggerError }}
          </div>
          <button
            type="button"
            :disabled="cam.triggerState === 'running' || !cam.snapshotUrl"
            class="w-full rounded-[1.25rem] border px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition"
            :class="cam.triggerState === 'done'
              ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200'
              : cam.triggerState === 'error'
                ? 'border-rose-300/20 bg-rose-300/10 text-rose-200'
                : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40'"
            @click="trigger(cam.name)"
          >
            <span v-if="cam.triggerState === 'running'">Running…</span>
            <span v-else-if="cam.triggerState === 'done'">Triggered ✓</span>
            <span v-else-if="cam.triggerState === 'error'">Retry</span>
            <span v-else>Trigger recognition</span>
          </button>
        </div>
      </BaseCard>
    </div>

    <!-- MQTT detail -->
    <BaseCard v-if="mqttStatus" content-class="space-y-3">
      <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">MQTT status</p>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BaseCard content-class="space-y-3">
          <p class="text-[0.65rem] uppercase tracking-widest text-white/40">Connection</p>
          <p
            class="text-sm font-semibold"
            :class="mqttStatus.connected ? 'text-emerald-300' : 'text-amber-300'"
          >
            {{ mqttStatus.connected ? 'Connected' : 'Disconnected' }}
          </p>
        </BaseCard>
        <BaseCard content-class="space-y-3">
          <p class="text-[0.65rem] uppercase tracking-widest text-white/40">Status message</p>
          <p class="text-sm text-white/70">{{ mqttStatus.status || 'No status available' }}</p>
        </BaseCard>
      </div>
    </BaseCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { useCameras } from '@/features/cameras/composables/useCameras';
import BaseCard from '@/shared/ui/BaseCard.vue';
import PageContainer from '@/shared/ui/PageContainer.vue';

const { cameras, error, loading, mqttStatus, trigger } = useCameras();
</script>