const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const basePath = trimTrailingSlash(window.ingressUrl || window.publicPath || '');

export const appEnv = {
  apiBaseUrl: `${window.location.origin}${basePath}/api`,
  routerBase: basePath,
} as const;