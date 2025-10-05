import { useEffect, useMemo, useState } from "react";
import type { RangeKey } from "../types/RangeKey";
import type { OverviewResponse } from "../types/OverviewResponse";
import { fetchOverview, fetchOverviewYear } from "../helpers/rest-service";
import { GREEN, RED } from "../config";
import { StatCard } from "../components/dashboard/TrendIcon";
import { badge, cap, fmtInt, fmtPct } from "../helpers/dash-helpers";
import { Tabs } from "../components/dashboard/Tabs";
import { Card } from "../components/dashboard/Cards";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Dashboard(){
    const [range, setRange] = useState<RangeKey>("today");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [data, setData] = useState<OverviewResponse | null>(null);
    const [yearData, setYearData] = useState<OverviewResponse | null>(null); 
    const [tab, setTab] = useState("charts");

    useEffect(() => {
        let cancel = false;
        async function load() {
        try {
        setLoading(true); setErr(null);
        const [d, y] = await Promise.all([fetchOverview(range), fetchOverviewYear()]);
        if (!cancel) { setData(d); setYearData(y); }
        } catch (e: any) {
        if (!cancel) setErr(e?.message || String(e));
        } finally {
        if (!cancel) setLoading(false);
        }
        }
        load();
        return () => { cancel = true; };
        }, [range]
    );

    const totals = data?.totals;
    const pieData = useMemo(() => (
    totals ? [
    { name: "Saudáveis", value: totals.healthy, color: GREEN },
    { name: "Doentes", value: totals.sick, color: RED },
    ] : []
    ), [totals]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-slate-200">
           <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold">AgriScan Dashboard</h1>
                <p className="text-sm text-slate-600">Análise de Saúde de Alimentos</p>
            </div>
            <div className="flex gap-2">
                {(["today","week","month","year"] as RangeKey[]).map(k => (
                    <button
                    key={k}
                    onClick={() => setRange(k)}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition ${range===k?"bg-emerald-600 text-white border-emerald-600":"bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                    >
                        {k==="today"?"Hoje":k==="week"?"Semana":k==="month"?"Mês":"Ano"}
                    </button>
            ))}
            </div>
            </header>
                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatCard title="Total de Imagens" value={fmtInt(totals?.total)} subtitle="Análises realizadas" tone="default" />
                    <StatCard title="Alimentos Saudáveis" value={fmtInt(totals?.healthy)} subtitle={`${fmtPct(totals?.healthRate)} do total`} tone="good" delta={data?.trends?.healthyDelta} />
                    <StatCard title="Alimentos Doentes" value={fmtInt(totals?.sick)} subtitle={`${fmtPct(totals && totals.sick / Math.max(1, totals.total))} do total`} tone="bad" delta={data?.trends?.sickDelta} />
                    <StatCard title="Taxa de Saúde" value={fmtPct(totals?.healthRate)} subtitle="Alimentos em bom estado" tone="good" />
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between mb-4">
                    <Tabs tab={tab} onTab={setTab} />
                    {loading && <span className="text-sm text-slate-500">Carregando…</span>}
                    {err && <span className="text-sm text-rose-600">{err}</span>}
                </div>

                {/* Panels */}
                {tab === "charts" && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                        {/* Pie */}
                        <Card className="p-5">
                            <h3 className="text-xl font-semibold mb-1">Distribuição Geral</h3>
                            <p className="text-sm text-slate-600 mb-4">Proporção de alimentos saudáveis vs. doentes</p>
                            <div className="w-full h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip formatter={(v: any, n: any) => [`${v}`, n]} contentStyle={{ borderRadius: 12 }} />
                                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                                            {pieData.map((e, i) => (
                                                <Cell key={i} fill={e.color} />
                                            ))}
                                        </Pie>
                                        <Legend verticalAlign="bottom" height={24} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="p-5">
                            <h3 className="text-xl font-semibold mb-1">Análise por Tipo de Alimento</h3>
                            <p className="text-sm text-slate-600 mb-4">Comparação de saúde entre diferentes culturas</p>
                            <div className="w-full h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={(data?.byFood || []).map(x => ({ food: cap(x.food), Saudaveis: x.healthy, Doentes: x.sick }))}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="food" />
                                        <YAxis />
                                        <Tooltip formatter={(v: any, n: any) => [fmtInt(v as number), n]} contentStyle={{ borderRadius: 12 }} />
                                        <Legend />
                                        <Bar dataKey="Saudaveis" fill={GREEN} radius={[6,6,0,0]} />
                                        <Bar dataKey="Doentes" fill={RED} radius={[6,6,0,0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                )}

                    {tab === "timeline" && (
                        <Card className="p-5">
                            <h3 className="text-xl font-semibold mb-1">Evolução Temporal</h3>
                            <p className="text-sm text-slate-600 mb-4">Acompanhamento da saúde dos alimentos ao longo do ano</p>
                                <div className="w-full h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={(yearData?.timeSeries || []).map(p => ({
                                            name: p.date, Saudaveis: p.healthy, Doentes: p.sick
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip formatter={(v: any, n: any) => [fmtInt(v as number), n]} contentStyle={{ borderRadius: 12 }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="Saudaveis" stroke={GREEN} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                                            <Line type="monotone" dataKey="Doentes" stroke={RED} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                        </Card>
                    )}

                    {tab === "recent" && (
                        <Card className="p-5">
                            <h3 className="text-xl font-semibold mb-1">Últimas Análises</h3>
                            <p className="text-sm text-slate-600 mb-4">Histórico das análises mais recentes</p>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left bg-slate-100">
                                        <th className="px-3 py-2">Alimento</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Confiança</th>
                                        <th className="px-3 py-2">Imagem</th>
                                        <th className="px-3 py-2">Data/Hora</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(data?.last || []).map((r, i) => (
                                            <tr key={r.timestamp+"-"+i} className="border-b hover:bg-slate-50">
                                                <td className="px-3 py-2">{cap(r.food)}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${badge(r.predictedLabel)}`}>
                                                            {cap(r.predictedLabel)}
                                                        </span>
                                                    </td>
                                                <td className="px-3 py-2">{(r.confidence*100).toFixed(0)}%</td>
                                                <td className="px-3 py-2 font-mono text-xs truncate max-w-[160px]" title={r.imageName}>{r.imageName}</td>
                                                <td className="px-3 py-2 font-mono text-xs">{new Date(r.timestamp).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                    <footer className="text-center gap-2 mt-5 bg-white/60 border rounded-xl px-3 py-1">FIAP • ESO4 Fase-1</footer>
                    {/* <footer className="text-center text-xs text-slate-500 mt-8">© AgriScan — PoC acadêmica</footer> */}
            </div> 
        </div>
    );
}