import type { DataLakeHealthIndicatorDTO } from "./DataLakeHealthIndicatorDTO";
import type { DataLakeSectorSummaryDTO } from "./DataLakeSectorSummaryDTO";

export type DataLakeSummaryResponse = {
  root: string;
  latestDate: string;
  lastRebuildAt: string | null;
  fileCounts: Record<string, number>;
  availableDates: string[];
  availableSectors: string[];
  healthIndicators: DataLakeHealthIndicatorDTO[];
  sectorSummaries: DataLakeSectorSummaryDTO[];
  latestContext: Record<string, unknown>;
};
