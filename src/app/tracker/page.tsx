"use client";
import { useState, useEffect } from "react";
import { getFlips, saveFlip, updateFlip, deleteFlip, getStats, TrackedFlip, FlipStatus } from "@/lib/flipTracker";
import { Plus, Trash2, Edit3, Check, X } from "lucide-react";

const statuses: FlipStatus[] = ["watching", "bought", "repairing", "listed", "sold", "scrapped"];

const statusColors: Record<FlipStatus, string> = {
  watching: "bg-gray-700 text-gray-300",
  bought: "bg-blue-500/20 text-blue-400",
  repairing: "bg-yellow-500/20 text-yellow-400",
  listed: "bg-purple-500/20 text-purple-400",
  sold: "bg-green-500/20 text-green-400",
  scrapped: "bg-red-500/20 text-red-400",
};

export default function TrackerPage() {
  const [flips, setFlips] = useState<TrackedFlip[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editSell, setEditSell] = useState<{ id: string; price: string } | null>(null);
  const [form, setForm] = useState({ deviceType: "", model: "", fault: "", buyPrice: "", repairCost: "", status: "bought" as FlipStatus, notes: "" });

  function refresh() { setFlips(getFlips()); }

  useEffect(() => { refresh(); }, []);

  function submitForm() {
    saveFlip({
      deviceType: form.deviceType,
      model: form.model,
      fault: form.fault,
      buyPrice: parseFloat(form.buyPrice) || 0,
      repairCost: parseFloat(form.repairCost) || 0,
      status: form.status,
      notes: form.notes,
    });
    setForm({ deviceType: "", model: "", fault: "", buyPrice: "", repairCost: "", status: "bought", notes: "" });
    setShowForm(false);
    refresh();
  }

  function markSold(id: string) {
    const price = parseFloat(editSell?.price || "0");
    if (!price) return;
    updateFlip(id, { status: "sold", sellPrice: price });
    setEditSell(null);
    refresh();
  }

  function changeStatus(id: string, status: FlipStatus) {
    updateFlip(id, { status });
    refresh();
  }

  function remove(id: string) {
    deleteFlip(id);
    refresh();
  }

  const stats = getStats(flips);
  const grouped = statuses.map(s => ({ status: s, items: flips.filter(f => f.status === s) })).filter(g => g.items.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Flip Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">Track every flip from purchase to sale</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black rounded-lg text-sm font-medium hover:bg-green-400 transition-colors"
        >
          <Plus size={14} />
          Log Flip
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Total Profit" value={`£${stats.totalProfit}`} color={stats.totalProfit >= 0 ? "text-green-400" : "text-red-400"} />
        <MiniStat label="Invested" value={`£${stats.totalInvested}`} color="text-blue-400" />
        <MiniStat label="Avg ROI" value={`${stats.avgRoi}%`} color="text-purple-400" />
        <MiniStat label="Sold" value={stats.totalSold.toString()} color="text-yellow-400" />
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-gray-900 border border-green-500/30 rounded-xl p-5 space-y-4">
          <div className="text-sm font-semibold text-white">Log a New Flip</div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Device Type" value={form.deviceType} onChange={v => setForm(p => ({ ...p, deviceType: v }))} placeholder="e.g. Nintendo Switch" />
            <FormField label="Model" value={form.model} onChange={v => setForm(p => ({ ...p, model: v }))} placeholder="e.g. OLED" />
            <FormField label="Fault" value={form.fault} onChange={v => setForm(p => ({ ...p, fault: v }))} placeholder="e.g. stick drift" span />
            <FormField label="Buy Price (£)" value={form.buyPrice} onChange={v => setForm(p => ({ ...p, buyPrice: v }))} placeholder="e.g. 80" type="number" />
            <FormField label="Repair Cost (£)" value={form.repairCost} onChange={v => setForm(p => ({ ...p, repairCost: v }))} placeholder="e.g. 5" type="number" />
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as FlipStatus }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <FormField label="Notes" value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} placeholder="Any extra notes..." span />
          </div>
          <div className="flex gap-2">
            <button onClick={submitForm} className="px-4 py-2 bg-green-500 text-black rounded-lg text-sm font-medium hover:bg-green-400">Save Flip</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Flip list grouped by status */}
      {flips.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
          No flips logged yet. Click &quot;Log Flip&quot; to get started.
        </div>
      ) : (
        grouped.map(({ status, items }) => (
          <div key={status} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[status]}`}>{status}</span>
              <span className="text-xs text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</span>
            </div>
            {items.map(flip => (
              <FlipRow
                key={flip.id}
                flip={flip}
                statuses={statuses}
                statusColors={statusColors}
                editSell={editSell}
                onEditSell={setEditSell}
                onMarkSold={markSold}
                onChangeStatus={changeStatus}
                onDelete={remove}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function FlipRow({ flip, statuses, statusColors, editSell, onEditSell, onMarkSold, onChangeStatus, onDelete }: {
  flip: TrackedFlip;
  statuses: FlipStatus[];
  statusColors: Record<FlipStatus, string>;
  editSell: { id: string; price: string } | null;
  onEditSell: (v: { id: string; price: string } | null) => void;
  onMarkSold: (id: string) => void;
  onChangeStatus: (id: string, s: FlipStatus) => void;
  onDelete: (id: string) => void;
}) {
  const totalInvested = flip.buyPrice + flip.repairCost;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white">{flip.deviceType} {flip.model}</div>
          <div className="text-xs text-gray-400 mt-0.5">{flip.fault}</div>
          {flip.notes && <div className="text-xs text-gray-500 mt-1 italic">{flip.notes}</div>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs text-gray-400">Invested</div>
            <div className="text-sm font-medium text-white">£{totalInvested}</div>
          </div>
          {flip.profit !== undefined && (
            <div className="text-right">
              <div className="text-xs text-gray-400">Profit</div>
              <div className={`text-sm font-bold ${flip.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {flip.profit >= 0 ? "+" : ""}£{flip.profit}
              </div>
            </div>
          )}
          <select
            value={flip.status}
            onChange={e => onChangeStatus(flip.id, e.target.value as FlipStatus)}
            className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[flip.status]} bg-transparent`}
          >
            {statuses.map(s => <option key={s} value={s} className="bg-gray-800 text-white">{s}</option>)}
          </select>
          <button onClick={() => onDelete(flip.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Mark sold */}
      {flip.status !== "sold" && flip.status !== "scrapped" && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          {editSell?.id === flip.id ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Sell price £"
                value={editSell.price}
                onChange={e => onEditSell({ id: flip.id, price: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white w-28 focus:outline-none focus:border-green-500"
              />
              <button onClick={() => onMarkSold(flip.id)} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
              <button onClick={() => onEditSell(null)} className="text-gray-500 hover:text-gray-300"><X size={14} /></button>
            </div>
          ) : (
            <button
              onClick={() => onEditSell({ id: flip.id, price: "" })}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-400 transition-colors"
            >
              <Edit3 size={11} /> Mark as sold
            </button>
          )}
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
