<template>
  <div class="space-y-5 lg:space-y-7">
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
      tag="div"
      class="pointer-events-none fixed top-5 right-5 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto overflow-hidden rounded-2xl border px-4 py-3 shadow-[0_24px_60px_-32px_rgba(8,16,28,0.88)] backdrop-blur-xl',
          toast.variant === 'error'
            ? 'border-rose-300/20 bg-rose-400/12 text-rose-50'
            : 'border-emerald-300/20 bg-emerald-400/12 text-emerald-50',
        ]"
      >
        <p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/55">
          {{ toast.variant === 'error' ? 'Save failed' : 'Saved' }}
        </p>
        <p class="mt-1 text-sm leading-6">{{ toast.message }}</p>
      </div>
    </TransitionGroup>

    <!-- Header -->
    <SurfaceCard>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-cyan-100/70">Settings</p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white lg:text-4xl">System configuration</h1>
          <p v-if="config" class="mt-2 text-sm text-white/50">
            Double Take v{{ config.version }} &middot; Auth: {{ config.auth ? 'enabled' : 'disabled' }}
          </p>
        </div>
        <div v-if="config" class="grid grid-cols-3 gap-3 lg:min-w-[360px]">
          <div class="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
            <p class="text-[0.65rem] uppercase tracking-[0.22em] text-white/40">Detectors</p>
            <p class="mt-2 text-xl font-semibold text-white">{{ Object.keys(config.detectors ?? {}).length }}</p>
          </div>
          <div class="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
            <p class="text-[0.65rem] uppercase tracking-[0.22em] text-white/40">Cameras</p>
            <p class="mt-2 text-xl font-semibold text-white">{{ Object.keys(config.cameras ?? {}).length }}</p>
          </div>
          <div class="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
            <p class="text-[0.65rem] uppercase tracking-[0.22em] text-white/40">Log level</p>
            <p class="mt-2 text-xl font-semibold text-white capitalize">{{ config.logs?.level ?? '—' }}</p>
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
    <div v-if="initialLoading" class="space-y-4">
      <SurfaceCard class="animate-pulse">
        <div class="h-4 w-1/4 rounded bg-white/5" />
        <div class="mt-4 space-y-3">
          <div class="h-3 w-full rounded bg-white/5" />
          <div class="h-3 w-5/6 rounded bg-white/5" />
          <div class="h-3 w-2/3 rounded bg-white/5" />
        </div>
      </SurfaceCard>
    </div>

    <template v-else-if="config">
      <!-- Detection thresholds -->
      <SurfaceCard>
        <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">Detection thresholds</p>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <p class="text-xs font-semibold uppercase tracking-widest text-emerald-300/70">Match</p>
            <dl class="mt-3 space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-white/50">Confidence</dt>
                <dd class="font-medium text-white">{{ config.detect?.match?.confidence ?? '—' }}%</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-white/50">Min area</dt>
                <dd class="font-medium text-white">{{ config.detect?.match?.min_area ?? '—' }} px²</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-white/50">Save images</dt>
                <dd class="font-medium text-white">{{ config.detect?.match?.save ? 'yes' : 'no' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-white/50">Purge after</dt>
                <dd class="font-medium text-white">{{ config.detect?.match?.purge ?? '—' }}h</dd>
              </div>
            </dl>
          </div>
          <div class="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <p class="text-xs font-semibold uppercase tracking-widest text-amber-300/70">Unknown</p>
            <dl class="mt-3 space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-white/50">Confidence</dt>
                <dd class="font-medium text-white">{{ config.detect?.unknown?.confidence ?? '—' }}%</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-white/50">Min area</dt>
                <dd class="font-medium text-white">{{ config.detect?.unknown?.min_area ?? '—' }} px²</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-white/50">Save images</dt>
                <dd class="font-medium text-white">{{ config.detect?.unknown?.save ? 'yes' : 'no' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-white/50">Purge after</dt>
                <dd class="font-medium text-white">{{ config.detect?.unknown?.purge ?? '—' }}h</dd>
              </div>
            </dl>
          </div>
        </div>
      </SurfaceCard>

      <!-- Detectors -->
      <SurfaceCard v-if="Object.keys(config.detectors ?? {}).length > 0">
        <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">Detectors</p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="(det, name) in config.detectors"
            :key="name"
            class="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
          >
            <p class="text-sm font-semibold capitalize text-white">{{ name }}</p>
            <dl class="mt-3 space-y-1.5 text-xs">
              <div v-if="det.url" class="flex justify-between gap-2">
                <dt class="shrink-0 text-white/45">URL</dt>
                <dd class="truncate text-right font-medium text-white/80">{{ det.url }}</dd>
              </div>
              <div v-if="det.timeout !== undefined" class="flex justify-between">
                <dt class="text-white/45">Timeout</dt>
                <dd class="font-medium text-white/80">{{ det.timeout }}s</dd>
              </div>
              <div v-if="det.det_prob_threshold !== undefined" class="flex justify-between">
                <dt class="text-white/45">Det threshold</dt>
                <dd class="font-medium text-white/80">{{ det.det_prob_threshold }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </SurfaceCard>

      <!-- MQTT -->
      <SurfaceCard v-if="config.mqtt?.host">
        <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">MQTT</p>
        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
            <dt class="text-[0.65rem] uppercase tracking-widest text-white/40">Host</dt>
            <dd class="mt-1 font-medium text-white">{{ config.mqtt.host }}</dd>
          </div>
          <div class="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
            <dt class="text-[0.65rem] uppercase tracking-widest text-white/40">Port</dt>
            <dd class="mt-1 font-medium text-white">{{ config.mqtt.port && config.mqtt.port > 0 ? config.mqtt.port : 1883 }}</dd>
          </div>
          <div class="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
            <dt class="text-[0.65rem] uppercase tracking-widest text-white/40">Events topic</dt>
            <dd class="mt-1 truncate font-medium text-white">{{ config.mqtt.topics?.frigate ?? '—' }}</dd>
          </div>
          <div class="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
            <dt class="text-[0.65rem] uppercase tracking-widest text-white/40">Matches topic</dt>
            <dd class="mt-1 truncate font-medium text-white">{{ config.mqtt.topics?.matches ?? '—' }}</dd>
          </div>
        </dl>
      </SurfaceCard>

      <!-- YAML editor -->
      <SurfaceCard class="overflow-hidden border-white/12 bg-white/[0.04]">
        <div class="sticky top-0 z-10 -mx-5 -mt-5 border-b border-white/10 bg-[linear-gradient(180deg,rgba(8,16,28,0.98),rgba(8,16,28,0.9))] px-5 py-5 backdrop-blur-xl lg:-mx-6 lg:-mt-6 lg:px-6 lg:py-6">
          <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div class="max-w-2xl">
              <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-cyan-100/60">Configuration</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-white">YAML Editor</h2>
              <p class="mt-2 text-sm leading-6 text-white/52">Edit advanced configuration directly in YAML. Changes apply immediately after a successful save.</p>
            </div>

            <div class="flex w-full flex-col gap-3 xl:max-w-sm xl:items-end">
              <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
                <div class="min-h-6 sm:mr-auto xl:mr-0 xl:min-w-[8.5rem] xl:text-right">
                  <span
                    v-if="hasChanges"
                    class="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-amber-100/90"
                  >
                    <span class="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_0_4px_rgba(253,224,71,0.12)]" />
                    Unsaved changes
                  </span>
                  <span v-else class="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-white/40">
                    <span class="h-2 w-2 rounded-full bg-emerald-300/60" />
                    Up to date
                  </span>
                </div>
                <button
                  type="button"
                  :disabled="saving || refreshing || !hasChanges"
                  class="inline-flex min-w-[8.5rem] items-center justify-center gap-2 rounded-2xl border border-white/12 bg-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:border-white/20 hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-45"
                  @click="resetChanges"
                >
                  <span
                    v-if="refreshing"
                    class="h-3.5 w-3.5 animate-spin rounded-full border border-white/25 border-t-white"
                  />
                  {{ refreshing ? 'Resetting…' : 'Reset' }}
                </button>
                <button
                  type="button"
                  :disabled="saving || !hasChanges"
                  class="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-2xl border border-cyan-200/70 bg-cyan-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_18px_40px_-22px_rgba(165,243,252,0.85)] transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:border-cyan-200/25 disabled:bg-cyan-200/25 disabled:text-slate-950/55 disabled:shadow-none"
                  @click="saveChanges"
                >
                  <span
                    v-if="saving"
                    class="h-3.5 w-3.5 animate-spin rounded-full border border-slate-950/20 border-t-slate-950"
                  />
                  {{ saving ? 'Saving…' : 'Save Changes' }}
                </button>
              </div>

              <div class="text-xs leading-6 text-white/38 xl:text-right">
                Modified lines are highlighted until the next successful save or reset.
              </div>
            </div>
          </div>

          <div v-if="validationError || saveError" class="mt-4 rounded-[1.25rem] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100/90">
            {{ validationError || saveError }}
          </div>
        </div>

        <div class="mt-6 lg:mt-7">
          <YamlCodeEditor v-model="yamlCode" :changed-lines="changedLineNumbers" />
        </div>
      </SurfaceCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from 'vue';
import { useConfig } from '@/features/config/composables/useConfig';
import SurfaceCard from '@/shared/ui/SurfaceCard.vue';

const YamlCodeEditor = defineAsyncComponent(() => import('@/features/config/components/YamlCodeEditor.vue'));

type ToastItem = {
  id: number;
  message: string;
  variant: 'success' | 'error';
};

const {
  changedLineNumbers,
  config,
  error,
  hasChanges,
  initialLoading,
  loading,
  resetToCurrentConfig,
  save,
  saveError,
  saving,
  saveSuccess,
  validationError,
  yamlCode,
} = useConfig();

const toasts = ref<ToastItem[]>([]);
const toastTimers = new Map<number, number>();
let nextToastId = 1;

const refreshing = computed(() => loading.value && Boolean(config.value) && !saving.value);

const pushToast = (message: string, variant: ToastItem['variant']) => {
  const id = nextToastId;
  nextToastId += 1;
  toasts.value = [...toasts.value, { id, message, variant }];

  const timer = window.setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
    toastTimers.delete(id);
  }, 3600);

  toastTimers.set(id, timer);
};

watch(saveSuccess, (value, previousValue) => {
  if (value && !previousValue) {
    pushToast('Configuration saved', 'success');
  }
});

watch(saveError, (value, previousValue) => {
  if (value && value !== previousValue) {
    pushToast(value, 'error');
  }
});

watch(validationError, (value, previousValue) => {
  if (value && value !== previousValue) {
    pushToast(value, 'error');
  }
});

const saveChanges = async () => {
  await save();
};

const resetChanges = async () => {
  await resetToCurrentConfig();
};

onBeforeUnmount(() => {
  toastTimers.forEach((timer) => {
    window.clearTimeout(timer);
  });
  toastTimers.clear();
});
</script>