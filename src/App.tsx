import { SummaryCard } from "./components/SummaryCard"
import { UploadCard } from "./components/UploadCard"
import { WebcamCard } from "./components/WebcamCard"
import { API_BASE } from "./config"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <header className="flex items-center align-center justify-between"> 
          <div>
            <span className="inline-flex items-center gap-2 bg-white/60 border rounded-xl px-3 py-1">FIAP • ESO4 Fase-1</span>
          </div>
          <div className="text-sm text-slate-600">
            <p className="text-sm text-slate-600">Gateway: {API_BASE}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <UploadCard/>
          <WebcamCard/>
          <SummaryCard/>
        </div>
      </div>
    </div>
  )
}

export default App
