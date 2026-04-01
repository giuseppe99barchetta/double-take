import { onMounted, ref } from 'vue';
import {
  fetchCameraConfig,
  fetchMqttStatus,
  triggerCameraRecognition,
} from '@/features/cameras/services/cameras.service';
import type { CameraRow, MqttStatus } from '@/features/cameras/types';

export const useCameras = () => {
  const cameras = ref<CameraRow[]>([]);
  const mqttStatus = ref<MqttStatus | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const [cfg, mqtt] = await Promise.all([fetchCameraConfig(), fetchMqttStatus()]);
      mqttStatus.value = mqtt;
      cameras.value = Object.entries(cfg.cameras ?? {}).map(([name, cam]) => ({
        name,
        snapshotUrl: cam.snapshot?.url,
        snapshotTopic: cam.snapshot?.topic,
        triggerState: 'idle',
      }));
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load camera data.';
    } finally {
      loading.value = false;
    }
  };

  const trigger = async (cameraName: string) => {
    const row = cameras.value.find((c) => c.name === cameraName);
    if (!row) return;
    row.triggerState = 'running';
    row.triggerError = undefined;
    try {
      await triggerCameraRecognition(cameraName);
      row.triggerState = 'done';
    } catch (err) {
      row.triggerState = 'error';
      row.triggerError = err instanceof Error ? err.message : 'Recognition failed.';
    }
  };

  onMounted(() => {
    void fetchData();
  });

  return {
    cameras,
    error,
    fetchData,
    loading,
    mqttStatus,
    trigger,
  };
};
