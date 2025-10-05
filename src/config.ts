// src/config.ts

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";


export const UPLOAD_URL     = `${API_BASE}/classify/upload`;
export const WEBCAM_URL     = `${API_BASE}/classify/webcam-frame`;
export const EXPORT_CSV_URL = `${API_BASE}/exports/results.csv`;
export const EXPORT_JSON_URL= `${API_BASE}/exports/results.json`;
export const SUMMARY_URL    = `${API_BASE}/reports/summary`;
export const DASHBOARD_URL = `${API_BASE}/dashboard/overview`;

export const GREEN = "#22c55e"; // emerald-500
export const RED = "#ef4444"; // red-500