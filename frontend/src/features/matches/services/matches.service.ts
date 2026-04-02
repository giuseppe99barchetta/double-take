import type { MatchDetection, MatchEvent } from '@/features/matches/types';
import { appEnv } from '@/shared/config/env';
import { http } from '@/shared/api/http';

interface ApiMatchResultBox {
  height?: number;
  left?: number;
  top?: number;
  width?: number;
  x?: number;
  y?: number;
}

interface ApiMatchResultItem {
  box?: ApiMatchResultBox;
  confidence?: number;
  match?: boolean;
  name?: string;
}

interface ApiMatchResponseGroup {
  results?: ApiMatchResultItem[];
}

interface ApiMatchFile {
  height?: number;
  key?: string;
  width?: number;
}

interface ApiMatch {
  id: number | string;
  camera?: string;
  createdAt?: string;
  file?: ApiMatchFile;
  response?: ApiMatchResponseGroup[];
  token?: string;
  updatedAt?: string | null;
}

interface FetchMatchesResponse {
  limit: number;
  matches: ApiMatch[];
  total: number;
}

interface SuccessResponse {
  success?: boolean;
}

const UNKNOWN_NAMES = new Set(['', 'unknown', 'stranger']);

const getAuthorizedInit = (): RequestInit | undefined => {
  const token = localStorage.getItem('token');
  if (!token) {
    return undefined;
  }

  return {
    headers: {
      authorization: token,
    },
  };
};

const toMatchId = (id: string) => {
  const parsed = Number(id);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid match id: ${id}`);
  }

  return parsed;
};

const normalizeConfidence = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  if (value >= 0 && value <= 1) {
    return Math.round(value * 100);
  }

  return Math.round(value);
};

const resolveStorageUrl = (match: ApiMatch, thumb: boolean) => {
  const key = match.file?.key;
  if (!key) {
    return '';
  }

  const tokenQuery = match.token ? `&token=${encodeURIComponent(match.token)}` : '';
  const thumbQuery = thumb ? 'thumb' : '';
  const query = [thumbQuery, tokenQuery.startsWith('&') ? tokenQuery.slice(1) : tokenQuery].filter(Boolean).join('&');
  return query.length ? `${appEnv.apiBaseUrl}/storage/${key}?${query}` : `${appEnv.apiBaseUrl}/storage/${key}`;
};

const resolveThumbnailUrl = (match: ApiMatch) => resolveStorageUrl(match, true);

const resolveImageUrl = (match: ApiMatch) => resolveStorageUrl(match, false);

const toPercent = (value: unknown, dimension?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  if (value >= 0 && value <= 1) {
    return value * 100;
  }

  if (typeof dimension === 'number' && Number.isFinite(dimension) && dimension > 0) {
    return (value / dimension) * 100;
  }

  if (value >= 0 && value <= 100) {
    return value;
  }

  return null;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const toDetection = (result: ApiMatchResultItem, imageWidth?: number, imageHeight?: number): MatchDetection | null => {
  const box = result.box;
  if (!box) {
    return null;
  }

  const left = toPercent(box.left ?? box.x, imageWidth);
  const top = toPercent(box.top ?? box.y, imageHeight);
  const width = toPercent(box.width, imageWidth);
  const height = toPercent(box.height, imageHeight);

  if (left === null || top === null || width === null || height === null || width <= 0 || height <= 0) {
    return null;
  }

  const rawName = typeof result.name === 'string' ? result.name.trim() : '';
  const normalizedName = rawName.toLowerCase();
  const isRecognized = result.match === true && !UNKNOWN_NAMES.has(normalizedName);

  return {
    box: {
      leftPct: clampPercent(left),
      topPct: clampPercent(top),
      widthPct: clampPercent(width),
      heightPct: clampPercent(height),
    },
    confidence: normalizeConfidence(result.confidence),
    isRecognized,
    subject: isRecognized ? rawName : null,
  };
};

const toMatchEvent = (match: ApiMatch): MatchEvent => {
  const allResults = (match.response ?? []).flatMap((group) => group.results ?? []);
  const bestResult = allResults
    .filter((result) => typeof result.confidence === 'number')
    .sort((left, right) => (right.confidence ?? 0) - (left.confidence ?? 0))[0];

  const rawName = typeof bestResult?.name === 'string' ? bestResult.name.trim() : '';
  const normalizedName = rawName.toLowerCase();
  const isRecognized = bestResult?.match === true && !UNKNOWN_NAMES.has(normalizedName);
  const confidence = normalizeConfidence(bestResult?.confidence);
  const timestamp = match.updatedAt || match.createdAt || new Date().toISOString();
  const imageWidth = typeof match.file?.width === 'number' ? match.file.width : undefined;
  const imageHeight = typeof match.file?.height === 'number' ? match.file.height : undefined;
  const detections = allResults
    .map((result) => toDetection(result, imageWidth, imageHeight))
    .filter((detection): detection is MatchDetection => detection !== null);

  return {
    id: String(match.id),
    cameraLabel: match.camera || 'Unknown camera',
    confidence,
    detections,
    imageUrl: resolveImageUrl(match),
    imageHeight: imageHeight ?? null,
    imageWidth: imageWidth ?? null,
    thumbnailUrl: resolveThumbnailUrl(match),
    subjectName: isRecognized ? rawName : null,
    timestamp,
  };
};

export const fetchMatches = async (): Promise<MatchEvent[]> => {
  const response = await http.post<FetchMatchesResponse>(
    'match?page=1',
    {
      sinceId: 0,
      filters: {},
    },
    getAuthorizedInit(),
  );

  return (response.matches ?? []).map(toMatchEvent);
};

export const confirmMatch = async (id: string, name: string): Promise<void> => {
  await http.post<SuccessResponse>(
    `train/add/${encodeURIComponent(name)}`,
    {
      ids: [toMatchId(id)],
    },
    getAuthorizedInit(),
  );
};

export const ignoreMatch = async (id: string): Promise<void> => {
  await http.delete<SuccessResponse>(
    'match',
    {
      ids: [toMatchId(id)],
    },
    getAuthorizedInit(),
  );
};

export const renameMatch = async (id: string, name: string): Promise<void> => {
  await http.post<SuccessResponse>(
    `train/add/${encodeURIComponent(name)}`,
    {
      ids: [toMatchId(id)],
    },
    getAuthorizedInit(),
  );
};
