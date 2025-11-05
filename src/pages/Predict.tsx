import { SummaryCard } from "../components/SummaryCard";
import { UploadCard } from "../components/UploadCard";
import { WebcamCard } from "../components/WebcamCard";

export default function Predict() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900">
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">  
          <div className="grid grid-cols-1 gap-6">
            <UploadCard/>
            <WebcamCard/>
            <SummaryCard/>
          </div>
        </div>
      </div>
    )
  }