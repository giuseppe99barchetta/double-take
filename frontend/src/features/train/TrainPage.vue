<template>
  <PageContainer>
    <header class="flex flex-col gap-4 border-b border-white/8 pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="w-full">
        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-white lg:text-3xl">Identity training</h1>
        <p class="mt-2 text-sm leading-6 text-white/55">Manage known identities, upload face images, and trigger detector retraining.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <div class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:border-white/15 hover:bg-white/8">
          <span class="text-white/40">Identities</span>
          <span class="ml-2 font-semibold text-white">{{ identities.length }}</span>
        </div>
        <div class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:border-white/15 hover:bg-white/8">
          <span class="text-white/40">Faces</span>
          <span class="ml-2 font-semibold text-white">{{ files.length }}</span>
        </div>
      </div>
    </header>

    <BaseCard v-if="error">
      <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-rose-300/70">Error</p>
      <p class="mt-2 text-sm text-rose-200/80">{{ error }}</p>
    </BaseCard>

    <BaseCard v-if="actionMessage" class="border-emerald-300/20 bg-emerald-400/10">
      <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-emerald-200/80">Status</p>
      <p class="mt-2 text-sm text-emerald-50/90">{{ actionMessage }}</p>
    </BaseCard>

    <div v-if="loading" class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <BaseCard v-for="n in 3" :key="n" class="animate-pulse">
        <div class="h-4 w-1/3 rounded bg-white/5" />
        <div class="mt-4 space-y-2">
          <div class="h-3 w-full rounded bg-white/5" />
          <div class="h-3 w-2/3 rounded bg-white/5" />
        </div>
      </BaseCard>
    </div>

    <template v-else>
      <div v-if="identities.length === 0" class="grid grid-cols-1 gap-4">
        <BaseCard>
          <div class="flex flex-col gap-3 py-4">
            <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">No identities yet</p>
            <p class="max-w-xl text-sm leading-7 text-white/60">Upload one or more face images to create your first identity and start training.</p>
          </div>
        </BaseCard>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
        <BaseCard class="overflow-hidden">
          <div class="mb-4 flex items-center justify-between gap-3">
            <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">Identity list</p>
            <button
              type="button"
              class="rounded-xl border border-white/12 bg-white/7 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-45"
              :disabled="loading"
              @click="refresh"
            >
              Refresh
            </button>
          </div>

          <div v-if="identities.length === 0" class="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4 text-sm text-white/60">
            No identities available yet.
          </div>

          <div v-else class="max-h-[25rem] space-y-2 overflow-auto pr-1">
            <button
              type="button"
              class="w-full rounded-2xl border px-4 py-3 text-left transition"
              :class="selectedIdentityName === null
                ? 'border-cyan-200/35 bg-cyan-200/12 text-cyan-50'
                : 'border-white/8 bg-white/[0.03] text-white/78 hover:bg-white/[0.06]'"
              @click="selectIdentity(null)"
            >
              <p class="text-[0.65rem] uppercase tracking-widest text-white/45">All identities</p>
              <p class="mt-1 text-sm">Show every face currently available for training.</p>
            </button>

            <button
              v-for="identity in identities"
              :key="identity.name"
              type="button"
              class="w-full rounded-2xl border px-4 py-3 text-left transition"
              :class="selectedIdentityName === identity.name
                ? 'border-cyan-200/35 bg-cyan-200/12 text-cyan-50'
                : 'border-white/8 bg-white/[0.03] text-white/78 hover:bg-white/[0.06]'"
              @click="selectIdentity(identity.name)"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="truncate text-sm font-semibold text-white">{{ identity.name }}</p>
                <span class="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[0.62rem] uppercase tracking-widest text-white/65">
                  {{ identity.totalFaces }} faces
                </span>
              </div>
              <div class="mt-2 flex items-center gap-2 text-xs text-white/60">
                <span>trained {{ identity.trainedFaces }}</span>
                <span class="text-white/35">/</span>
                <span>pending {{ identity.untrainedFaces }}</span>
              </div>
            </button>
          </div>
        </BaseCard>

        <div class="space-y-4">
          <BaseCard>
            <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">Upload / add face</p>

            <form class="mt-4 space-y-3" @submit.prevent="onUpload">
              <div class="space-y-1.5">
                <label class="text-xs uppercase tracking-widest text-white/45" for="identity-name">Identity name</label>
                <input
                  id="identity-name"
                  v-model="uploadIdentity"
                  list="identities-list"
                  class="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white outline-none transition hover:border-white/20 focus:border-cyan-200/45"
                  placeholder="e.g. john"
                />
                <datalist id="identities-list">
                  <option v-for="identity in identities" :key="identity.name" :value="identity.name" />
                </datalist>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs uppercase tracking-widest text-white/45" for="identity-files">Face images</label>
                <input
                  id="identity-files"
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  class="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-white/12 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-[0.14em] file:text-white/85"
                  @change="onFileSelection"
                />
              </div>

              <button
                type="submit"
                class="w-full rounded-xl border border-cyan-200/65 bg-cyan-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:border-cyan-200/20 disabled:bg-cyan-200/20 disabled:text-slate-900/40"
                :disabled="uploadPending"
              >
                {{ uploadPending ? 'Uploading...' : 'Upload faces' }}
              </button>
            </form>
          </BaseCard>

          <BaseCard>
            <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">Training actions</p>

            <div class="mt-4 space-y-3">
              <div class="space-y-1.5">
                <label class="text-xs uppercase tracking-widest text-white/45" for="rename-identity">Rename selected identity</label>
                <div class="flex gap-2">
                  <input
                    id="rename-identity"
                    v-model="renameTarget"
                    class="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white outline-none transition hover:border-white/20 focus:border-cyan-200/45"
                    :disabled="!selectedIdentity"
                    placeholder="new name"
                  />
                  <button
                    type="button"
                    class="rounded-xl border border-white/12 bg-white/7 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-45"
                    :disabled="!selectedIdentity || renamePending"
                    @click="onRename"
                  >
                    {{ renamePending ? 'Saving...' : 'Rename' }}
                  </button>
                </div>
              </div>

              <button
                type="button"
                class="w-full rounded-xl border border-emerald-300/30 bg-emerald-300/12 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100 transition hover:bg-emerald-300/22 disabled:cursor-not-allowed disabled:opacity-45"
                :disabled="!selectedIdentity || retrainPending"
                @click="onRetrain"
              >
                {{ retrainPending ? 'Training...' : 'Retrain selected identity' }}
              </button>

              <button
                type="button"
                class="w-full rounded-xl border border-white/12 bg-white/7 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-45"
                :disabled="statusLoading"
                @click="refreshStatus"
              >
                {{ statusLoading ? 'Refreshing...' : 'Refresh status' }}
              </button>
            </div>
          </BaseCard>
        </div>
      </div>

      <BaseCard>
        <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">Training status</p>

        <div v-if="statuses.length === 0" class="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4 text-sm text-white/60">
          No active training jobs.
        </div>

        <div v-else class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <BaseCard
            v-for="status in statuses"
            :key="status.name"
            content-class="space-y-3"
          >
            <p class="truncate text-sm font-semibold text-white">{{ status.name }}</p>
            <p class="text-xs text-white/60">{{ status.trained }} / {{ status.total }} trained</p>
            <div class="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                class="h-full rounded-full bg-cyan-200 transition-all duration-300"
                :style="{ width: `${Math.max(0, Math.min(100, status.percent))}%` }"
              />
            </div>
            <p class="text-xs text-white/55">{{ status.percent }}%</p>
          </BaseCard>
        </div>
      </BaseCard>

      <BaseCard>
        <p class="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">Faces</p>

        <div v-if="selectedIdentityFiles.length === 0" class="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4 text-sm text-white/60">
          No face images found for the current identity selection.
        </div>

        <div v-else class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          <div
            v-for="file in selectedIdentityFiles"
            :key="file.id"
            class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
          >
            <img
              :src="file.previewUrl"
              :alt="`${file.identityName} face`"
              class="h-28 w-full object-cover"
              loading="lazy"
            />
            <div class="space-y-1 px-2.5 py-2 text-[0.68rem] text-white/65">
              <p class="truncate font-semibold text-white/90">{{ file.identityName }}</p>
              <p class="truncate">{{ file.file.filename }}</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTrain } from '@/features/train/composables/useTrain';
