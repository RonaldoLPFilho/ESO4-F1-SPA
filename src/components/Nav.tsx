import { BarChart3, Camera, SirenIcon } from "lucide-react";
import { NavLink, Link } from "react-router-dom";

export function Navigation() {
  const baseLinkCls = "flex items-center gap-2 px-4 py-2 rounded-md transition-colors";
  const inactiveCls ="text-slate-600 hover:bg-slate-100 hover:text-slate-900";
  const activeCls = "bg-slate-900 text-white";

  return (
    <nav className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/home" className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-slate-900" />
              <span className="text-lg font-semibold text-slate-900">
                AgroScan
              </span>
            </Link>

            <span className="hidden md:inline-flex items-center gap-2 bg-white border rounded-xl px-3 py-1 text-sm text-slate-700">
              FIAP • ESO4 Fase-2
            </span>
          </div>

          <div className="flex items-center gap-1">
            <NavLink
              to="/home"
              end
              className={({ isActive }) =>
                `${baseLinkCls} ${isActive ? activeCls : inactiveCls}`
              }
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </NavLink>

            <NavLink
              to="/predict"
              className={({ isActive }) =>
                `${baseLinkCls} ${isActive ? activeCls : inactiveCls}`
              }
            >
              <Camera className="h-4 w-4" />
              Analisar Imagem
            </NavLink>

            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                `${baseLinkCls} ${isActive ? activeCls : inactiveCls}`
              }
            >
              <SirenIcon className="h-4 w-4" />
              Alertas
            </NavLink>
          </div>

        </div>
      </div>
    </nav>
  );
}
