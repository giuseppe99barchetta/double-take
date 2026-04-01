import { computed, onMounted, ref, watch } from 'vue';
import { parseDocument } from 'yaml';
import { fetchConfig, fetchConfigYaml, saveConfigYaml } from '@/features/config/services/config.service';
import type { AppConfig } from '@/features/config/types';

const getChangedLineNumbers = (original: string, current: string): number[] => {
  const originalLines = original.split('\n');
  const currentLines = current.split('\n');
  const changed = new Set<number>();

  let originalIndex = 0;
  let currentIndex = 0;

  while (originalIndex < originalLines.length && currentIndex < currentLines.length) {
    if (originalLines[originalIndex] === currentLines[currentIndex]) {
      originalIndex += 1;
      currentIndex += 1;
      continue;
    }

    changed.add(currentIndex + 1);

    if (originalLines[originalIndex + 1] === currentLines[currentIndex]) {
      originalIndex += 1;
      continue;
    }

    if (originalLines[originalIndex] === currentLines[currentIndex + 1]) {
      currentIndex += 1;
      continue;
    }

    originalIndex += 1;
    currentIndex += 1;
  }

  while (currentIndex < currentLines.length) {
    changed.add(currentIndex + 1);
    currentIndex += 1;
  }

  return Array.from(changed).sort((left, right) => left - right);
};

export const useConfig = () => {
  const config = ref<AppConfig | null>(null);
  const yamlCode = ref('');
  const loadedYamlCode = ref('');
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);
  const saveError = ref<string | null>(null);
  const saveSuccess = ref(false);
  const validationError = ref<string | null>(null);

  const hasChanges = computed(() => yamlCode.value !== loadedYamlCode.value);
  const initialLoading = computed(() => loading.value && !config.value);
  const changedLineNumbers = computed(() => getChangedLineNumbers(loadedYamlCode.value, yamlCode.value));

  watch(yamlCode, () => {
    saveSuccess.value = false;
    saveError.value = null;
    validationError.value = null;
  });

  const fetchData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const [parsed, yaml] = await Promise.all([fetchConfig(), fetchConfigYaml()]);
      config.value = parsed;
      yamlCode.value = yaml;
      loadedYamlCode.value = yaml;
      saveSuccess.value = false;
      saveError.value = null;
      validationError.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load configuration.';
    } finally {
      loading.value = false;
    }
  };

  const resetToCurrentConfig = async () => {
    await fetchData();
  };

  const save = async () => {
    const parsed = parseDocument(yamlCode.value, { prettyErrors: true });
    if (parsed.errors.length > 0) {
      validationError.value = parsed.errors[0]?.message || 'Invalid YAML.';
      saveSuccess.value = false;
      return false;
    }

    saving.value = true;
    saveError.value = null;
    saveSuccess.value = false;
    validationError.value = null;
    try {
      await saveConfigYaml(yamlCode.value);
      saveSuccess.value = true;
      // Reload parsed config after save
      const [parsed, yaml] = await Promise.all([fetchConfig(), fetchConfigYaml()]);
      config.value = parsed;
      yamlCode.value = yaml;
      loadedYamlCode.value = yaml;
      return true;
    } catch (err) {
      saveError.value = err instanceof Error ? err.message : 'Failed to save configuration.';
      return false;
    } finally {
      saving.value = false;
    }
  };

  onMounted(() => {
    void fetchData();
  });

  return {
    changedLineNumbers,
    config,
    error,
    fetchData,
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
  };
};
