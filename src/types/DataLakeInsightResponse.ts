export type DataLakeInsightResponse = {
  title: string;
  riskLevel: "baixo" | "medio" | "alto" | string;
  executiveSummary: string;
  findings: string[];
  recommendations: string[];
  nextAction: string;
  sourceSummary: string;
  provider: string;
  markdown: string;
};
