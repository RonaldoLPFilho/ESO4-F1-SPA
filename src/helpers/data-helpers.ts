export function formatPct(n?: number | null){
    if (n == null) return "--";
    return `${(n * 100).toFixed(1)}%`;
}