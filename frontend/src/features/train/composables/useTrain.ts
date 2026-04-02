import { computed, onMounted, ref } from 'vue';
import {
  fetchAllTrainFiles,
  fetchTrainStatus,
  renameTrainFileIdentity,
  retrainIdentity,
  uploadIdentityFaces,
} from '@/features/train/services/train.service';
import type { TrainFile, TrainIdentity, TrainStatusItem } from '@/features/train/types';

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const toTrainIdentity = (name: string, files: TrainFile[]): TrainIdentity => {
  const trainedFaces = files.filter((file) => file.trainedDetectors.length > 0).length;
  const latestCreatedAt = files
    .map((file) => file.createdAt)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? null;

  return {
    name,
    latestCreatedAt,
    totalFaces: files.length,
    trainedFaces,
    untrainedFaces: files.length - trainedFaces,
  };
};

export const useTrain = () => {
  const files = ref<TrainFile[]>([]);
  const statuses = ref<TrainStatusItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const selectedIdentityName = ref<string | null>(null);
  const uploadPending = ref(false);
  const renamePending = ref(false);
  const retrainPending = ref(false);
  const statusLoading = ref(false);
  const actionMessage = ref<string | null>(null);

  const identities = computed<TrainIdentity[]>(() => {
    const grouped = files.value.reduce<Record<string, TrainFile[]>>((acc, file) => {
      if (!acc[file.identityName]) {
        acc[file.identityName] = [];
      }
      acc[file.identityName].push(file);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, identityFiles]) => toTrainIdentity(name, identityFiles))
      .sort((left, right) => left.name.localeCompare(right.name));
  });

  const selectedIdentity = computed(
    () => identities.value.find((identity) => identity.name === selectedIdentityName.value) ?? null,
  );

  const selectedIdentityFiles = computed(() => {
    if (!selectedIdentityName.value) {
      return files.value;
    }

    return files.value.filter((file) => file.identityName === selectedIdentityName.value);
  });

  const refresh = async () => {
    loading.value = true;
    error.value = null;

    try {
      const [fetchedFiles, fetchedStatus] = await Promise.all([fetchAllTrainFiles(), fetchTrainStatus()]);
      files.value = fetchedFiles;
      statuses.value = fetchedStatus;

      if (selectedIdentityName.value) {
        const stillExists = fetchedFiles.some((file) => file.identityName === selectedIdentityName.value);
        if (!stillExists) {
          selectedIdentityName.value = null;
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load train data.';
      files.value = [];
      statuses.value = [];
    } finally {
      loading.value = false;
    }
  };

  const selectIdentity = (identityName: string | null) => {
    selectedIdentityName.value = identityName;
  };

  const refreshStatus = async () => {
    statusLoading.value = true;
    try {
      statuses.value = await fetchTrainStatus();
    } catch {
      // Keep last known statuses in UI if status polling fails.
    } finally {
      statusLoading.value = false;
    }
  };

  const pollStatusUntilComplete = async () => {
    const maxAttempts = 25;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await refreshStatus();
      const hasRunning = statuses.value.some((status) => status.percent < 100);
      if (!hasRunning) {
        return;
      }
      await sleep(1500);
    }
  };

  const uploadFaces = async (identityName: string, selectedFiles: File[]) => {
    const normalizedName = identityName.trim();
    if (!normalizedName) {
      throw new Error('Identity name is required.');
    }

    if (selectedFiles.length === 0) {
      throw new Error('Select at least one face image.');
    }

    uploadPending.value = true;
    error.value = null;

    try {
      await uploadIdentityFaces(normalizedName, selectedFiles);
      selectedIdentityName.value = normalizedName;
      actionMessage.value = `Queued ${selectedFiles.length} image(s) for ${normalizedName}.`;
      await refresh();
      await pollStatusUntilComplete();
      await refresh();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to upload faces.';
      throw err;
    } finally {
      uploadPending.value = false;
    }
  };

  const renameIdentity = async (identityName: string, nextIdentityName: string) => {
    const normalizedNextName = nextIdentityName.trim();
    if (!identityName || !normalizedNextName) {
      throw new Error('Both current and next identity names are required.');
    }

    if (identityName === normalizedNextName) {
      return;
    }

    const identityFiles = files.value.filter((file) => file.identityName === identityName);

    if (!identityFiles.length) {
      throw new Error('No faces found for the selected identity.');
    }

    renamePending.value = true;
    error.value = null;

    try {
      await Promise.all(
        identityFiles.map((file) => renameTrainFileIdentity(file.id, normalizedNextName)),
      );
      selectedIdentityName.value = normalizedNextName;
      actionMessage.value = `Renamed ${identityName} to ${normalizedNextName}.`;
      await refresh();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to rename identity.';
      throw err;
    } finally {
      renamePending.value = false;
    }
  };

  const retrain = async (identityName: string) => {
    const normalizedName = identityName.trim();
    if (!normalizedName) {
      throw new Error('Identity name is required to run training.');
    }

    retrainPending.value = true;
    error.value = null;

    try {
      await retrainIdentity(normalizedName);
      actionMessage.value = `Training triggered for ${normalizedName}.`;
      await pollStatusUntilComplete();
      await refresh();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to trigger training.';
      throw err;
    } finally {
      retrainPending.value = false;
    }
  };

  onMounted(() => {
    void refresh();
  });

  return {
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
  };
};
