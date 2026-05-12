"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { FlipAnalysis, analyzeFlip } from "@/lib/flipScorer";
import { Loader2, AlertTriangle, CheckCircle2, XCircle, MinusCircle, Plus, ShieldAlert, Zap } from "lucide-react";
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
  const [mode, setMode] = useState<Mode>("manual");
  const [listingText, setListingText] = useState("");
  const [manual, setManual] = useState({ deviceType: "", model: "", fault: "", buyPrice: "", accessories: "" });
  const [pasteResult, setPasteResult] = useState<{ analysis: FlipAnalysis; extracted: Record<string, string> } | null>(null);
  const [pasteLoading, setPasteLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Manual mode: instant local analysis — no API, no button
  const manualAnalysis = useMemo<FlipAnalysis | null>(() => {
    if (!manual.deviceType.trim() || !manual.buyPrice) return null;
    const price = parseFloat(manual.buyPrice);
    if (!price || price <= 0) return null;
    return analyzeFlip(manual.deviceType, manual.model, manual.fault || "untested", price, manual.accessories);
  }, [manual]);

  // Paste mode: auto-trigger 800ms after typing stops
  useEffect(() => {
    if (mode !== "paste") return;
    if (listingText.trim().length < 25) { setPasteResult(null); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runPasteAnalysis(), 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingText, mode]);

  async function runPasteAnalysis() {
    setPasteLoading(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingText }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setPasteResult(null); return; }
      setPasteResult(data);
    } catch {
      setError("Could not analyze. Check your ANTHROPIC_API_KEY is set.");
    } finally {
      setPasteLoading(false);
    }
  }

  function addToTracker(analysis: FlipAnalysis) {
    saveFlip({
      deviceType: analysis.deviceType,
      model: analysis.model,
      fault: analysis.faultDescription,
      buyPrice: analysis.buyPrice,
      repairCost: analysis.repairCostEstimate,
      status: "bought",
    });
    setSaved(true);
  }

  const activeAnalysis = mode === "manual" ? manualAnalysis : pasteResult?.analysis ?? null;
  const isReady = activeAnalysis !== null;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Listing Analyzer</h1>
          <p className="text-gray-400 text-sm mt-1">Results update live as you type</p>
        </div>
        <div className="flex gap-2">
          {(["manual", "paste"] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setSaved(false); setError(""); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
              {m === "manual" ? "Quick Entry" : "Paste Listing"}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-6 ${isReady ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-2xl"}`}>
        {/* ── Left: Input ── */}
        <div className="space-y-4">
          {mode === "manual" ? (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-green-400" />
                <span className="text-xs text-green-400 font-medium">Live — updates as you type</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Device Type" placeholder="e.g. Nintendo Switch" value={manual.deviceType}
                  onChange={v => { setManual(p => ({ ...p, deviceType: v })); setSaved(false); }} />
                <Field label="Model" placeholder="e.g. Switch OLED" value={manual.model}
                  onChange={v => setManual(p => ({ ...p, model: v }))} />
                <Field label="Fault / Condition" placeholder="e.g. stick drift, cracked screen, no power"
                  value={manual.fault} onChange={v => setManual(p => ({ ...p, fault: v }))} span />
                <Field label="Buy Price (£)" placeholder="e.g. 80" value={manual.buyPrice} type="number"
                  onChange={v => { setManual(p => ({ ...p, buyPrice: v })); setSaved(false); }} />
                <Field label="Accessories (optional)" placeholder="e.g. box, dock, cables"
                  value={manual.accessories} onChange={v => setManual(p => ({ ...p, accessories: v }))} />
              </div>
              {!manual.deviceType && (
                <p className="text-xs text-gray-500">Start typing a device type to see your analysis appear →</p>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300 font-medium">Paste listing text</label>
                {pasteLoading && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Loader2 size={12} className="animate-spin" /> Analyzing...
                  </div>
                )}
                {!pasteLoading && listingText.trim().length >= 25 && pasteResult && (
                  <div className="flex items-center gap-1.5 text-xs text-green-400">
                    <CheckCircle2 size={12} /> Done
                  </div>
                )}
              </div>
              <textarea
                value={listingText}
                onChange={e => { setListingText(e.target.value); setSaved(false); setPasteResult(null); }}
                placeholder={`Paste any listing here...\n\nExamples:\n• "Nintendo Switch OLED, left joy-con drift, £80 ono, Manchester"\n• "PS5 disc edition, overheating and shutting off, £150"\n• "iPhone 13, cracked screen, face id works, £120"`}
                rows={9}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
              />
              <p className="text-xs text-gray-500">
                Auto-analyzes 0.8s after you stop typing. Works with Facebook Marketplace, eBay, Gumtree, Vinted, Shpock.
              </p>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs flex items-start gap-2">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}
            </div>
          )}

          {/* Extracted fields (paste mode) */}
          {mode === "paste" && pasteResult && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="text-xs text-gray-400 font-medium mb-3">Extracted from listing</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(pasteResult.extracted).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-gray-500 capitalize">{k}: </span>
                    <span className="text-white">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Live Results ── */}
        {activeAnalysis && (
          <div className="space-y-3">
            <AnalysisResult
              analysis={activeAnalysis}
              onSave={() => addToTracker(activeAnalysis)}
              saved={saved}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, span, type }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; span?: boolean; type?: string;
}) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input type={type || "text"} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
    </div>
  );
}

function AnalysisResult({ analysis, onSave, saved }: { analysis: FlipAnalysis; onSave: () => void; saved: boolean }) {
  const ActionIcon = actionConfig[analysis.recommendedAction].icon;

  return (
    <>
      {/* Scam alerts */}
      {analysis.scamFlags.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <ShieldAlert size={15} /> Scam / Risk Alerts
          </div>
          {analysis.scamFlags.map((flag, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-red-300">
              <AlertTriangle size={11} className="mt-0.5 shrink-0" /> {flag}
            </div>
          ))}
        </div>
      )}

      {/* Action + score */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-white">{analysis.deviceType} {analysis.model}</div>
            <div className="text-xs text-gray-400 mt-0.5">{analysis.faultDescription}</div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold shrink-0 ${actionConfig[analysis.recommendedAction].color}`}>
            <ActionIcon size={13} /> {analysis.recommendedAction}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Score</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`w-4 h-1.5 rounded-sm ${i < analysis.flipScore
                ? analysis.flipScore >= 7 ? "bg-green-500" : analysis.flipScore >= 5 ? "bg-yellow-500" : "bg-red-500"
                : "bg-gray-700"}`} />
            ))}
          </div>
          <span className="text-xs font-bold text-white">{analysis.flipScore}/10</span>
        </div>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-2">
        <NumBox label="Buy Price" value={`£${analysis.buyPrice}`} sub="asking" />
        <NumBox label="Est. Repair" value={`£${analysis.repairCostMin}–${analysis.repairCostMax}`} sub={`~£${analysis.repairCostEstimate}`} />
        <NumBox label="Profit After Fees" value={`£${analysis.profitAfterFees}`} sub={`${analysis.roiAfterFees}% ROI`} profit={analysis.profitAfterFees} />
        <NumBox label="Worst Case Loss" value={`£${analysis.worstCaseLoss}`} sub="total invested" warn />
      </div>

      {/* Platform links */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="text-xs font-medium text-gray-400 mb-3">Check Live Prices</div>
        <div className="space-y-2">
          {getPlatformLinks(analysis.deviceType, analysis.model).map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg px-3 py-2 bg-gray-800 hover:bg-gray-700 transition-colors group">
              <span className={`text-sm font-medium ${link.color}`}>{link.label}</span>
              <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{link.hint}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Risk / difficulty / demand row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3">
          <div className="text-xs text-gray-500 mb-1">Risk</div>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded capitalize ${riskColors[analysis.risk]}`}>{analysis.risk}</span>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3">
          <div className="text-xs text-gray-500 mb-1">Difficulty</div>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded capitalize ${difficultyColors[analysis.difficulty]}`}>{analysis.difficulty}</span>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3">
          <div className="text-xs text-gray-500 mb-1">Demand</div>
          <span className={`text-xs font-medium capitalize ${analysis.demand === "very high" || analysis.demand === "high" ? "text-green-400" : "text-yellow-400"}`}>{analysis.demand}</span>
        </div>
      </div>

      {/* Repair notes */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="text-xs text-gray-400 mb-1">Repair Notes</div>
        <div className="text-sm text-gray-200">{analysis.repairNotes}</div>
      </div>

      {/* Flags */}
      {analysis.flags.length > 0 && (
        <div className="space-y-1">
          {analysis.flags.map((flag, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800 rounded-lg px-3 py-2">
              <AlertTriangle size={11} className="text-yellow-400 shrink-0" /> {flag}
            </div>
          ))}
        </div>
      )}

      {/* Add to tracker */}
      <button onClick={onSave} disabled={saved}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${saved ? "bg-gray-700 text-gray-400 cursor-default" : "bg-green-500 text-black hover:bg-green-400"}`}>
        <Plus size={15} />
        {saved ? "Added to Tracker" : "Add to Flip Tracker"}
      </button>
    </>
  );
}

