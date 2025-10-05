import { DASHBOARD_URL, SUMMARY_URL, UPLOAD_URL, WEBCAM_URL } from "../config";
import type { ClassifyUploadResponse } from "../types/ClassifyUploadResponse";
import type { OverviewResponse } from "../types/OverviewResponse";
import type { RangeKey } from "../types/RangeKey";
import type { SummaryResponse } from "../types/SummaryResponse";

export async function postUpload(file : File): Promise<ClassifyUploadResponse>{
    const fd = new FormData();
    fd.append("image", file, file.name);
    const r = await fetch(UPLOAD_URL,  {method: "POST", body: fd});
    if(!r.ok) throw new Error(`Upload failed: ${r.status}`);
    return r.json();
}

export async function postWebcamFrame(base64: string, fileName = "frame.jpg"){
    const r = await fetch(WEBCAM_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({imageBase64: base64, fileName})
    });
    if (!r.ok) throw new Error(`Webcam frame failed: ${r.status}`);

    return r.json();
}

export async function getSummary(): Promise<SummaryResponse> {
    const r = await fetch(SUMMARY_URL);
    if(!r.ok) throw new Error(`Get Summary failed ${r.status}`);
    return r.json();
}

export async function fetchOverview(range: RangeKey, tz = "America/Sao_Paulo"): Promise<OverviewResponse> {
    const url = new URL(DASHBOARD_URL);
    url.searchParams.set("range", range);
    url.searchParams.set("tz", tz);
    const r = await fetch(url.toString());
    if (!r.ok) throw new Error(`Erro ${r.status}`);
    return r.json();
}

export async function fetchOverviewYear(tz = "America/Sao_Paulo"): Promise<OverviewResponse> {
    const url = new URL(DASHBOARD_URL);
    url.searchParams.set("range", "year");
    url.searchParams.set("tz", tz);
    const r = await fetch(url.toString());
    if (!r.ok) throw new Error(`Erro ${r.status}`);
    return r.json();
}

