import {
  DASHBOARD_URL,
  DATALAKE_AI_REPORT_URL,
  DATALAKE_REBUILD_URL,
  DATALAKE_STATUS_URL,
  DATALAKE_SUMMARY_URL,
  IOT_AUTOMATIONS_URL,
  IOT_SNAPSHOT_URL,
  SUMMARY_URL,
  UPLOAD_URL,
  WEBCAM_URL,
} from "../config";
import type { ClassifyUploadResponse } from "../types/ClassifyUploadResponse";
import type { ClassifyWebcamResponse } from "../types/ClassifyWebcamResponse";
import type { DataLakeAiReportRequest } from "../types/DataLakeAiReportRequest";
import type { DataLakeAiReportResponse } from "../types/DataLakeAiReportResponse";
import type { DataLakeInsightResponse } from "../types/DataLakeInsightResponse";
import type { DataLakeRebuildResponse } from "../types/DataLakeRebuildResponse";
import type { DataLakeStatusResponse } from "../types/DataLakeStatusResponse";
import type { DataLakeSummaryResponse } from "../types/DataLakeSummaryResponse";
import type { OverviewResponse } from "../types/OverviewResponse";
import type { RangeKey } from "../types/RangeKey";
import type { SummaryResponse } from "../types/SummaryResponse";
import type {
  AutomationRule,
  AutomationRuleRequest,
  IotSnapshot,
} from "../types/iot/IotSnapshot";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function postUpload(file : File): Promise<ClassifyUploadResponse>{
    const fd = new FormData();
    fd.append("image", file, file.name);
    return fetchJson(UPLOAD_URL, { method: "POST", body: fd });
}

export async function postWebcamFrame(base64: string, fileName = "frame.jpg"): Promise<ClassifyWebcamResponse>{
    return fetchJson<ClassifyWebcamResponse>(WEBCAM_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({imageBase64: base64, fileName})
    });
}

export async function getSummary(): Promise<SummaryResponse> {
    return fetchJson(SUMMARY_URL);
}

export async function fetchOverview(range: RangeKey, tz = "America/Sao_Paulo"): Promise<OverviewResponse> {
    const url = new URL(DASHBOARD_URL);
    url.searchParams.set("range", range);
    url.searchParams.set("tz", tz);
    return fetchJson(url.toString());
}

export async function fetchOverviewYear(tz = "America/Sao_Paulo"): Promise<OverviewResponse> {
    const url = new URL(DASHBOARD_URL);
    url.searchParams.set("range", "year");
    url.searchParams.set("tz", tz);
    return fetchJson(url.toString());
}

export async function fetchDataLakeStatus(): Promise<DataLakeStatusResponse> {
  return fetchJson(DATALAKE_STATUS_URL);
}

export async function fetchIotSnapshot(): Promise<IotSnapshot> {
  return fetchJson(IOT_SNAPSHOT_URL);
}

