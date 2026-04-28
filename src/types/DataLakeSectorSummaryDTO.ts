export type DataLakeSectorSummaryDTO = {
  date: string;
  sector: string;
  cropFocus: string;
  farmId: string;
  totalImages: number;
  sickCount: number;
  healthyCount: number;
  sickRate: number;
  avgTemperatureC: number;
  avgHumidityPct: number;
  avgSoilMoisture: number;
  weatherRainProbability: number;
  alertsTriggered: number;
  riskScore: number;
  riskLevel: "baixo" | "medio" | "alto" | string;
};
