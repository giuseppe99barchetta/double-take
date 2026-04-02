import { appEnv } from '@/shared/config/env';
import { http } from '@/shared/api/http';
import type { TrainFile, TrainStatusItem } from '@/features/train/types';

interface ApiTrainResult {
  detector?: string;
  result?: {
    status?: number;
    $metadata?: {
      httpStatusCode?: number;
    };
  } | null;
}

interface ApiTrainFile {
  id: string | number;
  name: string;
  createdAt?: string;
  token?: string | null;
  file: {
    filename: string;
    height?: number;
    key: string;
    width?: number;
  };
  results?: ApiTrainResult[];
}

interface FetchTrainPageResponse {
  files: ApiTrainFile[];
  limit: number;
  total: number;
}

const getAuthorizedInit = (): RequestInit | undefined => {
  const token = localStorage.getItem('token');
  if (!token) return undefined;
  return { headers: { authorization: token } };
};

const isDetectorTrainSuccess = (item: ApiTrainResult) => {
  const status = item.result?.status ?? item.result?.$metadata?.httpStatusCode;
  if (typeof status !== 'number') return false;
  return Math.floor(status / 100) === 2;
};

const toTrainFile = (entry: ApiTrainFile): TrainFile => {
  const tokenQuery = entry.token ? `?thumb&token=${encodeURIComponent(entry.token)}` : '?thumb';
  const previewUrl = `${appEnv.apiBaseUrl}/storage/${entry.file.key}${tokenQuery}`;

  return {
    id: String(entry.id),
    identityName: entry.name,
    createdAt: entry.createdAt ?? new Date().toISOString(),
    file: {
      filename: entry.file.filename,
      height: entry.file.height ?? 0,
      key: entry.file.key,
      width: entry.file.width ?? 0,
    },
    previewUrl,
    token: entry.token ?? null,
    trainedDetectors: (entry.results ?? [])
      .filter((item) => item.detector && isDetectorTrainSuccess(item))
      .map((item) => item.detector as string),
  };
};

const fetchTrainPage = async (page: number, identityName?: string): Promise<FetchTrainPageResponse> => {
  const query = new URLSearchParams({ page: String(page) });
  if (identityName) query.set('name', identityName);
  return http.get<FetchTrainPageResponse>(`train?${query.toString()}`, getAuthorizedInit());
};

export const fetchAllTrainFiles = async (identityName?: string): Promise<TrainFile[]> => {
  const firstPage = await fetchTrainPage(1, identityName);
  const files = [...(firstPage.files ?? [])];

  const maxPage = Math.max(1, Math.ceil((firstPage.total ?? files.length) / Math.max(1, firstPage.limit || 1)));

  for (let page = 2; page <= maxPage; page += 1) {
    const current = await fetchTrainPage(page, identityName);
    files.push(...(current.files ?? []));
  }

  return files.map(toTrainFile);
};

export const fetchTrainStatus = (): Promise<TrainStatusItem[]> =>
  http.get<TrainStatusItem[]>('train/status', getAuthorizedInit());

export const retrainIdentity = (identityName: string): Promise<unknown> =>
  http.get(`train/retrain/${encodeURIComponent(identityName)}`, getAuthorizedInit());

export const renameTrainFileIdentity = (fileId: string, nextIdentityName: string): Promise<unknown> =>
  http.patch(`train/${encodeURIComponent(fileId)}`, { name: nextIdentityName }, getAuthorizedInit());

export const uploadIdentityFaces = async (identityName: string, files: File[]): Promise<void> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files[]', file);
  });

  const token = localStorage.getItem('token');
  const response = await fetch(`${appEnv.apiBaseUrl}/train/add/${encodeURIComponent(identityName)}`, {
    method: 'POST',
    headers: token ? { authorization: token } : undefined,
    body: formData,
  });

  if (!response.ok) {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();
    const message =
      typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : `Upload failed with status ${response.status}`;
    throw new Error(message);
  }
};
