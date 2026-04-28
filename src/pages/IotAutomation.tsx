import { useEffect, useState } from "react";
import {
  Activity,
  Droplets,
  Fan,
  Lightbulb,
  Plus,
  Power,
  RefreshCw,
  Sprout,
  ThermometerSun,
  Trash2,
  Waves,
} from "lucide-react";
import {
  createIotAutomation,
  deleteIotAutomation,
  fetchIotSnapshot,
} from "../helpers/rest-service";
import type {
  AutomationOperator,
  AutomationRuleRequest,
  IotSnapshot,
  SensorSnapshot,
  SensorKey,
} from "../types/iot/IotSnapshot";

const sensorLabel: Record<SensorKey, string> = {
  temperature: "Temperatura",
  humidity: "Umidade do ar",
  soilMoisture: "Umidade do solo",
  luminosity: "Luminosidade",
  ph: "pH do solo",
};

const sensorUnit: Record<SensorKey, string> = {
  temperature: "C",
  humidity: "%",
  soilMoisture: "%",
  luminosity: "lux",
  ph: "",
};

const deviceLabel: Record<string, string> = {
  climatizer: "Climatizador",
  humidifier: "Umidificador",
  irrigation: "Irrigacao",
  shade: "Sombrites",
  growLight: "Luz artificial",
};

const deviceAction: Record<string, string> = {
  climatizer: "Ativar climatizador",
  humidifier: "Ativar umidificador",
  irrigation: "Ligar irrigacao",
  shade: "Fechar sombrites",
  growLight: "Ligar luz artificial",
};

const initialForm: AutomationRuleRequest = {
  name: "Nova regra da estufa",
  sensor: "temperature",
  operator: ">",
  threshold: 25,
  device: "climatizer",
  action: "Ativar climatizador",
};

function fmt(value: number, key: SensorKey) {
  const unit = sensorUnit[key];
  return `${value.toFixed(key === "luminosity" ? 0 : 1)}${unit ? ` ${unit}` : ""}`;
}

function readSensor(sensors: SensorSnapshot, key: SensorKey) {
  return sensors[key];
}

function sensorTone(key: SensorKey, value: number) {
  if (key === "temperature" && value > 25) return "border-amber-300 bg-amber-50";
  if (key === "humidity" && value < 50) return "border-sky-300 bg-sky-50";
  if (key === "soilMoisture" && value < 35) return "border-emerald-300 bg-emerald-50";
  if (key === "luminosity" && value > 850) return "border-violet-300 bg-violet-50";
  return "border-slate-200 bg-white";
}

function iconForSensor(key: SensorKey) {
  if (key === "temperature") return ThermometerSun;
  if (key === "humidity") return Droplets;
  if (key === "soilMoisture") return Sprout;
  if (key === "luminosity") return Lightbulb;
  return Waves;
}

