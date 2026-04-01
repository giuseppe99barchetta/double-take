export interface CameraEntry {
  name: string;
  snapshotUrl?: string;
  snapshotTopic?: string;
}

export interface MqttStatus {
  connected: boolean;
  status: string | false;
}

export type TriggerState = 'idle' | 'running' | 'done' | 'error';

export interface CameraRow extends CameraEntry {
  triggerState: TriggerState;
  triggerError?: string;
}
