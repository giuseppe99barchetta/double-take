export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'other';
export type LogLevelFilter = 'all' | LogLevel;

export interface BackendLogsResponse {
  size: string;
  logs: string;
}

export interface LogEntry {
  id: string;
  line: string;
  level: LogLevel;
  message: string;
  timestamp: string | null;
}
