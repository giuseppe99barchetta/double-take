import { http } from '@/shared/api/http';
import type { AppConfig } from '@/features/config/types';

const getAuthorizedInit = (): RequestInit | undefined => {
  const token = localStorage.getItem('token');
  if (!token) return undefined;
  return { headers: { authorization: token } };
};

export const fetchConfig = (): Promise<AppConfig> =>
  http.get<AppConfig>('config', getAuthorizedInit());

export const fetchConfigYaml = (): Promise<string> =>
  http.get<string>('config?format=yaml', getAuthorizedInit());

export const saveConfigYaml = (code: string): Promise<void> =>
  http.patch<void>('config', { code }, getAuthorizedInit());
