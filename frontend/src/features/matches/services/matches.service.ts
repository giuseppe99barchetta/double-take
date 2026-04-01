import type { MatchEvent } from '@/features/matches/types';
import { appEnv } from '@/shared/config/env';
import { http } from '@/shared/api/http';

interface ApiMatchResultItem {
  confidence?: number;
  match?: boolean;
  name?: string;
}

interface ApiMatchResponseGroup {
  results?: ApiMatchResultItem[];
}

interface ApiMatchFile {
  key?: string;
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

const resolveSnapshotUrl = (match: ApiMatch) => {
  const key = match.file?.key;
  if (!key) {
    return '';
  }

  const tokenQuery = match.token ? `&token=${encodeURIComponent(match.token)}` : '';
  return `${appEnv.apiBaseUrl}/storage/${key}?thumb${tokenQuery}`;
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

  return {
    id: String(match.id),
    cameraLabel: match.camera || 'Unknown camera',
    confidence,
    snapshotUrl: resolveSnapshotUrl(match),
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
