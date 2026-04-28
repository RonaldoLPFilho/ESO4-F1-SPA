export interface DataLakeOverviewItem extends Record<string, unknown> {}

export interface DataLakeOverviewResponse {
  root: string;
  lastRebuildAt: string | null;
  fileCounts: Record<string, number>;
  healthIndicators: DataLakeOverviewItem[];
  sectorRiskSummary: DataLakeOverviewItem[];
  aiContexts: DataLakeOverviewItem[];
}
