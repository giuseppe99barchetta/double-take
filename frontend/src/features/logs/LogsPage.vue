<template>
  <PageContainer>
    <header class="flex flex-col gap-4 border-b border-white/8 pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="w-full">
        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-white lg:text-3xl">System logs</h1>
        <p class="mt-2 text-sm leading-6 text-white/55">Real-time backend stream with level filtering and quick troubleshooting controls.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <div class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:border-white/15 hover:bg-white/8">
          <span class="text-white/40">Lines</span>
          <span class="ml-2 font-semibold text-white">{{ entries.length }}</span>
        </div>
        <div class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:border-white/15 hover:bg-white/8">
          <span class="text-white/40">Size</span>
          <span class="ml-2 font-semibold text-white">{{ logSize }}</span>
        </div>
      </div>
    </header>

    <BaseCard v-if="error">
      <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-rose-300/70">Error</p>
      <p class="mt-2 text-sm text-rose-200/80">{{ error }}</p>
    </BaseCard>

    <BaseCard class="overflow-hidden border-white/12 bg-[#060d18]/80">
      <div class="sticky top-0 z-10 -mx-5 -mt-5 border-b border-white/10 bg-[#0b1524]/95 px-5 py-4 backdrop-blur lg:-mx-6 lg:-mt-6 lg:px-6 lg:py-5">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[0.65rem] uppercase tracking-widest text-white/45">Level</span>
            <div ref="levelDropdownRef" class="relative z-50">
              <button
                type="button"
                class="inline-flex min-w-32 items-center justify-between gap-2 rounded-xl border border-white/12 bg-slate-900/95 px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-200 shadow-[0_8px_18px_-14px_rgba(8,16,28,0.95)] transition hover:border-white/20 hover:bg-slate-800/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                :aria-expanded="isLevelMenuOpen"
                aria-haspopup="menu"
                @click="isLevelMenuOpen = !isLevelMenuOpen"
              >
                <span>{{ selectedLevelLabel }}</span>
                <ChevronDown
                  :size="14"
                  class="text-slate-300/85 transition"
                  :class="isLevelMenuOpen ? 'rotate-180' : 'rotate-0'"
                />
              </button>

              <div
                v-if="isLevelMenuOpen"
                role="menu"
                class="absolute top-[calc(100%+0.4rem)] left-0 z-50 min-w-32 overflow-hidden rounded-xl border border-white/12 bg-slate-900/98 py-1 shadow-[0_24px_48px_-24px_rgba(8,16,28,0.95)] backdrop-blur"
              >
                <button
                  v-for="option in levelOptions"
                  :key="option.value"
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium uppercase tracking-wider transition"
                  :class="levelFilter === option.value
                    ? 'bg-cyan-300/14 text-cyan-100'
                    : 'text-slate-200 hover:bg-slate-800/90 hover:text-slate-100'"
                  @click="selectLevel(option.value)"
                >
                  <span>{{ option.label }}</span>
                </button>
              </div>
            </div>

            <label class="ml-2 inline-flex items-center gap-2 text-xs text-white/65">
              <input v-model="autoScroll" type="checkbox" class="h-4 w-4 rounded border-white/20 bg-transparent" />
              Auto-scroll
            </label>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded-xl border border-white/12 bg-white/7 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-45"
              :disabled="loading || refreshing"
              @click="loadLogs(true)"
            >
              {{ refreshing ? 'Refreshing...' : 'Refresh' }}
            </button>
            <button
              type="button"
              class="rounded-xl border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-100 transition hover:bg-rose-300/20 disabled:cursor-not-allowed disabled:opacity-45"
              :disabled="loading || refreshing || clearing || !hasLogs"
              @click="clear"
            >
              {{ clearing ? 'Clearing...' : 'Clear logs' }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-5">
        <div
          v-if="loading"
          class="flex h-[50vh] items-center justify-center rounded-2xl border border-white/8 bg-black/30"
        >
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        </div>

        <div
          v-else-if="filteredEntries.length === 0"
          class="flex h-[50vh] items-center justify-center rounded-2xl border border-white/8 bg-black/30 px-4 text-center"
        >
          <div>
            <p class="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/45">No logs</p>
            <p class="mt-2 text-sm text-white/60">No entries match the selected level filter.</p>
          </div>
        </div>

        <div
          v-else
          ref="logContainer"
          class="h-[50vh] overflow-auto rounded-2xl border border-white/8 bg-[#040912] px-3 py-3"
        >
          <div class="font-mono text-xs leading-6 text-white/85">
            <p
              v-for="entry in filteredEntries"
              :key="entry.id"
              class="m-0 flex gap-3"
              :class="levelClasses[entry.level]"
            >
              <span class="shrink-0 text-white/45">{{ entry.timestamp ?? 'live' }}</span>
              <span class="break-all">{{ entry.message }}</span>
            </p>
          </div>
        </div>
      </div>
    </BaseCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useLogs } from '@/features/logs/useLogs';
import type { LogLevel, LogLevelFilter } from '@/features/logs/types';
import BaseCard from '@/shared/ui/BaseCard.vue';
import PageContainer from '@/shared/ui/PageContainer.vue';

const {
  autoScroll,
  clear,
  clearing,
  entries,
  error,
  filteredEntries,
  hasLogs,
  levelFilter,
  loadLogs,
  loading,
  logSize,
  refreshVersion,
  refreshing,
} = useLogs();

const logContainer = ref<HTMLElement | null>(null);
const levelDropdownRef = ref<HTMLElement | null>(null);
const isLevelMenuOpen = ref(false);

const levelOptions: ReadonlyArray<{ label: string; value: LogLevelFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Error', value: 'error' },
  { label: 'Warn', value: 'warn' },
  { label: 'Info', value: 'info' },
  { label: 'Debug', value: 'debug' },
];

const selectedLevelLabel = computed(
  () => levelOptions.find((option) => option.value === levelFilter.value)?.label ?? 'All',
);

const selectLevel = (value: LogLevelFilter) => {
  levelFilter.value = value;
  isLevelMenuOpen.value = false;
};

const onWindowPointerDown = (event: MouseEvent) => {
  if (!levelDropdownRef.value) return;

  const target = event.target;
  if (!(target instanceof Node)) return;

  if (!levelDropdownRef.value.contains(target)) {
    isLevelMenuOpen.value = false;
  }
};

const onWindowKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isLevelMenuOpen.value = false;
  }
};

const levelClasses: Record<LogLevel, string> = {
  debug: 'text-sky-200/90',
  error: 'text-rose-200',
  info: 'text-emerald-200/90',
  other: 'text-white/82',
  warn: 'text-amber-200/95',
};

const scrollToBottom = async () => {
  if (!autoScroll.value) return;
  await nextTick();
  if (!logContainer.value) return;
  logContainer.value.scrollTop = logContainer.value.scrollHeight;
};

watch(refreshVersion, () => {
  void scrollToBottom();
});

watch(levelFilter, () => {
  void scrollToBottom();
});

onMounted(() => {
  window.addEventListener('mousedown', onWindowPointerDown);
  window.addEventListener('keydown', onWindowKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousedown', onWindowPointerDown);
  window.removeEventListener('keydown', onWindowKeyDown);
});
</script>
