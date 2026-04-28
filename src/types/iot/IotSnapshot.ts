export type SensorKey =
  | "temperature"
  | "humidity"
  | "soilMoisture"
  | "luminosity"
  | "ph";

export type AutomationOperator = ">" | ">=" | "<" | "<=";

export type SensorSnapshot = {
  tick: number;
  sector: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  luminosity: number;
  ph: number;
};

export type DeviceStatus = {
  id: string;
  name: string;
  status: "ON" | "OFF";
  reason: string;
};

export type AutomationRule = {
  id: string;
  name: string;
  sensor: SensorKey;
  operator: AutomationOperator;
  threshold: number;
  device: string;
  action: string;
  active: boolean;
};

export type AutomationEvent = {
  id: string;
  triggeredAt: string;
  automationId: string;
  automationName: string;
  action: string;
  currentValue: number;
  operator: AutomationOperator;
  threshold: number;
};

export type AutomationRuleRequest = {
  name: string;
  sensor: SensorKey;
  operator: AutomationOperator;
  threshold: number;
  device: string;
  action: string;
};

export type IotSnapshot = {
  generatedAt: string;
  sensors: SensorSnapshot;
  greenhouses: SensorSnapshot[];
  devices: DeviceStatus[];
  automations: AutomationRule[];
  events: AutomationEvent[];
};
