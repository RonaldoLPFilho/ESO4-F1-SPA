export type DataLakeHealthIndicatorDTO = {
  date: string;
  crop: string;
  totalImages: number;
  healthyCount: number;
  sickCount: number;
  sickRate: number;
  avgConfidence: number;
};
