import { http } from '@/shared/api/http';
import type { AppConfig } from '@/features/config/types';
import type { MqttStatus } from '@/features/cameras/types';

const getAuthorizedInit = (): RequestInit | undefined => {
  const token = localStorage.getItem('token');
  if (!token) return undefined;
  return { headers: { authorization: token } };
};

export const fetchCameraConfig = (): Promise<AppConfig> =>
  http.get<AppConfig>('config', getAuthorizedInit());

export const fetchMqttStatus = (): Promise<MqttStatus> =>
  http.get<MqttStatus>('status/mqtt', getAuthorizedInit());

export const triggerCameraRecognition = (cameraName: string): Promise<unknown> =>
  http.get(`camera/${encodeURIComponent(cameraName)}?attempts=1&break=false`, getAuthorizedInit());
