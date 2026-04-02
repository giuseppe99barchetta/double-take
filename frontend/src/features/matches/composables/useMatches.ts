import { computed, onMounted, ref, watch } from 'vue';

import { confirmMatch, fetchMatches, ignoreMatch, renameMatch } from '@/features/matches/services/matches.service';
import type {
  MatchActiveFilter,
  MatchActiveFilterId,
  MatchCardLayout,
  MatchEvent,
  MatchQuickFilter,
  MatchQuickFilterId,
  MatchSortOrder,
  MatchStatusFilter,
} from '@/features/matches/types';

const viewOptions = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
] as const satisfies ReadonlyArray<{ label: string; value: MatchCardLayout }>;

const statusFilterOptions = [
  { label: 'All events', value: 'all' },
  { label: 'Recognized', value: 'recognized' },
  { label: 'Unknown', value: 'unknown' },
] as const satisfies ReadonlyArray<{ label: string; value: MatchStatusFilter }>;

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Highest confidence', value: 'highest-confidence' },
] as const satisfies ReadonlyArray<{ label: string; value: MatchSortOrder }>;

const clampConfidence = (value: number) => Math.min(100, Math.max(0, value));

const getSearchName = (match: MatchEvent) => (match.subjectName ?? 'Unknown').toLowerCase();
const DEFAULT_MIN_CONFIDENCE = 0;
const DEFAULT_MAX_CONFIDENCE = 100;
const HIGH_CONFIDENCE_MIN = 81;
const ZOOM_STORAGE_KEY = 'matches-zoom';
const MIN_ZOOM = 0.7;
const MAX_ZOOM = 2.5;
const DEFAULT_ZOOM = 1;
const SNAP_POINTS = [MIN_ZOOM, DEFAULT_ZOOM, 1.5, 2, MAX_ZOOM] as const;
const SNAP_THRESHOLD = 0.04;

const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

const snapZoom = (value: number) => {
  const closestPoint = SNAP_POINTS.reduce((closest, point) => {
    return Math.abs(point - value) < Math.abs(closest - value) ? point : closest;
  }, SNAP_POINTS[0]);

  return Math.abs(closestPoint - value) <= SNAP_THRESHOLD ? closestPoint : value;
};

const normalizeZoom = (value: number) => snapZoom(clampZoom(value));

const getInitialZoom = (): number => {
  if (typeof window === 'undefined') {
    return DEFAULT_ZOOM;
  }

  const storedZoom = Number(window.localStorage.getItem(ZOOM_STORAGE_KEY));
  if (Number.isNaN(storedZoom)) {
    return DEFAULT_ZOOM;
  }

  return normalizeZoom(storedZoom);
};

const sortOrderLabels: Record<MatchSortOrder, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  'highest-confidence': 'Highest confidence',
};

const statusFilterLabels: Record<Exclude<MatchStatusFilter, 'all'>, string> = {
  recognized: 'Recognized only',
  unknown: 'Unknown only',
};

const buildConfidenceLabel = (min: number, max: number) => {
  if (min === DEFAULT_MIN_CONFIDENCE && max === DEFAULT_MAX_CONFIDENCE) {
    return '';
  }

  if (min > DEFAULT_MIN_CONFIDENCE && max < DEFAULT_MAX_CONFIDENCE) {
    return `${min}%-${max}%`;
  }

  if (min > DEFAULT_MIN_CONFIDENCE) {
    return `>= ${min}%`;
  }

  return `<= ${max}%`;
};

