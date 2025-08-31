import { UPLOAD_URL } from "../config";
import type { ClassifyUploadResponse } from "../types/ClassifyUploadResponse";

async function postUpload(file : File): Promise<ClassifyUploadResponse>{
    const fd = new FormData();
    fd.append("image", file, file.name);
    const r = await fetch(UPLOAD_URL,  {method: "POST", body: fd});
    if(!r.ok) throw new Error(`Upload failed: ${r.status}`);
    return r.json();
}
