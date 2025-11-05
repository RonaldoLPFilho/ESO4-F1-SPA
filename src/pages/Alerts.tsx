import { useEffect, useMemo, useState } from "react";
import type { AlertConfig } from "../types/notification/AlertConfig";
import type { AlertContact } from "../types/notification/AlertContact";
import type { AlertEvent } from "../types/notification/AlertEvent";
import { API_BASE } from "../config";

const apiBase = (import.meta as any).env?.VITE_API_BASE || "";

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.json();
}

const numberOr = (v: any, d: number) =>
  typeof v === "number" && !isNaN(v) ? v : d;

export default function AlertsPage() {
  // Tabs
  const [tab, setTab] = useState<"config" | "contacts" | "events">("config");

  // Feedback simples
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const notify = (t: string) => {
    setMsg(t);
    setErr(null);
    setTimeout(() => setMsg(null), 3000);
  };
  const notifyErr = (t: string) => {
    setErr(t);
    setMsg(null);
  };

  // Config
  const [cfg, setCfg] = useState<AlertConfig | null>(null);
  const [savingCfg, setSavingCfg] = useState(false);

  // Contacts
  const [contacts, setContacts] = useState<AlertContact[]>([]);
  const [newContact, setNewContact] = useState<AlertContact>({
    name: "",
    email: "",
    phone: "",
  });
  const [creatingContact, setCreatingContact] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Events
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    await Promise.all([loadConfig(), loadContacts(), loadEvents()]);
  }

  async function loadConfig() {
    try {
      const res = await fetch(`${API_BASE}/alerts/config`);
      if (res.status === 204) {
        setCfg(null);
        return;
      }
      const data = await asJson<AlertConfig>(res);
      setCfg({
        id: data.id,
        active: data?.active ?? true,
        windowMinutes: numberOr(data?.windowMinutes, 5),
        thresholdSick: numberOr(data?.thresholdSick, 10),
        cooldownMinutes: numberOr(data?.cooldownMinutes, 5),
        lastTriggeredAt: data?.lastTriggeredAt ?? null,
      });
    } catch (e: any) {
      notifyErr(`Erro ao carregar configuração: ${e.message}`);
    }
  }

  async function loadContacts() {
    setLoadingContacts(true);
    try {
      const data = await asJson<AlertContact[]>(
        await fetch(`${API_BASE}/alerts/contacts`)
      );
      setContacts(data);
    } catch (e: any) {
      notifyErr(`Erro ao carregar contatos: ${e.message}`);
    } finally {
      setLoadingContacts(false);
    }
  }

  async function loadEvents() {
    setLoadingEvents(true);
    try {
      const data = await asJson<AlertEvent[]>(
        await fetch(`${API_BASE}/alerts/events`)
      );
      setEvents(data);
    } catch (e: any) {
      notifyErr(`Erro ao carregar eventos: ${e.message}`);
    } finally {
      setLoadingEvents(false);
    }
  }

  async function saveConfig() {
    if (!cfg) return;
    setSavingCfg(true);
    try {
      const saved = await asJson<AlertConfig>(
        await fetch(`${API_BASE}/alerts/config`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cfg),
        })
      );
      setCfg(saved);
      notify("Configuração salva com sucesso.");
    } catch (e: any) {
      notifyErr(`Erro ao salvar: ${e.message}`);
    } finally {
      setSavingCfg(false);
    }
  }

  async function addContact() {
    if (!newContact.name || !newContact.email || !newContact.phone) {
      notifyErr("Preencha nome, e-mail e telefone");
      return;
    }
    setCreatingContact(true);
    try {
      const created = await asJson<AlertContact>(
        await fetch(`${API_BASE}/alerts/contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newContact),
        })
      );
      setContacts((a) => [created, ...a]);
      setNewContact({ name: "", email: "", phone: "" });
      notify("Contato adicionado.");
    } catch (e: any) {
      notifyErr(`Erro ao adicionar: ${e.message}`);
    } finally {
      setCreatingContact(false);
    }
  }

  async function removeContact(id?: string) {
    if (!id) return;
    try {
      await fetch(`${API_BASE}/alerts/contacts/${id}`, { method: "DELETE" });
      setContacts((a) => a.filter((c) => c.id !== id));
      notify("Contato removido.");
    } catch (e: any) {
      notifyErr(`Erro ao remover: ${e.message}`);
    }
  }

  async function triggerTest() {
    try {
      await fetch(`${API_BASE}/alerts/test`, { method: "POST" });
      notify("Teste de alerta disparado.");
      loadEvents();
    } catch (e: any) {
      notifyErr(`Erro ao disparar teste: ${e.message}`);
    }
  }

  const lastTriggerLabel = useMemo(() => {
    if (!cfg?.lastTriggeredAt) return "—";
    try {
      return new Date(cfg.lastTriggeredAt).toLocaleString();
    } catch {
      return cfg.lastTriggeredAt;
    }
  }, [cfg?.lastTriggeredAt]);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="h-7 w-7 text-emerald-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 8a5 5 0 100 10 5 5 0 000-10zm0-6a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm9 10a1 1 0 110 2h-2a1 1 0 110-2h2zM5 12a1 1 0 110 2H3a1 1 0 110-2h2zm12.364 6.364a1 1 0 010 1.414l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414a1 1 0 011.414 0zM7.05 5.636A1 1 0 018.464 4.22l1.414 1.415A1 1 0 018.464 7.05L7.05 5.636zM15.536 5.636L14.121 4.22A1 1 0 0115.536 2.8l1.414 1.415a1 1 0 01-1.414 1.414zM6.343 18.364a1 1 0 011.414 0l1.414 1.414A1 1 0 117.757 21.2l-1.414-1.414a1 1 0 010-1.414z" />
          </svg>
          <h1 className="text-2xl font-semibold tracking-tight">
            Configuração de Alertas
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadAll}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Atualizar
          </button>
          <button
            onClick={triggerTest}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Disparar teste
          </button>
        </div>
      </div>

      {/* Mensagens */}
      {msg && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
          {msg}
        </div>
      )}
      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {err}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm">
        {(["config", "contacts", "events"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-2 ${
              tab === t
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t === "config" && "Configuração"}
            {t === "contacts" && "Contatos"}
            {t === "events" && "Eventos"}
          </button>
        ))}
      </div>
      {tab === "config" && (
        <section className="flex justify-center">
          <div className="rounded-2xl border bg-white p-5 shadow-sm w-full">
            <h2 className="text-lg font-semibold">Janela, Limiar e Ativação</h2>
            <p className="mt-1 text-sm text-gray-500">
              Defina a janela de observação, o número mínimo de doentes e o
              cooldown entre alertas.
            </p>
            <div className="mt-5 space-y-5">
              {!cfg ? (
                <div className="text-sm text-gray-500">Carregando…</div>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                    <div>
                      <div className="text-sm font-medium">Ativo</div>
                      <div className="text-xs text-gray-500">
                        Quando desativado, nenhum alerta será enviado.
                      </div>
                    </div>
                    <button
                      onClick={() => setCfg({ ...cfg, active: !cfg.active })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        cfg.active ? "bg-emerald-600" : "bg-gray-300"
                      }`}
                      aria-pressed={cfg.active}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          cfg.active ? "translate-x-5" : "translate-x-1"
                        }`}
                      ></span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Janela (min)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={cfg.windowMinutes}
                        onChange={(e) =>
                          setCfg({
                            ...cfg,
                            windowMinutes: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Limiar doentes (N)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={cfg.thresholdSick}
                        onChange={(e) =>
                          setCfg({
                            ...cfg,
                            thresholdSick: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Cooldown (min)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={cfg.cooldownMinutes}
                        onChange={(e) =>
                          setCfg({
                            ...cfg,
                            cooldownMinutes: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    Último disparo:{" "}
                    <span className="font-medium text-gray-900">
                      {lastTriggerLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      disabled={savingCfg}
                      onClick={saveConfig}
                      className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                        savingCfg ? "bg-gray-400" : "bg-gray-900 hover:bg-black"
                      }`}
                    >
                      Salvar
                    </button>
                    <button
                      onClick={triggerTest}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Disparar teste
                    </button>
                    <button
                      onClick={loadAll}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Atualizar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </section>
      )}

      {tab === "contacts" && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Contatos Emergenciais</h2>
              <p className="text-sm text-gray-500">
                Destinatários para e-mail e SMS
              </p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome</label>
              <input
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                placeholder="Ex.: João Silva"
                value={newContact.name}
                onChange={(e) =>
                  setNewContact({ ...newContact, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">E-mail</label>
              <input
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                placeholder="email@dominio.com"
                value={newContact.email}
                onChange={(e) =>
                  setNewContact({ ...newContact, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Telefone</label>
              <input
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                placeholder="+5511999999999"
                value={newContact.phone}
                onChange={(e) =>
                  setNewContact({ ...newContact, phone: e.target.value })
                }
              />
            </div>
          </div>
          <button
            onClick={addContact}
            disabled={creatingContact}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              creatingContact
                ? "bg-gray-400"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            Adicionar contato
          </button>

          <div className="my-5 h-px w-full bg-gray-200" />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">Nome</th>
                  <th className="py-2">E-mail</th>
                  <th className="py-2">Telefone</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {loadingContacts ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      Carregando…
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      Nenhum contato cadastrado.
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{c.name}</td>
                      <td className="py-3">{c.email}</td>
                      <td className="py-3">{c.phone}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => removeContact(c.id)}
                          className="rounded-lg border px-3 py-1.5 text-xs hover:bg-red-50 hover:text-red-700"
                          title="Remover"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "events" && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Eventos Recentes</h2>
              <p className="text-sm text-gray-500">
                Últimos disparos de alerta registrados
              </p>
            </div>
            <button
              onClick={loadEvents}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Atualizar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">Data/Hora</th>
                  <th className="py-2">Canal</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Erro</th>
                </tr>
              </thead>
              <tbody>
                {loadingEvents ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      Carregando…
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      Nenhum evento.
                    </td>
                  </tr>
                ) : (
                  events.map((e) => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="py-3">
                        {new Date(e.triggeredAt).toLocaleString()}
                      </td>
                      <td className="py-3">
                        {e.channel === "EMAIL" ? "E-mail" : "SMS"}
                      </td>
                      <td className="py-3">
                        {e.status === "SENT" ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            Enviado
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            Falhou
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-gray-600">
                        {e.errorMessage || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
