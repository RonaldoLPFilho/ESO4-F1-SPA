export function Tabs({tab,onTab}: {tab: string;onTab: (t: string) => void;}) {
  const item = (key: string, label: string) => (
    <button
      onClick={() => onTab(key)}
      className={`px-3 py-1.5 rounded-xl text-sm border ${
        tab === key ? "bg-white text-slate-900" : "bg-slate-100 text-slate-600"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex gap-2">
      {item("charts", "Gráficos")}
      {item("timeline", "Linha do Tempo")}
      {item("recent", "Recentes")}
    </div>
  );
}
