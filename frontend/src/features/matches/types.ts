export type MatchCardLayout = 'grid' | 'list';
export type MatchSortOrder = 'newest' | 'oldest' | 'highest-confidence';
export type MatchStatusFilter = 'all' | 'recognized' | 'unknown';
export type MatchActiveFilterId = 'search' | 'status' | 'confidence' | 'sort';
export type MatchQuickFilterId = 'unknown-only' | 'recognized-only' | 'high-confidence' | 'recent';

export interface MatchEvent {
  id: string;
  cameraLabel: string;
  confidence: number;
  snapshotUrl: string;
  subjectName: string | null;
  timestamp: string;
}

export interface MatchActiveFilter {
  id: MatchActiveFilterId;
  label: string;
  value: string;
}

export interface MatchQuickFilter {
  count?: number;
  id: MatchQuickFilterId;
  label: string;
  active: boolean;
}