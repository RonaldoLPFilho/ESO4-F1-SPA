export interface DataLakeAiReportResponse {
  provider: string;
  model: string;
  usedFallback: boolean;
  generatedAt: string;
  report: string;
  context: Record<string, unknown>;
}