import BaseCard from '@/shared/ui/BaseCard.vue';
import PageContainer from '@/shared/ui/PageContainer.vue';

const {
  actionMessage,
  error,
  files,
  identities,
  loading,
  refresh,
  refreshStatus,
  renameIdentity,
  renamePending,
  retrain,
  retrainPending,
  selectIdentity,
  selectedIdentity,
  selectedIdentityFiles,
  selectedIdentityName,
  statusLoading,
  statuses,
  uploadFaces,
  uploadPending,
} = useTrain();

const selectedFiles = ref<File[]>([]);
const uploadIdentity = ref('');
const renameTarget = ref('');

watch(selectedIdentity, (identity) => {
  renameTarget.value = identity?.name ?? '';
  if (identity?.name) {
    uploadIdentity.value = identity.name;
  }
});

const onFileSelection = (event: Event) => {
  const target = event.target as HTMLInputElement;
  selectedFiles.value = target.files ? Array.from(target.files) : [];
};

const onUpload = async () => {
  try {
    await uploadFaces(uploadIdentity.value, selectedFiles.value);
    selectedFiles.value = [];
  } catch {
    // Errors are already surfaced through composable state.
  }
};

const onRename = async () => {
  if (!selectedIdentity.value) return;
  try {
    await renameIdentity(selectedIdentity.value.name, renameTarget.value);
  } catch {
    // Errors are already surfaced through composable state.
  }
};

const onRetrain = async () => {
  if (!selectedIdentity.value) return;
  try {
    await retrain(selectedIdentity.value.name);
  } catch {
    // Errors are already surfaced through composable state.
  }
};
</script>
