import { useEffect, useState } from "react";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { Card } from "../components/dashboard/Cards";
import { fetchDataLakeStatus, generateDataLakeInsight, rebuildDataLake } from "../helpers/rest-service";
import type { DataLakeInsightResponse } from "../types/DataLakeInsightResponse";
import type { DataLakeRebuildResponse } from "../types/DataLakeRebuildResponse";
import type { DataLakeStatusResponse } from "../types/DataLakeStatusResponse";

type ArtifactRow = {
  label: string;
  description: string;
  metricKey?: string;
  tone?: "default" | "good" | "bad";
};

const ARTIFACTS: ArtifactRow[] = [
  { label: "Bronze", description: "Arquivos brutos preservados para auditoria e reprocessamento.", metricKey: "bronze" },
  { label: "Silver", description: "Dados tratados, normalizados e prontos para análise.", metricKey: "silver", tone: "good" },
  { label: "Gold", description: "Indicadores e contextos usados por dashboard e IA.", metricKey: "gold", tone: "bad" },
  { label: "Resumo por setor", description: "Base para priorização operacional.", metricKey: "sectorSummaries" },
  { label: "Contexto de decisão", description: "Material que alimenta o relatório gerado.", metricKey: "decisionContexts" },
];

function fmtDate(value?: string | null) {
  if (!value) return "Sem registro";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
    </Card>
  );
}

export default function DataLakePage() {
  const [status, setStatus] = useState<DataLakeStatusResponse | null>(null);
  const [rebuild, setRebuild] = useState<DataLakeRebuildResponse | null>(null);
  const [insight, setInsight] = useState<DataLakeInsightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDataLakeStatus();
        if (!cancel) setStatus(data);
      } catch (e: any) {
        if (!cancel) setError(e?.message || String(e));
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, []);

  async function handleRebuild() {
    try {
      setRebuilding(true);
      setError(null);
      const result = await rebuildDataLake();
      setRebuild(result);
      const latestStatus = await fetchDataLakeStatus();
      setStatus(latestStatus);
      await handleGenerateInsight(latestStatus, result);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setRebuilding(false);
    }
  }

  async function handleGenerateInsight(
    currentStatus = status,
    currentRebuild = rebuild
  ) {
    if (!currentStatus) return;
    try {
      setGenerating(true);
      setError(null);
      const report = await generateDataLakeInsight(currentStatus, currentRebuild ?? undefined);
      setInsight(report);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setGenerating(false);
    }
  }

  const counts = status?.fileCounts || {};
  const totalFiles = Object.values(counts).reduce((sum: number, value: number) => sum + value, 0);

  const mainArtifacts = ARTIFACTS.map((artifact) => ({
    ...artifact,
    value: artifact.metricKey ? counts[artifact.metricKey] ?? rebuild?.summary?.[artifact.metricKey] ?? 0 : 0,
  }));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc,_#e2e8f0_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-700">Data Lake</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Camadas, ingestao e inteligencia operacional</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Visualize o estado do lake, dispare o rebuild e gere um relatorio de apoio a decisao com base no contexto consolidado.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fetchDataLakeStatus().then(setStatus).catch((e: any) => setError(e?.message || String(e)))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Atualizar status
            </button>
            <button
              onClick={() => void handleGenerateInsight()}
              disabled={!status || generating}
              className="rounded-xl border border-emerald-700 bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-emerald-800"
            >
              {generating ? "Gerando IA..." : "Gerar relatório IA"}
            </button>
            <button
              onClick={handleRebuild}
              disabled={rebuilding}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-black"
            >
              {rebuilding ? "Executando rebuild..." : "Executar rebuild"}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatTile label="Arquivos totais" value={loading ? "..." : String(totalFiles)} hint="Soma de bronze, silver e gold." />
          <StatTile label="Bronze" value={String(counts.bronze ?? 0)} hint="Camada bruta." />
          <StatTile label="Silver" value={String(counts.silver ?? 0)} hint="Camada tratada." />
          <StatTile label="Gold" value={String(counts.gold ?? 0)} hint="Camada analitica." />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Status do Data Lake</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Root: <span className="font-mono text-slate-800">{status?.root || "..."}</span>
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Ultimo rebuild</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{fmtDate(status?.lastRebuildAt)}</p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Artefato</th>
                      <th className="px-4 py-3">Descricao</th>
                      <th className="px-4 py-3 text-right">Qtd</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mainArtifacts.map((item) => (
                      <tr key={item.label} className="border-t border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{item.label}</td>
                        <td className="px-4 py-3 text-slate-600">{item.description}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-900">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Rebuild e indicadores</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Resultado da ultima consolidacao Bronze para Silver para Gold.
                  </p>
                </div>
                {rebuild && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                    <span className="font-mono">{rebuild.bronzeRecordsExported}</span> registros,{" "}
                    <span className="font-mono">{rebuild.goldFilesWritten}</span> arquivos gold
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Bronze exportado</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{rebuild?.bronzeRecordsExported ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Silver escritos</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{rebuild?.silverFilesWritten ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Gold escritos</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{rebuild?.goldFilesWritten ?? 0}</p>
                </div>
              </div>

              {rebuild?.summary && (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Resumo de consolidacao</p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Object.entries(rebuild.summary as Record<string, number>).map(([key, value]: [string, number]) => (
                    <div key={key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <span className="text-sm text-slate-600">{key}</span>
                      <span className="font-mono text-sm text-slate-900">{String(value)}</span>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">IA generativa</h2>
                  <p className="mt-1 text-sm text-slate-600">Relatorio produzido a partir do contexto consolidado.</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${insight?.provider === "openai" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {insight?.provider === "openai" ? "OpenAI" : "Local"}
                </span>
              </div>

              {!insight ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                  Execute o rebuild ou clique em "Gerar relatório IA" para produzir a leitura executiva.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Risco</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{insight.riskLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{insight.executiveSummary}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Achados</p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      {insight.findings.map((item: string) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Recomendacoes</p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      {insight.recommendations.map((item: string) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Proxima acao</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{insight.nextAction}</p>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Conteudo do relatorio IA</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Renderizacao completa em Markdown da analise devolvida pela IA.
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  Markdown
                </span>
              </div>

              {!insight?.markdown ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                  Gere um relatório IA para visualizar aqui o conteúdo completo da análise.
                </div>
              ) : (
                <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <MarkdownRenderer content={insight.markdown} />
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900">Arquivos principais</h2>
              <p className="mt-1 text-sm text-slate-600">Mapa mental dos artefatos que a pagina representa.</p>
              <div className="mt-4 space-y-3">
                {[
                  "bronze/classifications",
                  "bronze/alerts",
                  "bronze/sensors",
                  "bronze/weather",
                  "silver/classifications_clean",
                  "silver/alerts_clean",
                  "gold/health_indicators",
                  "gold/sector_risk_summary",
                  "gold/ai_reports_context",
                ].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <span className="font-mono text-sm text-slate-700">{item}</span>
                    <span className="text-xs text-slate-500">ativo</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
