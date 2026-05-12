"use client";
import { useState, useEffect, useMemo } from "react";
import {
  getFlips, saveFlip, updateFlip, deleteFlip, getStats,
  addRepairLog, deleteRepairLog, addPart, updatePart, deletePart,
  exportToCsv, TrackedFlip, FlipStatus, PartOrder
} from "@/lib/flipTracker";
import { analyzeFlip } from "@/lib/flipScorer";
import { Plus, Trash2, Edit3, Check, X, ChevronDown, ChevronUp, Download, Search, Wrench, Package, Zap } from "lucide-react";
import FaultSuggestInput from "@/components/FaultSuggestInput";

const statuses: FlipStatus[] = ["watching", "bought", "repairing", "listed", "sold", "scrapped"];
const partStatuses: PartOrder["status"][] = ["ordered", "arrived", "used", "returned"];

const statusColors: Record<FlipStatus, string> = {
  watching: "bg-gray-700 text-gray-300",
  bought: "bg-blue-500/20 text-blue-400",
  repairing: "bg-yellow-500/20 text-yellow-400",
  listed: "bg-purple-500/20 text-purple-400",
  sold: "bg-green-500/20 text-green-400",
  scrapped: "bg-red-500/20 text-red-400",
};

const partStatusColors: Record<PartOrder["status"], string> = {
  ordered: "text-yellow-400",
  arrived: "text-blue-400",
  used: "text-green-400",
  returned: "text-gray-400",
};

type SortKey = "date" | "profit" | "roi" | "invested";

