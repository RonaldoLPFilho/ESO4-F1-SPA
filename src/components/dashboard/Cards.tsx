export function Card({ children, tone = "default", className = "" }: { children: React.ReactNode; tone?: "default" | "good" | "bad"; className?: string }) {
    const ring =
        tone === "good"
        ? "border-emerald-200 hover:ring-emerald-200"
        : tone === "bad"
        ? "border-rose-200 hover:ring-rose-200"
        : "border-slate-200 hover:ring-slate-200";

    return (
    <div className={`bg-white/80 backdrop-blur rounded-2xl border ${ring} shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
        {children}
    </div>
    );
}