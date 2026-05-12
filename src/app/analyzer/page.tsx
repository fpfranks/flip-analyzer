"use client";
import { useState } from "react";
import { FlipAnalysis } from "@/lib/flipScorer";
import { Search, Loader2, AlertTriangle, CheckCircle2, XCircle, MinusCircle, Plus } from "lucide-react";
import { saveFlip } from "@/lib/flipTracker";

type Mode = "paste" | "manual";

const riskColors: Record<string, string> = {
  low: "text-green-400 bg-green-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  high: "text-orange-400 bg-orange-500/10",
  extreme: "text-red-400 bg-red-500/10",
};

const difficultyColors: Record<string, string> = {
  beginner: "text-green-400 bg-green-500/10",
  intermediate: "text-yellow-400 bg-yellow-500/10",
  advanced: "text-orange-400 bg-orange-500/10",
  expert: "text-red-400 bg-red-500/10",
};

const actionConfig = {
  BUY: { color: "bg-green-500 text-black", icon: CheckCircle2 },
  NEGOTIATE: { color: "bg-yellow-500 text-black", icon: MinusCircle },
  WATCH: { color: "bg-blue-500 text-white", icon: MinusCircle },
  AVOID: { color: "bg-red-500 text-white", icon: XCircle },
};

export default function AnalyzerPage() {
  const [mode, setMode] = useState<Mode>("paste");
  const [listingText, setListingText] = useState("");
  const [manual, setManual] = useState({ deviceType: "", model: "", fault: "", buyPrice: "", accessories: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: FlipAnalysis; extracted: Record<string, string> } | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function analyze() {
    setLoading(true);
    setError("");
    setResult(null);
    setSaved(false);
    try {
      const body = mode === "paste"
        ? { listingText }
        : { manualInput: { ...manual, buyPrice: parseFloat(manual.buyPrice) || 0 } };

      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResult(data);
    } catch {
      setError("Something went wrong. Check your API key is set.");
    } finally {
      setLoading(false);
    }
  }

  function addToTracker() {
    if (!result) return;
    const { analysis } = result;
    saveFlip({
      deviceType: analysis.deviceType,
      model: analysis.model,
      fault: analysis.faultDescription,
      buyPrice: analysis.buyPrice,
      repairCost: analysis.repairCostEstimate,
      status: "watching",
    });
    setSaved(true);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Listing Analyzer</h1>
        <p className="text-gray-400 text-sm mt-1">Paste a listing or fill in the details — get instant flip analysis</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["paste", "manual"] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400 hover:text-white"}`}
          >
            {m === "paste" ? "Paste Listing" : "Manual Entry"}
          </button>
        ))}
      </div>

      {mode === "paste" ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
          <label className="block text-sm text-gray-300 font-medium">Paste listing text</label>
          <textarea
            value={listingText}
            onChange={e => setListingText(e.target.value)}
            placeholder={`Example:\nNintendo Switch OLED for sale. Screen has crack on right side. Joy-cons included but left one has drift. Works fine otherwise. Asking £80 ono. Collection from Manchester.`}
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
          />
          <p className="text-xs text-gray-500">Paste from Facebook Marketplace, eBay, Gumtree, Vinted — AI will extract all the details automatically</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 grid grid-cols-2 gap-4">
          <Field label="Device Type" placeholder="e.g. Nintendo Switch" value={manual.deviceType} onChange={v => setManual(p => ({ ...p, deviceType: v }))} />
          <Field label="Model" placeholder="e.g. Switch OLED" value={manual.model} onChange={v => setManual(p => ({ ...p, model: v }))} />
          <Field label="Fault Description" placeholder="e.g. stick drift, cracked screen" value={manual.fault} onChange={v => setManual(p => ({ ...p, fault: v }))} span />
          <Field label="Buy Price (£)" placeholder="e.g. 80" value={manual.buyPrice} onChange={v => setManual(p => ({ ...p, buyPrice: v }))} type="number" />
          <Field label="Accessories" placeholder="e.g. box, dock, cables" value={manual.accessories} onChange={v => setManual(p => ({ ...p, accessories: v }))} />
        </div>
      )}

      <button
        onClick={analyze}
        disabled={loading || (mode === "paste" ? !listingText.trim() : !manual.deviceType || !manual.buyPrice)}
        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-black rounded-lg font-medium text-sm hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        {loading ? "Analyzing..." : "Analyze Flip"}
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {result && <AnalysisResult result={result} onSave={addToTracker} saved={saved} />}
    </div>
  );
}

