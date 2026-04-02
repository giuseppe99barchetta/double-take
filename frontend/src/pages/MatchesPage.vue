<template>
  <PageContainer>
    <header class="flex flex-col gap-4 border-b border-white/8 pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="w-full">
        <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-cyan-100/65">Matches</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-white lg:text-3xl">Recognition events</h1>
        <p class="mt-2 text-sm leading-6 text-white/55">Review detections, confirm identities, and clear noise without losing the feed.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-sm">
        <div class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:border-white/15 hover:bg-white/8">
          <span class="text-white/40">Events</span>
          <span class="ml-2 font-semibold text-white">{{ matchCount }}</span>
        </div>
        <div class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:border-white/15 hover:bg-white/8">
          <span class="text-white/40">Unknown</span>
          <span class="ml-2 font-semibold text-white">{{ unknownCount }}</span>
        </div>
        <div class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:border-white/15 hover:bg-white/8">
          <span class="text-white/40">Avg</span>
          <span class="ml-2 font-semibold text-white">{{ averageConfidence }}%</span>
        </div>
      </div>
    </header>

    <section class="space-y-6">
      <BaseCard>
        <MatchesToolbar
          :has-active-filters="hasActiveFilters"
          :max-confidence="maxConfidence"
          :min-confidence="minConfidence"
          :results-summary="resultsSummary"
          :search-query="searchQuery"
          :sort-options="sortOptions"
          :sort-order="sortOrder"
          :status-filter="statusFilter"
          :status-filter-options="statusFilterOptions"
          :view-mode="viewMode"
          :view-options="viewOptions"
          @reset="resetFilters"
          @update:max-confidence="setMaxConfidence"
          @update:min-confidence="setMinConfidence"
          @update:search-query="setSearchQuery"
          @update:sort-order="setSortOrder"
          @update:status-filter="setStatusFilter"
        />

        <div class="mt-4 flex flex-col gap-3 border-t border-white/8 pt-4">
          <MatchQuickFilters
            :quick-filters="quickFilters"
            @apply="applyQuickFilter"
          />

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-1 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-1 opacity-0"
          >
            <MatchActiveFilters
              v-if="activeFilters.length > 0"
              :active-filters="activeFilters"
              @clear="resetFilters"
              @remove="clearFilter"
            />
          </Transition>
        </div>
      </BaseCard>

      <BaseCard v-if="error">
          <div class="flex flex-col gap-2 py-2">
            <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-rose-300/70">API Error</p>
            <p class="text-sm leading-6 text-rose-200/80">{{ error }}</p>
          </div>
        </BaseCard>

        <div
          v-if="loading"
          class="grid gap-4 sm:grid-cols-2"
        >
          <div
            v-for="n in 6"
            :key="n"
            class="animate-pulse overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3"
          >
            <div class="aspect-[4/3] rounded-xl bg-white/5" />
            <div class="mt-3 h-4 w-2/3 rounded bg-white/5" />
            <div class="mt-2 h-3 w-1/2 rounded bg-white/5" />
          </div>
        </div>

        <div
          v-else
          class="grid gap-4 sm:grid-cols-2"
        >
          <div
            v-if="matches.length === 0"
            class="col-span-full"
          >
            <BaseCard>
              <div class="flex flex-col items-start gap-3 py-4">
                <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">No results</p>
                <h2 class="text-xl font-semibold tracking-tight text-white">No events match the current filters.</h2>
                <p class="max-w-xl text-sm leading-7 text-white/60">Try clearing filters, widening the confidence range, or searching for another name.</p>
              </div>
            </BaseCard>
          </div>
          <MatchCard
            v-for="match in matches"
            :key="match.id"
            layout="grid"
            :match="match"
            @confirm="confirm"
            @ignore="ignore"
          />
        </div>

    </section>
  </PageContainer>
</template>

<script setup lang="ts">
import MatchActiveFilters from '@/features/matches/components/MatchActiveFilters.vue';
import MatchCard from '@/features/matches/components/MatchCard.vue';
import MatchQuickFilters from '@/features/matches/components/MatchQuickFilters.vue';
import MatchesToolbar from '@/features/matches/components/MatchesToolbar.vue';
import { useMatches } from '@/features/matches/composables/useMatches';
import BaseCard from '@/shared/ui/BaseCard.vue';
import PageContainer from '@/shared/ui/PageContainer.vue';

const {
  activeFilters,
  applyQuickFilter,
  averageConfidence,
  clearFilter,
  confirm,
  error,
  hasActiveFilters,
  ignore,
  loading,
  matchCount,
  matches,
  maxConfidence,
  minConfidence,
  quickFilters,
  resetFilters,
  resultsSummary,
  searchQuery,
  setMaxConfidence,
  setMinConfidence,
  setSearchQuery,
  setSortOrder,
  setStatusFilter,
  sortOptions,
  sortOrder,
  statusFilter,
  statusFilterOptions,
  unknownCount,
  viewMode,
  viewOptions,
} = useMatches();
</script>