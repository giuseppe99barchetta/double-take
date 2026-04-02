import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { clearLogs, fetchLogs } from '@/features/logs/logs.service';
import type { BackendLogsResponse, LogEntry, LogLevel, LogLevelFilter } from '@/features/logs/types';

const POLL_INTERVAL_MS = 2000;
const LOG_LINE_PATTERN = /^(?:(\d{2}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+)?([a-z]+):\s?(.*)$/i;

const normalizeLevel = (value: string): LogLevel => {
  const normalized = value.toLowerCase();
  if (normalized === 'info') return 'info';
  if (normalized === 'warn') return 'warn';
  if (normalized === 'error') return 'error';
  if (normalized === 'debug' || normalized === 'verbose' || normalized === 'http' || normalized === 'silly') {
    return 'debug';
  }

  return 'other';
};

const parseLogEntries = (payload: BackendLogsResponse): LogEntry[] => {
  const lines = payload.logs
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  return lines.map((line, index) => {
    const match = line.match(LOG_LINE_PATTERN);

    if (!match) {
      return {
        id: `${index}-${line}`,
        line,
        level: 'other',
        message: line,
        timestamp: null,
      };
    }

    const [, timestamp, level, message] = match;

    return {
      id: `${index}-${line}`,
      line,
      level: normalizeLevel(level),
      message,
      timestamp: timestamp ?? null,
    };
  });
};

export const useLogs = () => {
  const entries = ref<LogEntry[]>([]);
  const logSize = ref('0 Bytes');
  const loading = ref(false);
  const refreshing = ref(false);
  const clearing = ref(false);
  const error = ref<string | null>(null);
  const levelFilter = ref<LogLevelFilter>('all');
  const autoScroll = ref(true);
  const refreshVersion = ref(0);

  let pollTimer: number | null = null;
  let previousRawLog = '';

  const filteredEntries = computed(() => {
    if (levelFilter.value === 'all') return entries.value;
    return entries.value.filter((entry) => entry.level === levelFilter.value);
  });

  const hasLogs = computed(() => entries.value.length > 0);

  const loadLogs = async (manual = false) => {
    if (!manual && entries.value.length === 0) {
      loading.value = true;
    }

    if (manual) {
      refreshing.value = true;
    }

    try {
      const payload = await fetchLogs();
      logSize.value = payload.size;
      entries.value = parseLogEntries(payload);

      if (payload.logs !== previousRawLog) {
        previousRawLog = payload.logs;
        refreshVersion.value += 1;
      }

      error.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load logs.';
    } finally {
      loading.value = false;
      refreshing.value = false;
    }
  };

  const clear = async () => {
    clearing.value = true;
    try {
      await clearLogs();
      await loadLogs(true);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to clear logs.';
    } finally {
      clearing.value = false;
    }
  };

  const startLiveUpdates = () => {
    if (pollTimer !== null) {
      return;
    }

    pollTimer = window.setInterval(() => {
      void loadLogs();
    }, POLL_INTERVAL_MS);
  };

  const stopLiveUpdates = () => {
    if (pollTimer === null) {
      return;
    }

    window.clearInterval(pollTimer);
    pollTimer = null;
  };

  onMounted(() => {
    void loadLogs();
    startLiveUpdates();
  });

  onBeforeUnmount(() => {
    stopLiveUpdates();
  });

  return {
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
  };
};