export const useMatches = () => {
  const sourceMatches = ref<MatchEvent[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const viewMode = ref<MatchCardLayout>('grid');
  const searchQuery = ref('');
  const statusFilter = ref<MatchStatusFilter>('all');
  const sortOrder = ref<MatchSortOrder>('newest');
  const minConfidence = ref(DEFAULT_MIN_CONFIDENCE);
  const maxConfidence = ref(DEFAULT_MAX_CONFIDENCE);
  const overlayVisible = ref(true);
  const zoom = ref(getInitialZoom());
  const activeViewerMatchId = ref<string | null>(null);

  watch(minConfidence, (value) => {
    minConfidence.value = clampConfidence(value);
    if (minConfidence.value > maxConfidence.value) {
      maxConfidence.value = minConfidence.value;
    }
  });

  watch(maxConfidence, (value) => {
    maxConfidence.value = clampConfidence(value);
    if (maxConfidence.value < minConfidence.value) {
      minConfidence.value = maxConfidence.value;
    }
  });

  watch(zoom, (value) => {
    const normalizedZoom = normalizeZoom(value);
    if (zoom.value !== normalizedZoom) {
      zoom.value = normalizedZoom;
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(ZOOM_STORAGE_KEY, String(zoom.value));
  });

  const allMatches = computed(() => sourceMatches.value);
  const filteredMatches = computed(() => {
    const normalizedQuery = searchQuery.value.trim().toLowerCase();

    return [...allMatches.value]
      .filter((match) => {
        if (!normalizedQuery) return true;
        return getSearchName(match).includes(normalizedQuery);
      })
      .filter((match) => {
        if (statusFilter.value === 'recognized') return match.subjectName !== null;
        if (statusFilter.value === 'unknown') return match.subjectName === null;
        return true;
      })
      .filter((match) => match.confidence >= minConfidence.value && match.confidence <= maxConfidence.value)
      .sort((left, right) => {
        if (sortOrder.value === 'oldest') {
          return new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime();
        }

        if (sortOrder.value === 'highest-confidence') {
          return right.confidence - left.confidence;
        }

        return new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime();
      });
  });

  const matches = computed(() => filteredMatches.value);
  const activeViewerMatch = computed(() => {
    if (!activeViewerMatchId.value) {
      return null;
    }

    return sourceMatches.value.find((match) => match.id === activeViewerMatchId.value) ?? null;
  });
  const isViewerOpen = computed(() => activeViewerMatch.value !== null);
  const matchCount = computed(() => matches.value.length);
  const unknownCount = computed(() => matches.value.filter((match) => match.subjectName === null).length);
  const averageConfidence = computed(() => {
    if (!matches.value.length) return 0;

    const total = matches.value.reduce((sum, match) => sum + match.confidence, 0);
    return Math.round(total / matches.value.length);
  });
  const hasActiveFilters = computed(
    () =>
      searchQuery.value.trim().length > 0 ||
      statusFilter.value !== 'all' ||
      sortOrder.value !== 'newest' ||
        minConfidence.value !== DEFAULT_MIN_CONFIDENCE ||
        maxConfidence.value !== DEFAULT_MAX_CONFIDENCE,
  );
  const resultsSummary = computed(() => {
    if (matchCount.value === allMatches.value.length) {
      return `${matchCount.value} events visible`;
    }

    return `${matchCount.value} of ${allMatches.value.length} events visible`;
  });

  const setViewMode = (mode: MatchCardLayout) => {
    viewMode.value = mode;
  };

  const setSearchQuery = (value: string) => {
    searchQuery.value = value;
  };

  const setStatusFilter = (value: MatchStatusFilter) => {
    statusFilter.value = value;
  };

  const setSortOrder = (value: MatchSortOrder) => {
    sortOrder.value = value;
  };

  const setMinConfidence = (value: number) => {
    minConfidence.value = value;
  };

  const setMaxConfidence = (value: number) => {
    maxConfidence.value = value;
  };

  const setOverlayVisible = (value: boolean) => {
    overlayVisible.value = value;
  };

  const setZoom = (value: number) => {
    zoom.value = normalizeZoom(value);
  };

  const openViewer = (id: string) => {
    activeViewerMatchId.value = id;
  };

  const closeViewer = () => {
    activeViewerMatchId.value = null;
  };

  const activeFilters = computed<MatchActiveFilter[]>(() => {
    const filters: MatchActiveFilter[] = [];

    if (searchQuery.value.trim()) {
      filters.push({
        id: 'search',
        label: 'Search',
        value: searchQuery.value.trim(),
      });
    }

    if (statusFilter.value !== 'all') {
      filters.push({
        id: 'status',
        label: 'Identity',
        value: statusFilterLabels[statusFilter.value],
      });
    }

    const confidenceLabel = buildConfidenceLabel(minConfidence.value, maxConfidence.value);
    if (confidenceLabel) {
      filters.push({
        id: 'confidence',
        label: 'Confidence',
        value: confidenceLabel,
      });
    }

    if (sortOrder.value !== 'newest') {
      filters.push({
        id: 'sort',
        label: 'Sort',
        value: sortOrderLabels[sortOrder.value],
      });
    }

    return filters;
  });

  const quickFilters = computed<MatchQuickFilter[]>(() => [
    {
      count: allMatches.value.filter((match) => match.subjectName === null).length,
      id: 'unknown-only',
      label: 'Unknown only',
      active: statusFilter.value === 'unknown',
    },
    {
      count: allMatches.value.filter((match) => match.subjectName !== null).length,
      id: 'recognized-only',
      label: 'Recognized only',
      active: statusFilter.value === 'recognized',
    },
    {
      count: allMatches.value.filter((match) => match.confidence >= HIGH_CONFIDENCE_MIN).length,
      id: 'high-confidence',
      label: 'High confidence',
      active: minConfidence.value === HIGH_CONFIDENCE_MIN && maxConfidence.value === DEFAULT_MAX_CONFIDENCE,
    },
    {
      id: 'recent',
      label: 'Recent',
      active: sortOrder.value === 'newest',
    },
  ]);

  const clearFilter = (filterId: MatchActiveFilterId) => {
    if (filterId === 'search') {
      searchQuery.value = '';
      return;
    }

    if (filterId === 'status') {
      statusFilter.value = 'all';
      return;
    }

    if (filterId === 'confidence') {
      minConfidence.value = DEFAULT_MIN_CONFIDENCE;
      maxConfidence.value = DEFAULT_MAX_CONFIDENCE;
      return;
    }

    sortOrder.value = 'newest';
  };

  const applyQuickFilter = (filterId: MatchQuickFilterId) => {
    if (filterId === 'unknown-only') {
      statusFilter.value = statusFilter.value === 'unknown' ? 'all' : 'unknown';
      return;
    }

    if (filterId === 'recognized-only') {
      statusFilter.value = statusFilter.value === 'recognized' ? 'all' : 'recognized';
      return;
    }

    if (filterId === 'high-confidence') {
      const isActive = minConfidence.value === HIGH_CONFIDENCE_MIN && maxConfidence.value === DEFAULT_MAX_CONFIDENCE;
      minConfidence.value = isActive ? DEFAULT_MIN_CONFIDENCE : HIGH_CONFIDENCE_MIN;
      maxConfidence.value = DEFAULT_MAX_CONFIDENCE;
      return;
    }

    sortOrder.value = 'newest';
  };

  const resetFilters = () => {
    searchQuery.value = '';
    statusFilter.value = 'all';
    sortOrder.value = 'newest';
    minConfidence.value = DEFAULT_MIN_CONFIDENCE;
    maxConfidence.value = DEFAULT_MAX_CONFIDENCE;
  };

  const fetchData = async () => {
    loading.value = true;
    error.value = null;

    try {
      const matchesFromApi = await fetchMatches();
      sourceMatches.value = matchesFromApi;
    } catch (err) {
      sourceMatches.value = [];
      activeViewerMatchId.value = null;
      error.value = err instanceof Error ? err.message : 'Unable to load matches.';
    } finally {
      loading.value = false;
    }
  };

  const confirm = async (id: string) => {
    const match = sourceMatches.value.find((item) => item.id === id);
    const name = match?.subjectName?.trim();

    if (!name) {
      error.value = 'Cannot confirm a match without a recognized name.';
      return;
    }

    try {
      await confirmMatch(id, name);
      await fetchData();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to confirm match.';
    }
  };

  const ignore = async (id: string) => {
    try {
      await ignoreMatch(id);
      await fetchData();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to ignore match.';
    }
  };

  const rename = async (id: string, name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      error.value = 'A name is required to rename a match.';
      return;
    }

    try {
      await renameMatch(id, normalizedName);
      await fetchData();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to rename match.';
    }
  };

  onMounted(() => {
    void fetchData();
  });

  return {
    activeFilters,
    activeViewerMatch,
    allMatches,
    applyQuickFilter,
    averageConfidence,
    clearFilter,
    closeViewer,
    error,
    fetchData,
    filteredMatches,
    hasActiveFilters,
    isViewerOpen,
    loading,
    zoom,
    matchCount,
    maxConfidence,
    minConfidence,
    matches,
    openViewer,
    overlayVisible,
    confirm,
    ignore,
    rename,
    quickFilters,
    resetFilters,
    resultsSummary,
    searchQuery,
    setMaxConfidence,
    setMinConfidence,
    setZoom,
    setOverlayVisible,
    setSearchQuery,
    setSortOrder,
    setStatusFilter,
    setViewMode,
    sortOptions,
    sortOrder,
    statusFilter,
    statusFilterOptions,
    unknownCount,
    viewMode,
    viewOptions,
  };
};