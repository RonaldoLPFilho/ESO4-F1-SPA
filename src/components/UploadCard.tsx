import { useState } from "react";
import type { ClassifyUploadResponse } from "../types/ClassifyUploadResponse";
import { postUpload } from "../helpers/rest-service";
import { formatPct } from "../helpers/data-helpers";

export function UploadCard(){
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ClassifyUploadResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setResult(null);
        setError(null);
        const f = e.target.files?.[0] || null;
        setFile(f);
    }

    const onSubmit = async () => {
        if(!file) return;
        setLoading(true);
        setError(null);
        try{
            const resp = await postUpload(file);
            setResult(resp);
        } catch (e: any){
            setError(e?.message || String(e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-3xl bg-white/60 backdrop-blur rounded-2xl shadow p-5 border border-slate-200">
            <h2 className="text-xl font-semibold mb-3">Upload de imagem</h2>
            <div className="flex items-center gap-3">
                <input 
                    type="file"
                    accept="image/*"
                    onChange={onChange}
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:opacity-90" 
                />
                <button
                    disabled={!file || loading}
                    onClick={onSubmit}
                    className="px-4 w-full rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
                >
                    {loading ? "Enviando..." : "Classificar"}
                </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {result && (
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-xl bg-slate-50 botrder">Imagem: <span className="font-mono">{result.imageName}</span></div>
                    <div className="p-3 rounded-xl bg-slate-50 botrder">Rotulo: <span className="font-semibold capitalize">{result.predictedLabel}</span></div>
                    <div className="p-3 rounded-xl bg-slate-50 botrder">Confiança: <span className="font-semibold">{formatPct(result.confidence)}</span></div>
                    <div className="p-3 rounded-xl bg-slate-50 botrder">Modelo: <span className="font-mono">{result.modelVersion}</span></div>
                </div>
            )}
        </div>
    );
}