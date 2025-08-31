import { useEffect, useState } from "react";
import type { SummaryResponse } from "../types/SummaryResponse";
import { formatPct } from "../helpers/data-helpers";
import { getSummary } from "../helpers/rest-service";
import { EXPORT_CSV_URL, EXPORT_JSON_URL } from "../config";

export function SummaryCard() {
  const [sum, setSum] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      setSum(await getSummary());
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = sum?.countsByLabel || {};

  return (
    <div className="w-full max-w-4xl bg-white/60 backdrop-blur rounded-2xl shadow p-5 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Relatório</h2>
        <div className="flex gap-3">
          <a
            href={EXPORT_CSV_URL}
            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm"
          >
            Baixar CSV
          </a>
          <a
            href={EXPORT_JSON_URL}
            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm"
          >
            Baixar JSON
          </a>
          <button
            onClick={load}
            className="px-3 py-2 rounded-xl bg-slate-200 text-slate-900 text-sm"
          >
            Atualizar
          </button>
        </div>
      </div>

      {loading && <p className="text-sm">Carregando…</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      {sum && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border">
            <p className="text-sm text-slate-600">Média de confiança</p>
            <p className="text-2xl font-semibold">
              {formatPct(sum.avgConfidence)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border">
            <p className="text-sm text-slate-600">Contagem por rótulo</p>
            <ul className="mt-2 space-y-1 text-sm">
              {Object.keys(counts).length === 0 && (
                <li className="text-slate-500">—</li>
              )}
              {Object.entries(counts).map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <span className="capitalize">{k}</span>
                  <span className="font-medium">{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border">
            <p className="text-sm text-slate-600">Métricas do modelo</p>
            {!sum.metrics ? (
              <p className="text-sm text-slate-500">—</p>
            ) : (
              <ul className="mt-2 text-sm">
                <li>
                  Versão:{" "}
                  <span className="font-mono">
                    {sum.metrics.modelVersion ?? "—"}
                  </span>
                </li>
                <li>
                  Accuracy:{" "}
                  <span className="font-medium">
                    {formatPct(sum.metrics.accuracy)}
                  </span>
                </li>
                <li>
                  Precision:{" "}
                  <span className="font-medium">
                    {formatPct(sum.metrics.precision)}
                  </span>
                </li>
                <li>
                  Recall:{" "}
                  <span className="font-medium">
                    {formatPct(sum.metrics.recall)}
                  </span>
                </li>
                <li>
                  F1:{" "}
                  <span className="font-medium">
                    {formatPct(sum.metrics.f1)}
                  </span>
                </li>
              </ul>
            )}
          </div>
        </div>
      )}

      {sum?.last?.length ? (
        <div className="mt-5">
          <h3 className="font-medium mb-2">Últimos resultados</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left bg-slate-100">
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">Imagem</th>
                  <th className="px-3 py-2">Fonte</th>
                  <th className="px-3 py-2">Rótulo</th>
                  <th className="px-3 py-2">Confiança</th>
                  <th className="px-3 py-2">Modelo</th>
                  <th className="px-3 py-2">RequestId</th>
                </tr>
              </thead>
              <tbody>
                {sum.last.map((r) => (
                  <tr
                    key={`${r.requestId}-${r.timestamp}`}
                    className="border-b"
                  >
                    <td className="px-3 py-2 font-mono">{r.timestamp}</td>
                    <td className="px-3 py-2">{r.imageName}</td>
                    <td className="px-3 py-2 font-mono">{r.source}</td>
                    <td className="px-3 py-2 capitalize">{r.predictedLabel}</td>
                    <td className="px-3 py-2">
                      {(r.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 font-mono">{r.modelVersion}</td>
                    <td className="px-3 py-2 font-mono">{r.requestId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
