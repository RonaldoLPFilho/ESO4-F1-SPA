export interface AlertEvent {
  id: string;
  triggeredAt: string;
  sickCount?: number | null;
  windowMinutes?: number | null;
  thresholdSick?: number | null;
  channel: "EMAIL" | "SMS";
  status: "SENT" | "FAILED";
  errorMessage?: string | null;
  }