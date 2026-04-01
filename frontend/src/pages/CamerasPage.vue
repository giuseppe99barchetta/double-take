<template>
  <div class="space-y-4 lg:space-y-6">
    <!-- Header -->
    <SurfaceCard>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-cyan-100/70">Cameras</p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white lg:text-4xl">Stream topology</h1>
          <p class="mt-2 text-sm text-white/50">Configured camera sources and recognition triggers.</p>
        </div>
        <div class="grid grid-cols-2 gap-3 lg:min-w-[280px]">
          <div class="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
            <p class="text-[0.65rem] uppercase tracking-[0.22em] text-white/40">Cameras</p>
            <p class="mt-2 text-xl font-semibold text-white">{{ cameras.length }}</p>
          </div>
          <div class="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
            <p class="text-[0.65rem] uppercase tracking-[0.22em] text-white/40">MQTT</p>
            <p
              class="mt-2 text-sm font-semibold"
              :class="mqttStatus?.connected ? 'text-emerald-300' : 'text-amber-300'"
            >
              {{ mqttStatus?.connected ? 'Connected' : (mqttStatus ? 'Offline' : '—') }}
            </p>
          </div>
        </div>
      </div>
    </SurfaceCard>

    <!-- Error -->
    <SurfaceCard v-if="error">
      <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-rose-300/70">Error</p>
      <p class="mt-2 text-sm text-rose-200/80">{{ error }}</p>
    </SurfaceCard>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <SurfaceCard
        v-for="n in 3"
        :key="n"
        class="animate-pulse"
      >
        <div class="h-4 w-1/2 rounded bg-white/5" />
        <div class="mt-4 space-y-2">
          <div class="h-3 w-full rounded bg-white/5" />
          <div class="h-3 w-3/4 rounded bg-white/5" />
        </div>
      </SurfaceCard>
    </div>

    <!-- Empty state -->
    <SurfaceCard v-else-if="!loading && cameras.length === 0">
      <div class="flex flex-col gap-3 py-4">
        <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">No cameras configured</p>
        <p class="max-w-xl text-sm leading-7 text-white/60">
          Add camera entries under the <code class="rounded bg-white/10 px-1.5 py-0.5 text-xs">cameras:</code> key in
          your config.yml to see them here. Each camera needs a <code class="rounded bg-white/10 px-1.5 py-0.5 text-xs">snapshot.url</code> to enable recognition triggers.
        </p>
      </div>
    </SurfaceCard>

    <!-- Camera grid -->
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <SurfaceCard
        v-for="cam in cameras"
        :key="cam.name"
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

        <dl class="mt-4 space-y-2 text-xs">
          <div v-if="cam.snapshotUrl" class="flex items-baseline justify-between gap-2">
            <dt class="shrink-0 text-white/40">URL</dt>
            <dd class="truncate text-right text-white/70">{{ cam.snapshotUrl }}</dd>
          </div>
          <div v-if="cam.snapshotTopic" class="flex items-baseline justify-between gap-2">
            <dt class="shrink-0 text-white/40">MQTT topic</dt>
            <dd class="truncate text-right text-white/70">{{ cam.snapshotTopic }}</dd>
          </div>
        </dl>

        <div class="mt-4 border-t border-white/8 pt-4">
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
      </SurfaceCard>
    </div>

    <!-- MQTT detail -->
    <SurfaceCard v-if="mqttStatus">
      <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">MQTT status</p>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
          <p class="text-[0.65rem] uppercase tracking-widest text-white/40">Connection</p>
          <p
            class="mt-1 text-sm font-semibold"
            :class="mqttStatus.connected ? 'text-emerald-300' : 'text-amber-300'"
          >
            {{ mqttStatus.connected ? 'Connected' : 'Disconnected' }}
          </p>
        </div>
        <div class="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
          <p class="text-[0.65rem] uppercase tracking-widest text-white/40">Status message</p>
          <p class="mt-1 text-sm text-white/70">{{ mqttStatus.status || 'No status available' }}</p>
        </div>
      </div>
    </SurfaceCard>
  </div>
</template>

<script setup lang="ts">
import { useCameras } from '@/features/cameras/composables/useCameras';
import SurfaceCard from '@/shared/ui/SurfaceCard.vue';

const { cameras, error, loading, mqttStatus, trigger } = useCameras();
</script>