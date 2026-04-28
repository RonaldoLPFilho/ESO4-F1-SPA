import type { DataLakeSummaryResponse } from "./DataLakeSummaryResponse";

export type DataLakeAiReportResponse = {
  status: string;
  model: string;
  generatedAt: string;
  savedPath: string;
  reportMarkdown: string;
  summary: DataLakeSummaryResponse;
};