export async function createIotAutomation(
  payload: AutomationRuleRequest
): Promise<AutomationRule> {
  return fetchJson(IOT_AUTOMATIONS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteIotAutomation(id: string): Promise<void> {
  await fetchJson(`${IOT_AUTOMATIONS_URL}/${id}`, { method: "DELETE" });
}

export async function fetchDataLakeSummary(date?: string): Promise<DataLakeSummaryResponse> {
  const url = new URL(DATALAKE_SUMMARY_URL);
  if (date) {
    url.searchParams.set("date", date);
  }
  return fetchJson(url.toString());
}

export async function rebuildDataLake(): Promise<DataLakeRebuildResponse> {
  return fetchJson(DATALAKE_REBUILD_URL, { method: "POST" });
}

function buildLocalInsight(
  status: DataLakeStatusResponse,
  rebuild?: DataLakeRebuildResponse | null
): DataLakeInsightResponse {
  const bronze = status.fileCounts?.bronze ?? 0;
  const silver = status.fileCounts?.silver ?? 0;
  const gold = status.fileCounts?.gold ?? 0;
  const riskLevel =
    (rebuild?.summary?.decisionContexts ?? 0) >= 2 || gold > 0 ? "alto" : bronze > 0 ? "medio" : "baixo";

  return {
    title: "Relatorio AgroSmart do Data Lake",
    riskLevel,
    executiveSummary: `O Data Lake apresenta ${bronze} arquivos na camada bronze, ${silver} na silver e ${gold} na gold. O ultimo rebuild foi ${status.lastRebuildAt ?? "ainda nao executado"}.`,
    findings: [
      `Camada bronze com ${bronze} arquivos recebidos.`,
      `Camada silver com ${silver} arquivos normalizados.`,
      `Camada gold com ${gold} artefatos analiticos.`,
      rebuild ? `Rebuild processou ${rebuild.bronzeRecordsExported} registros e gerou ${rebuild.goldFilesWritten} arquivos gold.` : "Rebuild ainda nao executado nesta sessao.",
    ],
    recommendations: [
      "Executar rebuild apos novas ingestões para manter a camada gold atualizada.",
      "Priorizar a leitura do resumo de risco por setor antes de acionar alertas operacionais.",
      "Validar se os arquivos de sensores e clima continuam chegando com a periodicidade esperada.",
    ],
    nextAction: "Revisar os setores com risco alto e cruzar com o historico de alertas antes da proxima rodada de coleta.",
    sourceSummary: JSON.stringify({ status, rebuild }, null, 2),
    provider: "local-fallback",
    markdown: `# Resumo Executivo

O Data Lake apresenta **${bronze}** arquivos na camada bronze, **${silver}** na silver e **${gold}** na gold. O ultimo rebuild foi ${status.lastRebuildAt ?? "ainda nao executado"}.

# Evidencias Observadas
- Camada bronze com ${bronze} arquivos recebidos.
- Camada silver com ${silver} arquivos normalizados.
- Camada gold com ${gold} artefatos analiticos.
- ${rebuild ? `Rebuild processou ${rebuild.bronzeRecordsExported} registros e gerou ${rebuild.goldFilesWritten} arquivos gold.` : "Rebuild ainda nao executado nesta sessao."}

# Recomendacoes
- Executar rebuild apos novas ingestoes para manter a camada gold atualizada.
- Priorizar a leitura do resumo de risco por setor antes de acionar alertas operacionais.
- Validar se os arquivos de sensores e clima continuam chegando com a periodicidade esperada.

# Prioridade Final
Revisar os setores com risco alto e cruzar com o historico de alertas antes da proxima rodada de coleta.`,
  };
}

function buildReportFromGateway(
  report: DataLakeAiReportResponse
): DataLakeInsightResponse {
  const summary = report.summary;
  const topSector = summary.sectorSummaries?.[0];
  const firstHealth = summary.healthIndicators?.[0];
  const riskLevel = topSector?.riskLevel ?? (firstHealth && firstHealth.sickRate >= 0.2 ? "alto" : "medio");
  const lines = report.reportMarkdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const summaryLine = lines.find((line) => !line.startsWith("#")) ?? report.reportMarkdown;

  return {
    title: "Relatorio AgroSmart do Data Lake",
    riskLevel,
    executiveSummary: summaryLine,
    findings: [
      `Dataset consolidado em ${summary.latestDate}.`,
      `Setores disponiveis: ${summary.availableSectors.join(", ") || "nenhum"}.`,
      topSector
        ? `Setor mais recente: ${topSector.sector} com risco ${topSector.riskLevel} e score ${topSector.riskScore.toFixed(2)}.`
        : "Nenhum resumo por setor encontrado na camada gold.",
      firstHealth
        ? `Cultura em destaque: ${firstHealth.crop} com ${firstHealth.sickCount} registros doentes em ${firstHealth.totalImages}.`
        : "Nenhum indicador de saude encontrado."
    ],
    recommendations: [
      "Priorizar inspeção no setor com maior risco consolidado.",
      "Reexecutar ingestão e rebuild sempre que chegarem novas leituras de sensores.",
      "Usar o relatório gerado como insumo para o time de operação e agronomia."
    ],
    nextAction: `Revisar o relatório salvo em ${report.savedPath}.`,
    sourceSummary: JSON.stringify({ summary, report }, null, 2),
    provider: "openai",
    markdown: report.reportMarkdown,
  };
}

export async function generateDataLakeInsight(
  status: DataLakeStatusResponse,
  rebuild?: DataLakeRebuildResponse | null
): Promise<DataLakeInsightResponse> {
  try {
    const summary = await fetchDataLakeSummary();
    const payload: DataLakeAiReportRequest = {
      date: summary.latestDate,
      sector: summary.availableSectors[0] ?? null,
      crop: summary.healthIndicators[0]?.crop ?? null,
      tone: "executivo",
    };
    const report = await fetchJson<DataLakeAiReportResponse>(DATALAKE_AI_REPORT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return buildReportFromGateway(report);
  } catch {
    return buildLocalInsight(status, rebuild);
  }
}