function getPlatformLinks(device: string, model: string) {
  const q = encodeURIComponent(`${device} ${model}`.trim());
  return [
    { label: "CEX", hint: "Trade-in & buy prices", color: "text-orange-400", url: `https://uk.webuy.com/search?q=${q}` },
    { label: "eBay — Sold Listings", hint: "Most accurate real sell prices", color: "text-yellow-400", url: `https://www.ebay.co.uk/sch/i.html?_nkw=${q}&LH_Sold=1&LH_Complete=1&LH_PrefLoc=1` },
    { label: "Facebook Marketplace", hint: "Local buyers, no fees", color: "text-blue-400", url: `https://www.facebook.com/marketplace/search/?query=${q}` },
    { label: "Vinted", hint: "Good for accessories & controllers", color: "text-teal-400", url: `https://www.vinted.co.uk/catalog?search_text=${q}` },
    { label: "Gumtree", hint: "Local cash sales", color: "text-green-400", url: `https://www.gumtree.com/search?search_category=all&q=${q}` },
  ];
}

function NumBox({ label, value, sub, profit, warn }: { label: string; value: string; sub: string; profit?: number; warn?: boolean }) {
  const color = profit !== undefined
    ? profit >= 0 ? "text-green-400" : "text-red-400"
    : warn ? "text-orange-400" : "text-white";
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-base font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
    </div>
  );
}
