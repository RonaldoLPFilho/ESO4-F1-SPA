export interface DataLakeStatusResponse {
  root: string;
  fileCounts: Record<string, number>;
  lastRebuildAt: string | null;
}
