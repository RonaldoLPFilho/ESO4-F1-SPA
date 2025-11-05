export interface AlertConfig {
  id?: string;
  windowMinutes: number;
  thresholdSick: number;
  cooldownMinutes: number;
  active: boolean;
  lastTriggeredAt?: string | null;
  }