export default function TrackerPage() {
  const [flips, setFlips] = useState<TrackedFlip[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editSell, setEditSell] = useState<{ id: string; price: string; platform: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FlipStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [form, setForm] = useState({ deviceType: "", model: "", fault: "", buyPrice: "", repairCost: "", status: "bought" as FlipStatus, notes: "" });
  const [logInput, setLogInput] = useState<{ [id: string]: { note: string; cost: string } }>({});
  const [partInput, setPartInput] = useState<{ [id: string]: { name: string; supplier: string; cost: string } }>({});

  function refresh() { setFlips(getFlips()); }
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    let result = flips;
    if (filterStatus !== "all") result = result.filter(f => f.status === filterStatus);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => f.deviceType.toLowerCase().includes(q) || f.model.toLowerCase().includes(q) || f.fault.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      if (sortKey === "profit") return (b.profit ?? -Infinity) - (a.profit ?? -Infinity);
      if (sortKey === "roi") return (b.roi ?? -Infinity) - (a.roi ?? -Infinity);
      if (sortKey === "invested") return (b.buyPrice + b.repairCost) - (a.buyPrice + a.repairCost);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [flips, filterStatus, searchQuery, sortKey]);

  const stats = getStats(flips);

  // Live analysis of the add-flip form — auto-fills repair cost and previews the deal
  const formAnalysis = useMemo(() => {
    if (!form.deviceType.trim() || !form.buyPrice) return null;
    const price = parseFloat(form.buyPrice);
    if (!price || price <= 0) return null;
    return analyzeFlip(form.deviceType, form.model, form.fault || "untested", price);
  }, [form.deviceType, form.model, form.fault, form.buyPrice]);

  // Auto-fill repair cost from analysis when user hasn't typed one yet
  useEffect(() => {
    if (formAnalysis && !form.repairCost) {
      setForm(p => ({ ...p, repairCost: formAnalysis.repairCostEstimate.toString() }));
    }
  }, [formAnalysis, form.repairCost]);

  function submitForm() {
    saveFlip({ deviceType: form.deviceType, model: form.model, fault: form.fault, buyPrice: parseFloat(form.buyPrice) || 0, repairCost: parseFloat(form.repairCost) || 0, status: form.status, notes: form.notes });
    setForm({ deviceType: "", model: "", fault: "", buyPrice: "", repairCost: "", status: "bought", notes: "" });
    setShowForm(false);
    refresh();
  }

  function markSold(id: string) {
    const price = parseFloat(editSell?.price || "0");
    if (!price) return;
    updateFlip(id, { status: "sold", sellPrice: price, platform: editSell?.platform || undefined });
    setEditSell(null);
    refresh();
  }

  function downloadCsv() {
    const csv = exportToCsv(flips);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "flips.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function addLog(flipId: string) {
    const input = logInput[flipId];
    if (!input?.note?.trim()) return;
    addRepairLog(flipId, input.note, input.cost ? parseFloat(input.cost) : undefined);
    setLogInput(p => ({ ...p, [flipId]: { note: "", cost: "" } }));
    refresh();
  }

  function addPartToFlip(flipId: string) {
    const input = partInput[flipId];
    if (!input?.name?.trim()) return;
    addPart(flipId, { name: input.name, supplier: input.supplier || "", cost: parseFloat(input.cost) || 0, status: "ordered" });
    setPartInput(p => ({ ...p, [flipId]: { name: "", supplier: "", cost: "" } }));
    refresh();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Flip Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">Track every flip from buy to sell</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadCsv} className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 hover:text-white transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black rounded-lg text-sm font-medium hover:bg-green-400 transition-colors">
            <Plus size={14} /> Log Flip
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Total Profit" value={`£${stats.totalProfit.toFixed(0)}`} color={stats.totalProfit >= 0 ? "text-green-400" : "text-red-400"} />
        <MiniStat label="Capital Active" value={`£${stats.totalInvested}`} color="text-blue-400" />
        <MiniStat label="Avg ROI" value={`${stats.avgRoi}%`} color="text-purple-400" />
        <MiniStat label="Sold" value={stats.totalSold.toString()} color="text-yellow-400" />
      </div>

      {/* Add form */}
      {showForm && (
        <div className={`grid gap-4 ${formAnalysis ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
          {/* Fields */}
          <div className="bg-gray-900 border border-green-500/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-white">Log a New Flip</div>
              <div className="flex items-center gap-1 text-xs text-green-400 ml-auto">
                <Zap size={11} /> Live estimate
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 relative">
              <FormField label="Device Type" value={form.deviceType} onChange={v => setForm(p => ({ ...p, deviceType: v, repairCost: "" }))} placeholder="e.g. Nintendo Switch" />
              <FormField label="Model" value={form.model} onChange={v => setForm(p => ({ ...p, model: v }))} placeholder="e.g. OLED" />
              <FaultSuggestInput
                label="Fault / Symptom"
                value={form.fault}
                onChange={v => setForm(p => ({ ...p, fault: v, repairCost: "" }))}
                deviceFilter={form.deviceType}
              />
              <FormField label="Buy Price (£)" value={form.buyPrice} onChange={v => setForm(p => ({ ...p, buyPrice: v }))} placeholder="0" type="number" />
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Repair Cost (£)
                  {formAnalysis && !form.repairCost && (
                    <span className="text-green-400 ml-1">(auto-filled)</span>
                  )}
                </label>
                <input type="number" placeholder={formAnalysis ? formAnalysis.repairCostEstimate.toString() : "0"}
                  value={form.repairCost} onChange={e => setForm(p => ({ ...p, repairCost: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as FlipStatus }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500">
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <FormField label="Notes" value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} placeholder="Any notes..." span />
            </div>
            <div className="flex gap-2">
              <button onClick={submitForm} disabled={!form.deviceType || !form.buyPrice}
                className="px-4 py-2 bg-green-500 text-black rounded-lg text-sm font-medium hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed">
                Save Flip
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600">Cancel</button>
            </div>
          </div>

          {/* Live analysis preview */}
          {formAnalysis && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <div className="text-xs font-medium text-gray-400">Deal Preview</div>

              {/* Action badge + score */}
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                  formAnalysis.recommendedAction === "BUY" ? "bg-green-500 text-black" :
                  formAnalysis.recommendedAction === "NEGOTIATE" ? "bg-yellow-500 text-black" :
                  formAnalysis.recommendedAction === "AVOID" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                }`}>
                  {formAnalysis.recommendedAction}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={`w-3.5 h-1.5 rounded-sm ${i < formAnalysis.flipScore
                        ? formAnalysis.flipScore >= 7 ? "bg-green-500" : formAnalysis.flipScore >= 5 ? "bg-yellow-500" : "bg-red-500"
                        : "bg-gray-700"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-white font-bold">{formAnalysis.flipScore}/10</span>
                </div>
              </div>

              {/* Numbers */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 rounded-lg p-2.5">
                  <div className="text-xs text-gray-400">Est. Repair</div>
                  <div className="text-sm font-bold text-white">£{formAnalysis.repairCostMin}–{formAnalysis.repairCostMax}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-2.5">
                  <div className="text-xs text-gray-400">Best Sell</div>
                  <div className="text-sm font-bold text-white">£{formAnalysis.bestSellPrice} <span className="text-xs text-gray-400">({formAnalysis.bestPlatform.split(" ")[0]})</span></div>
                </div>
                <div className={`bg-gray-800 rounded-lg p-2.5 col-span-2`}>
                  <div className="text-xs text-gray-400">Profit After Fees</div>
                  <div className={`text-base font-bold ${formAnalysis.profitAfterFees >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formAnalysis.profitAfterFees >= 0 ? "+" : ""}£{formAnalysis.profitAfterFees}
                    <span className="text-xs text-gray-400 ml-2">{formAnalysis.roiAfterFees}% ROI</span>
                  </div>
                </div>
              </div>

              {/* Risk + difficulty */}
              <div className="flex gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded capitalize ${
                  formAnalysis.risk === "low" ? "bg-green-500/10 text-green-400" :
                  formAnalysis.risk === "medium" ? "bg-yellow-500/10 text-yellow-400" :
                  formAnalysis.risk === "high" ? "bg-orange-500/10 text-orange-400" : "bg-red-500/10 text-red-400"
                }`}>{formAnalysis.risk} risk</span>
                <span className={`px-2 py-0.5 rounded capitalize ${
                  formAnalysis.difficulty === "beginner" ? "bg-green-500/10 text-green-400" :
                  formAnalysis.difficulty === "intermediate" ? "bg-yellow-500/10 text-yellow-400" :
                  formAnalysis.difficulty === "advanced" ? "bg-orange-500/10 text-orange-400" : "bg-red-500/10 text-red-400"
                }`}>{formAnalysis.difficulty}</span>
                <span className="text-gray-400 ml-auto">{formAnalysis.demand} demand</span>
              </div>

              {/* Repair note */}
              <div className="text-xs text-gray-400 border-t border-gray-800 pt-3">{formAnalysis.repairNotes}</div>

              {/* Scam flags */}
              {formAnalysis.scamFlags.length > 0 && (
                <div className="space-y-1">
                  {formAnalysis.scamFlags.map((f, i) => (
                    <div key={i} className="text-xs text-red-300 bg-red-500/10 rounded px-2 py-1">⚠ {f}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 w-40" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all", ...statuses] as (FlipStatus | "all")[]).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${filterStatus === s ? "bg-green-500 text-black font-medium" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-gray-500">Sort:</span>
          {(["date", "profit", "roi", "invested"] as SortKey[]).map(k => (
            <button key={k} onClick={() => setSortKey(k)}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${sortKey === k ? "bg-gray-700 text-white" : "text-gray-500 hover:text-white"}`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Flip list */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
          {flips.length === 0 ? <>No flips yet. Click <strong className="text-white">Log Flip</strong> to get started.</> : "No flips match your filters."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(flip => (
            <FlipCard
              key={flip.id}
              flip={flip}
              expanded={expandedId === flip.id}
              onToggle={() => setExpandedId(expandedId === flip.id ? null : flip.id)}
              editSell={editSell}
              onEditSell={setEditSell}
              onMarkSold={markSold}
              onChangeStatus={(id, s) => { updateFlip(id, { status: s }); refresh(); }}
              onDelete={(id) => { deleteFlip(id); refresh(); }}
              logInput={logInput[flip.id] ?? { note: "", cost: "" }}
              onLogInputChange={(v) => setLogInput(p => ({ ...p, [flip.id]: v }))}
              onAddLog={() => addLog(flip.id)}
              onDeleteLog={(logId) => { deleteRepairLog(flip.id, logId); refresh(); }}
              partInput={partInput[flip.id] ?? { name: "", supplier: "", cost: "" }}
              onPartInputChange={(v) => setPartInput(p => ({ ...p, [flip.id]: v }))}
              onAddPart={() => addPartToFlip(flip.id)}
              onUpdatePart={(partId, updates) => { updatePart(flip.id, partId, updates); refresh(); }}
              onDeletePart={(partId) => { deletePart(flip.id, partId); refresh(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FlipCard({ flip, expanded, onToggle, editSell, onEditSell, onMarkSold, onChangeStatus, onDelete, logInput, onLogInputChange, onAddLog, onDeleteLog, partInput, onPartInputChange, onAddPart, onUpdatePart, onDeletePart }: {
  flip: TrackedFlip; expanded: boolean; onToggle: () => void;
  editSell: { id: string; price: string; platform: string } | null;
  onEditSell: (v: { id: string; price: string; platform: string } | null) => void;
  onMarkSold: (id: string) => void;
  onChangeStatus: (id: string, s: FlipStatus) => void;
  onDelete: (id: string) => void;
  logInput: { note: string; cost: string };
  onLogInputChange: (v: { note: string; cost: string }) => void;
  onAddLog: () => void;
  onDeleteLog: (logId: string) => void;
  partInput: { name: string; supplier: string; cost: string };
  onPartInputChange: (v: { name: string; supplier: string; cost: string }) => void;
  onAddPart: () => void;
  onUpdatePart: (partId: string, updates: Partial<PartOrder>) => void;
  onDeletePart: (partId: string) => void;
}) {
  const totalInvested = flip.buyPrice + (flip.actualRepairCost ?? flip.repairCost);
  const pendingParts = flip.parts.filter(p => p.status === "ordered").length;

  return (
    <div className={`bg-gray-900 border rounded-xl overflow-hidden transition-colors ${expanded ? "border-gray-700" : "border-gray-800"}`}>
      {/* Main row */}
      <div className="flex items-start gap-3 p-4">
        <button onClick={onToggle} className="mt-0.5 text-gray-500 hover:text-gray-300 transition-colors shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{flip.deviceType} {flip.model}</div>
              <div className="text-xs text-gray-400 mt-0.5">{flip.fault}</div>
              {flip.notes && <div className="text-xs text-gray-500 mt-0.5 italic">{flip.notes}</div>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {pendingParts > 0 && <span className="text-xs text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">{pendingParts} part{pendingParts > 1 ? "s" : ""} ordered</span>}
              {flip.repairLog.length > 0 && <span className="text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{flip.repairLog.length} log{flip.repairLog.length > 1 ? "s" : ""}</span>}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <div className="text-xs text-gray-400">Bought: <span className="text-white font-medium">£{flip.buyPrice}</span></div>
            <div className="text-xs text-gray-400">Repair: <span className="text-white font-medium">£{flip.actualRepairCost ?? flip.repairCost}</span></div>
            <div className="text-xs text-gray-400">Total: <span className="text-white font-medium">£{totalInvested}</span></div>
            {flip.profit !== undefined && (
              <div className={`text-xs font-bold ${flip.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {flip.profit >= 0 ? "+" : ""}£{flip.profit.toFixed(0)} ({flip.roi}% ROI)
              </div>
            )}
            <select value={flip.status} onChange={e => onChangeStatus(flip.id, e.target.value as FlipStatus)}
              className={`text-xs px-2 py-0.5 rounded-full cursor-pointer ${statusColors[flip.status]} bg-transparent border-0`}>
              {statuses.map(s => <option key={s} value={s} className="bg-gray-800 text-white">{s}</option>)}
            </select>
            <button onClick={() => onDelete(flip.id)} className="text-gray-600 hover:text-red-400 transition-colors ml-auto"><Trash2 size={13} /></button>
          </div>
        </div>
      </div>

      {/* Mark sold bar */}
      {flip.status !== "sold" && flip.status !== "scrapped" && (
        <div className="px-4 pb-3 ml-7">
          {editSell?.id === flip.id ? (
            <div className="flex items-center gap-2 flex-wrap">
              <input type="number" placeholder="Sell price £" value={editSell.price} onChange={e => onEditSell({ ...editSell, price: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white w-28 focus:outline-none focus:border-green-500" />
              <select value={editSell.platform} onChange={e => onEditSell({ ...editSell, platform: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-green-500">
                <option value="">Platform...</option>
                <option>eBay</option><option>Facebook Marketplace</option><option>CEX</option><option>Vinted</option><option>Gumtree</option><option>Cash</option>
              </select>
              <button onClick={() => onMarkSold(flip.id)} className="text-green-400 hover:text-green-300 transition-colors"><Check size={14} /></button>
              <button onClick={() => onEditSell(null)} className="text-gray-500 hover:text-gray-300 transition-colors"><X size={14} /></button>
            </div>
          ) : (
            <button onClick={() => onEditSell({ id: flip.id, price: "", platform: "" })}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-400 transition-colors">
              <Edit3 size={11} /> Mark as sold
            </button>
          )}
        </div>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-gray-800 ml-7 p-4 space-y-5">
          {/* Repair log */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={13} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-300">Repair Log</span>
            </div>
            {flip.repairLog.length === 0 ? (
              <div className="text-xs text-gray-600 mb-2">No entries yet</div>
            ) : (
              <div className="space-y-1.5 mb-2">
                {flip.repairLog.map(entry => (
                  <div key={entry.id} className="flex items-start justify-between bg-gray-800 rounded px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-200">{entry.note}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(entry.date).toLocaleDateString("en-GB")}
                        {entry.cost ? <span className="text-yellow-400 ml-2">£{entry.cost}</span> : null}
                      </div>
                    </div>
                    <button onClick={() => onDeleteLog(entry.id)} className="text-gray-600 hover:text-red-400 ml-2 shrink-0 transition-colors"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" placeholder="Add note..." value={logInput.note} onChange={e => onLogInputChange({ ...logInput, note: e.target.value })}
                onKeyDown={e => e.key === "Enter" && onAddLog()}
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
              <input type="number" placeholder="Cost £" value={logInput.cost} onChange={e => onLogInputChange({ ...logInput, cost: e.target.value })}
                className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
              <button onClick={onAddLog} className="px-2.5 py-1.5 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 transition-colors"><Plus size={12} /></button>
            </div>
          </div>

          {/* Parts */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package size={13} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-300">Parts Ordered</span>
              {flip.parts.length > 0 && (
                <span className="text-xs text-gray-500 ml-auto">
                  Total: £{flip.parts.reduce((s, p) => s + p.cost, 0).toFixed(2)}
                </span>
              )}
            </div>
            {flip.parts.length === 0 ? (
              <div className="text-xs text-gray-600 mb-2">No parts logged</div>
            ) : (
              <div className="space-y-1.5 mb-2">
                {flip.parts.map(part => (
                  <div key={part.id} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-200">{part.name}</div>
                      <div className="text-xs text-gray-500">{part.supplier} · £{part.cost.toFixed(2)}</div>
                    </div>
                    <select value={part.status} onChange={e => onUpdatePart(part.id, { status: e.target.value as PartOrder["status"] })}
                      className={`text-xs bg-transparent border-0 cursor-pointer ${partStatusColors[part.status]}`}>
                      {partStatuses.map(s => <option key={s} value={s} className="bg-gray-800 text-white">{s}</option>)}
                    </select>
                    <button onClick={() => onDeletePart(part.id)} className="text-gray-600 hover:text-red-400 transition-colors shrink-0"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <input type="text" placeholder="Part name" value={partInput.name} onChange={e => onPartInputChange({ ...partInput, name: e.target.value })}
                className="flex-1 min-w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
              <input type="text" placeholder="Supplier" value={partInput.supplier} onChange={e => onPartInputChange({ ...partInput, supplier: e.target.value })}
                className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
              <input type="number" placeholder="£" value={partInput.cost} onChange={e => onPartInputChange({ ...partInput, cost: e.target.value })}
                className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
              <button onClick={onAddPart} className="px-2.5 py-1.5 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 transition-colors"><Plus size={12} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, span, type }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; span?: boolean; type?: string }) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input type={type || "text"} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
    </div>
  );
}
