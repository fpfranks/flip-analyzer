"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { faultDatabase, FaultEntry } from "@/lib/faultDatabase";
import { AlertTriangle, ChevronRight } from "lucide-react";

interface FaultSuggestion {
  device: string;
  symptom: string;
  likelyFault: string;
  difficulty: FaultEntry["difficulty"];
  risk: FaultEntry["risk"];
  repairMin: number;
  repairMax: number;
  successRate: number;
  steps: string[];
  warnings: string[];
}

// Flatten all faults from all devices into one searchable list
const allFaults: FaultSuggestion[] = faultDatabase.flatMap(d =>
  d.faults.map(f => ({
    device: d.device,
    symptom: f.symptom,
    likelyFault: f.likelyFault,
    difficulty: f.difficulty,
    risk: f.risk,
    repairMin: f.repairCost.min,
    repairMax: f.repairCost.max,
    successRate: f.successRate,
    steps: f.steps,
    warnings: f.warnings,
  }))
);

const riskColors: Record<FaultEntry["risk"], string> = {
  low: "text-green-400 bg-green-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  high: "text-orange-400 bg-orange-500/10",
  extreme: "text-red-400 bg-red-500/10",
};

const diffColors: Record<FaultEntry["difficulty"], string> = {
  beginner: "text-green-400",
  intermediate: "text-yellow-400",
  advanced: "text-orange-400",
  expert: "text-red-400",
};

function score(s: FaultSuggestion, q: string): number {
  const lower = q.toLowerCase();
  const fields = [s.symptom, s.likelyFault, s.device].map(f => f.toLowerCase());
  let sc = 0;
  if (fields[0].startsWith(lower)) sc += 10;
  if (fields[0].includes(lower)) sc += 5;
  if (fields[1].includes(lower)) sc += 3;
  if (fields[2].includes(lower)) sc += 2;
  // keyword matching
  const words = lower.split(/\s+/);
  words.forEach(w => { if (w.length > 2 && fields.some(f => f.includes(w))) sc += 1; });
  return sc;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  deviceFilter?: string;
  placeholder?: string;
  label?: string;
}

export default function FaultSuggestInput({ value, onChange, deviceFilter, placeholder = "e.g. stick drift, cracked screen, no power", label }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [selected, setSelected] = useState<FaultSuggestion | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo<FaultSuggestion[]>(() => {
    const q = value.trim();
    if (q.length < 2) return [];
    let pool = allFaults;
    if (deviceFilter) {
      const df = deviceFilter.toLowerCase();
      const filtered = pool.filter(s => s.device.toLowerCase().includes(df));
      if (filtered.length > 0) pool = filtered;
    }
    return pool
      .map(s => ({ s, sc: score(s, q) }))
      .filter(x => x.sc > 0)
      .sort((a, b) => b.sc - a.sc)
      .slice(0, 7)
      .map(x => x.s);
  }, [value, deviceFilter]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset highlighted when suggestions change
  useEffect(() => { setHighlighted(0); }, [suggestions]);

  // Clear selected detail when user edits
  useEffect(() => { if (selected && value !== selected.symptom) setSelected(null); }, [value, selected]);

  function pick(s: FaultSuggestion) {
    onChange(s.symptom);
    setSelected(s);
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); pick(suggestions[highlighted]); }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div className="col-span-2" ref={containerRef}>
      {label && <label className="block text-xs text-gray-400 mb-1">{label}</label>}
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        onKeyDown={handleKey}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
        autoComplete="off"
      />

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={`${s.device}-${s.symptom}`}
              onMouseDown={() => pick(s)}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${i === highlighted ? "bg-gray-800" : "hover:bg-gray-800/60"} ${i !== 0 ? "border-t border-gray-800" : ""}`}
            >
              <ChevronRight size={12} className="text-gray-500 mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">{s.symptom}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${riskColors[s.risk]}`}>{s.risk} risk</span>
                  <span className={`text-xs capitalize ${diffColors[s.difficulty]}`}>{s.difficulty}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{s.likelyFault}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{s.device}</span>
                  <span className="text-xs text-gray-500">Repair: £{s.repairMin}–£{s.repairMax}</span>
                  <span className="text-xs text-gray-500">{s.successRate}% success</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected fault detail card */}
      {selected && (
        <div className="mt-2 bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">{selected.symptom}</div>
              <div className="text-xs text-gray-400 mt-0.5">{selected.likelyFault}</div>
              <div className="text-xs text-gray-500 mt-0.5">{selected.device}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <span className={`text-xs px-2 py-0.5 rounded capitalize ${riskColors[selected.risk]}`}>{selected.risk} risk</span>
              <span className={`text-xs capitalize ${diffColors[selected.difficulty]}`}>{selected.difficulty}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-xs text-gray-500">Repair cost</div>
              <div className="text-sm font-bold text-white">£{selected.repairMin}–£{selected.repairMax}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-xs text-gray-500">Success rate</div>
              <div className={`text-sm font-bold ${selected.successRate >= 85 ? "text-green-400" : selected.successRate >= 65 ? "text-yellow-400" : "text-red-400"}`}>{selected.successRate}%</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-xs text-gray-500">Difficulty</div>
              <div className={`text-sm font-bold capitalize ${diffColors[selected.difficulty]}`}>{selected.difficulty}</div>
            </div>
          </div>

          {/* Repair steps */}
          <div>
            <div className="text-xs font-medium text-gray-400 mb-1.5">Repair steps</div>
            <div className="space-y-1">
              {selected.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-green-400 font-bold w-4 shrink-0">{i + 1}</span>
                  <span className="text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {selected.warnings.length > 0 && (
            <div className="space-y-1">
              {selected.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-yellow-300">
                  <AlertTriangle size={11} className="mt-0.5 shrink-0" /> {w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
