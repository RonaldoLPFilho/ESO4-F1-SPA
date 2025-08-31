import { useEffect, useRef, useState } from "react";
import type { ClassifyWebcamResponse } from "../types/ClassifyWebcamResponse";
import { postWebcamFrame } from "../helpers/rest-service";
import { formatPct } from "../helpers/data-helpers";

export function WebcamCard(){
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [streaming, setStreaming] = useState(false);
    const [fps, setFps] = useState(3);
    const [inFlight, setInFlight] = useState(false);
    const [res, setRes] = useState<ClassifyWebcamResponse | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            stopStreaming();
        }
    }, [])

    async function startStreaming(){
        setErr(null);
        try{
            const media = await navigator.mediaDevices.getUserMedia({ video: {width: 640, height: 480} });
            if(videoRef.current){
                videoRef.current.srcObject = media as any;
                await videoRef.current.play();
                setStreaming(true);
                loop();
            }
        } catch (e: any){
            setErr(e?.message || String(e));
        }
    }

    async function stopStreaming(){
        setStreaming(false);
        if(timerRef.current){
            window.clearInterval(timerRef.current);
            timerRef.current = null
        }
        const stream = (videoRef.current?.srcObject as MediaStream | undefined);
        stream?.getTracks().forEach(t => t.stop());
        if(videoRef.current) videoRef.current.srcObject = null;
    }

    function loop(){
        if(timerRef.current) window.clearInterval(timerRef.current);
        const interval = Math.max(200, Math.floor(100 / Math.max(1, fps)));
        timerRef.current = window.setInterval(captureAndSend, interval);
    }

    async function captureAndSend(){
        if(inFlight || !streaming) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if(!video || !canvas) return;

        const W = 320, H = 240;
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext("2d");
        if(!ctx) return;
        ctx.drawImage(video, 0, 0, W, H);
        const dataUrl = canvas.toDataURL("image/jpg", 0.6);
        const base64 = dataUrl.split(",")[1];

        try{
            setInFlight(true);
            const r = await postWebcamFrame(base64, "frame.jpg");
            setRes(r);
        }catch (e: any){
            setErr(e?.message || String(e));
        }finally{
            setInFlight(false);
        }
    }

    return (
        <div className="w-full max-w-3xl bg-white/60 backdrop-blur rounded-2xl shadow p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Webcam ao vivo</h2>
                <div className="flex items-center gap-3">
                    <input 
                        id="range"
                        type="range" 
                        min={1}
                        max={8}
                        value={fps}
                        onChange={e => {setFps(Number(e.target.value)); if(streaming) loop(); }}
                    />
                    
                    {!streaming ? (
                        <button onClick={startStreaming} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium">
                            Iniciar
                        </button>
                    ) : (
                        <button onClick={stopStreaming} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium">
                            Parar
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[auto, 1fr] gap-4">
                <div className="m-auto">
                    <video ref={videoRef} className="rounded-xl border w-[320px] h-[240px] bg-black" muted playsInline />
                    <canvas ref={canvasRef} className="hidden" />
                    {err && <p className="text-sm text-red-600">{err}</p>}
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border w-full">
                    <h3 className="font-medium mb-2">Resultado(Tempo real)</h3>
                    {!res ? (
                        <p className="text-sm text-slate-600">Aguardando...</p>
                    ) : (
                        <div className="grid grid:cols-2 gap-3 text-sm">
                            <div className="p-3 rounded-xl bg-white border">Rótulo: <span className="font-semibold capitalize">{res.predictedLabel}</span></div>
                            <div className="p-3 rounded-xl bg-white border">Confiança: <span className="font-semibold">{formatPct(res.confidence)}</span></div>
                            <div className="p-3 rounded-xl bg-white border">Modelo: <span className="font-mono">{res.modelVersion}</span></div>
                            <div className="p-3 rounded-xl bg-white border">Fonte: <span className="font-mono">{res.source}</span></div>
                        </div>
                    )}
                    <p className="mt-2 text-xs text-slate-500">Status: {inFlight ? "Enviando frame :)" : streaming ? "rodando" : "parado"}</p>
                </div>
            </div>
        </div>
    )
}