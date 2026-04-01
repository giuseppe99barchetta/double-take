export interface DetectorConfig {
  url?: string;
  key?: string;
  timeout?: number;
  det_prob_threshold?: number;
  opencv_face_required?: boolean;
}

export interface DetectThreshold {
  save?: boolean;
  confidence?: number;
  purge?: number;
  min_area?: number;
}

export interface MqttConfig {
  host?: string;
  port?: number;
  username?: string;
  topics?: {
    frigate?: string;
    matches?: string;
    cameras?: string;
    homeassistant?: string;
  };
}

export interface CameraSnapshotConfig {
  url?: string;
  topic?: string;
}

export interface CameraConfig {
  snapshot?: CameraSnapshotConfig;
}

export interface AppConfig {
  version?: string;
  auth?: boolean;
  detect?: {
    match?: DetectThreshold;
    unknown?: DetectThreshold;
  };
  detectors?: Record<string, DetectorConfig>;
  mqtt?: MqttConfig;
  cameras?: Record<string, CameraConfig>;
  ui?: {
    path?: string;
    pagination?: { limit?: number };
  };
  logs?: {
    level?: string;
  };
}