export default function IotAutomationPage() {
  const [snapshot, setSnapshot] = useState<IotSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [form, setForm] = useState<AutomationRuleRequest>(initialForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setErr(null);
      const data = await fetchIotSnapshot();
      setSnapshot(data);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(load, 2500);
    return () => window.clearInterval(id);
  }, [paused]);

  const greenhouses = snapshot?.greenhouses?.length
    ? snapshot.greenhouses
    : snapshot
      ? [snapshot.sensors]
      : [];

  function updateDevice(device: string) {
    setForm((current) => ({
      ...current,
      device,
      action: deviceAction[device] ?? current.action,
    }));
  }

  async function addAutomation() {
    setSaving(true);
    try {
      await createIotAutomation(form);
      setForm(initialForm);
      await load();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  async function removeAutomation(id: string) {
    try {
      await deleteIotAutomation(id);
      await load();
    } catch (e: any) {
      setErr(e?.message || String(e));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-sky-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-emerald-700" />
              <h1 className="text-3xl font-bold text-slate-950">Monitor IoT da Estufa</h1>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Simulação acadêmica de sensores em tempo real e automações agrícolas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border bg-white px-3 py-2 text-sm text-slate-700">
              {snapshot ? `${greenhouses.length} estufas conectadas` : "Carregando estufas"}
            </span>
            <button
              onClick={() => setPaused((value) => !value)}
              className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Power className="h-4 w-4" />
              {paused ? "Retomar tempo real" : "Pausar"}
            </button>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </button>
          </div>
        </header>

        {err && (
          <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {err}
          </div>
        )}

        <section className="mb-6 space-y-3">
          {greenhouses.map((greenhouse) => (
            <div
              key={greenhouse.sector}
              className="grid grid-cols-1 gap-3 rounded-lg border bg-white/70 p-3 shadow-sm lg:grid-cols-[150px_repeat(5,minmax(0,1fr))]"
            >
              <div className="flex min-h-28 flex-col justify-between rounded-md border border-slate-200 bg-slate-950 p-4 text-white">
                <div>
                  <div className="text-xs uppercase tracking-wide text-emerald-200">Fonte de dados</div>
                  <div className="mt-2 text-xl font-semibold">{greenhouse.sector}</div>
                </div>
                <span className="inline-flex w-fit rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-100">
                  online
                </span>
              </div>

              {(["temperature", "humidity", "soilMoisture", "luminosity", "ph"] as SensorKey[]).map((key) => {
                const value = readSensor(greenhouse, key);
                const Icon = iconForSensor(key);
                return (
                  <div key={`${greenhouse.sector}-${key}`} className={`rounded-lg border p-4 shadow-sm ${sensorTone(key, value)}`}>
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-slate-700" />
                      <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">
                        ao vivo
                      </span>
                    </div>
                    <div className="mt-5 text-sm text-slate-600">{sensorLabel[key]}</div>
                    <div className="mt-1 text-3xl font-semibold text-slate-950">{fmt(value, key)}</div>
                  </div>
                );
              })}
            </div>
          ))}
          {loading && <div className="text-sm text-slate-500">Carregando sensores...</div>}
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          {(snapshot?.devices ?? []).map((device) => (
            <div key={device.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-500">{device.name}</div>
                  <div className="mt-1 text-lg font-semibold text-slate-950">{device.reason}</div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    device.status === "ON"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {device.status}
                </span>
              </div>
            </div>
          ))}
        </section>

        <main className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
          <section className="rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Programar Automacao</h2>
            <p className="mt-1 text-sm text-slate-600">
              Monte regras do tipo se sensor atingir um limite, acione um equipamento.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nome da regra</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </label>

              <div className="grid grid-cols-[1fr_88px_120px] gap-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Sensor</span>
                  <select
                    value={form.sensor}
                    onChange={(e) => setForm((current) => ({ ...current, sensor: e.target.value as SensorKey }))}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  >
                    {(Object.keys(sensorLabel) as SensorKey[]).map((key) => (
                      <option key={key} value={key}>{sensorLabel[key]}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Op.</span>
                  <select
                    value={form.operator}
                    onChange={(e) => setForm((current) => ({ ...current, operator: e.target.value as AutomationOperator }))}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value=">">&gt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Limite</span>
                  <input
                    type="number"
                    value={form.threshold}
                    onChange={(e) => setForm((current) => ({ ...current, threshold: Number(e.target.value) }))}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Equipamento</span>
                <select
                  value={form.device}
                  onChange={(e) => updateDevice(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  {Object.entries(deviceLabel).map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Acao executada</span>
                <input
                  value={form.action}
                  onChange={(e) => setForm((current) => ({ ...current, action: e.target.value }))}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </label>

              <button
                onClick={addAutomation}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {saving ? "Salvando..." : "Adicionar regra"}
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Regras Ativas</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-left text-slate-600">
                      <th className="px-3 py-2">Regra</th>
                      <th className="px-3 py-2">Condicao</th>
                      <th className="px-3 py-2">Acao</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(snapshot?.automations ?? []).map((rule) => (
                      <tr key={rule.id} className="border-b last:border-0">
                        <td className="px-3 py-3 font-medium text-slate-900">{rule.name}</td>
                        <td className="px-3 py-3 text-slate-700">
                          {sensorLabel[rule.sensor]} {rule.operator} {rule.threshold}
                          {sensorUnit[rule.sensor] ? ` ${sensorUnit[rule.sensor]}` : ""}
                        </td>
                        <td className="px-3 py-3 text-slate-700">{rule.action}</td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => removeAutomation(rule.id)}
                            className="inline-flex rounded-md border p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                            aria-label="Remover regra"
                            title="Remover regra"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Eventos Disparados Agora</h2>
              <div className="mt-4 grid gap-3">
                {(snapshot?.events ?? []).length === 0 && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Nenhuma regra atingiu o limite neste ciclo.
                  </div>
                )}
                {(snapshot?.events ?? []).map((event) => (
                  <div key={event.id} className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-emerald-950">{event.action}</div>
                        <div className="text-sm text-emerald-800">
                          {event.automationName}: valor atual {event.currentValue} {event.operator} {event.threshold}
                        </div>
                      </div>
                      <Fan className="h-5 w-5 text-emerald-700" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
