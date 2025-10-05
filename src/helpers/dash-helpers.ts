export const fmtInt = (n: number | undefined | null) =>
    n == null ? "--" : n.toLocaleString("pt-BR");
    
    
export const fmtPct = (x: number | undefined | null, digits = 1) =>
x == null ? "--" : `${(x * 100).toFixed(digits)}%`;
    
    
export const cap = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");
    
    
export const badge = (label: string) =>
    label.toLowerCase() === "saudavel"
    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : label.toLowerCase() === "doente"
    ? "bg-rose-100 text-rose-700 border-rose-200"
    : "bg-slate-100 text-slate-600 border-slate-200";
    
