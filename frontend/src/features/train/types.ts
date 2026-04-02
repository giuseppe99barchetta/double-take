export interface TrainStatusItem {
  name: string;
  percent: number;
  total: number;
  trained: number;
}

export interface TrainFile {
  id: string;
  identityName: string;
  createdAt: string;
  token: string | null;
  file: {
    filename: string;
    height: number;
    key: string;
    width: number;
  };
  trainedDetectors: string[];
  previewUrl: string;
}

export interface TrainIdentity {
  name: string;
  totalFaces: number;
  trainedFaces: number;
  untrainedFaces: number;
  latestCreatedAt: string | null;
}
