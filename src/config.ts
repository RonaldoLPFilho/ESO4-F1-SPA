// src/config.ts

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";


export const UPLOAD_URL     = `${API_BASE}/classify/upload`;
export const WEBCAM_URL     = `${API_BASE}/classify/webcam-frame`;
export const EXPORT_CSV_URL = `${API_BASE}/exports/results.csv`;
export const EXPORT_JSON_URL= `${API_BASE}/exports/results.json`;
export const SUMMARY_URL    = `${API_BASE}/reports/summary`;
export const DASHBOARD_URL = `${API_BASE}/dashboard/overview`;
export const DATALAKE_STATUS_URL = `${API_BASE}/datalake/status`;
export const DATALAKE_SUMMARY_URL = `${API_BASE}/datalake/summary`;
export const DATALAKE_REBUILD_URL = `${API_BASE}/datalake/rebuild`;
export const DATALAKE_AI_REPORT_URL = `${API_BASE}/datalake/ai/report`;
export const IOT_SNAPSHOT_URL = `${API_BASE}/iot/snapshot`;
export const IOT_AUTOMATIONS_URL = `${API_BASE}/iot/automations`;

export const GREEN = "#22c55e"; // emerald-500
export const RED = "#ef4444"; // red-500