function Field({ label, placeholder, value, onChange, span, type }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; span?: boolean; type?: string }) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type={type || "text"}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
      />
    </div>
  );
}

function AnalysisResult({ result, onSave, saved }: { result: { analysis: FlipAnalysis; extracted: Record<string, string> }; onSave: () => void; saved: boolean }) {
  const { analysis } = result;
  const ActionIcon = actionConfig[analysis.recommendedAction].icon;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-bold text-white">{analysis.deviceType} {analysis.model}</div>
            <div className="text-sm text-gray-400 mt-0.5">{analysis.faultDescription}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${actionConfig[analysis.recommendedAction].color}`}>
              <ActionIcon size={14} />
              {analysis.recommendedAction}
            </div>
          </div>
        </div>

        {/* Flip Score */}
        <div className="mt-4 flex items-center gap-3">
          <div className="text-sm text-gray-400">Flip Score</div>
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-2 rounded-sm ${i < analysis.flipScore ? (analysis.flipScore >= 7 ? "bg-green-500" : analysis.flipScore >= 5 ? "bg-yellow-500" : "bg-red-500") : "bg-gray-700"}`}
              />
            ))}
          </div>
          <div className="text-sm font-bold text-white">{analysis.flipScore}/10</div>
        </div>
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <NumberCard label="Buy Price" value={`£${analysis.buyPrice}`} sub="asking price" />
        <NumberCard label="Repair Cost" value={`£${analysis.repairCostMin}-${analysis.repairCostMax}`} sub={`~£${analysis.repairCostEstimate} est.`} />
        <NumberCard label="Best Sell Price" value={`£${analysis.bestSellPrice}`} sub={analysis.bestPlatform} highlight />
        <NumberCard label="Est. Profit" value={`£${analysis.profitEstimate}`} sub={`ROI: ${analysis.roiEstimate}%`} highlight profit={analysis.profitEstimate} />
      </div>

      {/* Platform prices */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Market Prices (Working Condition)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <PriceBox label="CEX Cash" value={analysis.cexCash} />
          <PriceBox label="CEX Voucher" value={analysis.cexVoucher} />
          <PriceBox label="eBay Avg" value={analysis.ebayAvg} />
          <PriceBox label="Facebook MP" value={analysis.fbAvg} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-400">Demand:</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${analysis.demand === "very high" || analysis.demand === "high" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
            {analysis.demand}
          </span>
        </div>
      </div>

      {/* Risk & Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="text-xs text-gray-400 mb-2">Risk Level</div>
          <span className={`text-sm font-medium px-2 py-1 rounded-lg capitalize ${riskColors[analysis.risk]}`}>{analysis.risk}</span>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="text-xs text-gray-400 mb-2">Repair Difficulty</div>
          <span className={`text-sm font-medium px-2 py-1 rounded-lg capitalize ${difficultyColors[analysis.difficulty]}`}>{analysis.difficulty}</span>
        </div>
      </div>

      {/* Repair notes */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="text-xs text-gray-400 mb-1">Repair Notes</div>
        <div className="text-sm text-gray-200">{analysis.repairNotes}</div>
        <div className="mt-2 text-xs text-gray-400">Worst case total investment: <span className="text-orange-400 font-medium">£{analysis.worstCaseLoss}</span></div>
      </div>

      {/* Flags */}
      {analysis.flags.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-2">
          <div className="text-xs text-gray-400 mb-1">Flags</div>
          {analysis.flags.map((flag, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <AlertTriangle size={12} className="text-yellow-400 shrink-0" />
              <span className="text-gray-200">{flag}</span>
            </div>
          ))}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={saved}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? "bg-gray-700 text-gray-400 cursor-default" : "bg-blue-500 text-white hover:bg-blue-400"}`}
      >
        <Plus size={14} />
        {saved ? "Added to Tracker" : "Add to Flip Tracker"}
      </button>
    </div>
  );
}

function NumberCard({ label, value, sub, highlight, profit }: { label: string; value: string; sub: string; highlight?: boolean; profit?: number }) {
  const isProfit = profit !== undefined;
  const profitColor = isProfit ? (profit >= 0 ? "text-green-400" : "text-red-400") : highlight ? "text-green-400" : "text-white";
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-lg font-bold ${profitColor}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
    </div>
  );
}

function PriceBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-base font-bold text-white">{value > 0 ? `£${value}` : "N/A"}</div>
    </div>
  );
}
