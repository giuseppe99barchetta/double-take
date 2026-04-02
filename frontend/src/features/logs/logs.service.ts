import { http } from '@/shared/api/http';
import type { BackendLogsResponse } from '@/features/logs/types';

const getAuthorizedInit = (): RequestInit | undefined => {
  const token = localStorage.getItem('token');
  if (!token) return undefined;
  return { headers: { authorization: token } };
};

export const fetchLogs = (): Promise<BackendLogsResponse> =>
  http.get<BackendLogsResponse>('logger', getAuthorizedInit());

export const clearLogs = (): Promise<void> =>
  http.delete<void>('logger', undefined, getAuthorizedInit());
