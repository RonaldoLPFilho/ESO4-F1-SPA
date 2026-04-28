export type DataLakeStatusResponse = {
  root: string;
  fileCounts: Record<string, number>;
  lastRebuildAt: string | null;
};
