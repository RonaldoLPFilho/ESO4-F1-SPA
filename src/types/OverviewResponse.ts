type PeriodDTO = { from: string; to: string };
type TotalsDTO = { total: number; healthy: number; sick: number; unknown: number; healthRate: number };
type TrendsDTO = { healthyDelta: number; sickDelta: number };
type FoodBucketDTO = { food: string; healthy: number; sick: number; rate: number };
type TimePointDTO = { date: string; healthy: number; sick: number; total: number };
type LastItemDTO = { timestamp: string; imageName: string; food: string | null; predictedLabel: string; confidence: number };


export type OverviewResponse = {
period: PeriodDTO;
totals: TotalsDTO;
trends: TrendsDTO;
byFood: FoodBucketDTO[];
timeSeries: TimePointDTO[];
last: LastItemDTO[];
};