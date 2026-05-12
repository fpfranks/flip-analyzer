"use client";
import { useState } from "react";
import { faultDatabase, DeviceFaults, FaultEntry } from "@/lib/faultDatabase";
import { Wrench, ChevronDown, ChevronUp, AlertTriangle, Clock, DollarSign, TrendingUp } from "lucide-react";

const difficultyColors: Record<string, string> = {
  beginner: "text-green-400 bg-green-500/10 border-green-500/30",
  intermediate: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  advanced: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  expert: "text-red-400 bg-red-500/10 border-red-500/30",
};

const riskColors: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  extreme: "text-red-400",
};

export default function FaultFinderPage() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceFaults | null>(null);
  const [selectedFault, setSelectedFault] = useState<FaultEntry | null>(null);
  const [search, setSearch] = useState("");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const filtered = faultDatabase.filter(d =>
    d.device.toLowerCase().includes(search.toLowerCase())
  );

  function selectDevice(device: DeviceFaults) {
    setSelectedDevice(device);
    setSelectedFault(null);
    setExpandedStep(null);
  }

  function selectFault(fault: FaultEntry) {
    setSelectedFault(fault === selectedFault ? null : fault);
    setExpandedStep(null);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Fault Finder</h1>
        <p className="text-gray-400 text-sm mt-1">Diagnose any electronics fault — step-by-step repair guidance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device selector */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search device..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
          <div className="space-y-1">
            {filtered.map(device => (
              <button
                key={device.device}
                onClick={() => selectDevice(device)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedDevice?.device === device.device
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent"
                }`}
              >
                <div className="font-medium">{device.device}</div>
                <div className="text-xs text-gray-500 mt-0.5">{device.faults.length} known faults</div>
              </button>
            ))}
          </div>
        </div>

        {/* Fault list + detail */}
        <div className="md:col-span-2 space-y-3">
          {!selectedDevice ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <Wrench size={32} className="text-gray-600 mx-auto mb-3" />
              <div className="text-gray-400 text-sm">Select a device to see fault diagnostics</div>
            </div>
          ) : (
            <>
              <div className="text-sm font-semibold text-white">{selectedDevice.device}</div>
              {selectedDevice.faults.map((fault, idx) => (
                <FaultCard
                  key={idx}
                  fault={fault}
                  selected={selectedFault === fault}
                  onSelect={() => selectFault(fault)}
                  expandedStep={expandedStep}
                  onExpandStep={setExpandedStep}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FaultCard({ fault, selected, onSelect, expandedStep, onExpandStep }: {
  fault: FaultEntry;
  selected: boolean;
  onSelect: () => void;
  expandedStep: number | null;
  onExpandStep: (i: number | null) => void;
}) {
  return (
    <div className={`bg-gray-900 border rounded-xl overflow-hidden transition-colors ${selected ? "border-green-500/50" : "border-gray-800"}`}>
      <button
        onClick={onSelect}
        className="w-full text-left p-4 flex items-center justify-between"
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white">{fault.symptom}</div>
          <div className="text-xs text-gray-400 mt-0.5 truncate">{fault.likelyFault}</div>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${difficultyColors[fault.difficulty]}`}>
            {fault.difficulty}
          </span>
          <span className={`text-xs font-medium ${riskColors[fault.risk]}`}>
            {fault.risk} risk
          </span>
          {selected ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>

      {selected && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatBadge icon={<DollarSign size={12} />} label="Repair Cost" value={`£${fault.repairCost.min}-£${fault.repairCost.max}`} />
            <StatBadge icon={<Clock size={12} />} label="Time" value={`${fault.timeHours}h`} />
            <StatBadge icon={<TrendingUp size={12} />} label="Success Rate" value={`${fault.successRate}%`} />
          </div>

          {/* Parts needed */}
          <div>
            <div className="text-xs font-medium text-gray-400 mb-2">Parts Needed</div>
            <div className="space-y-1">
              {fault.partsNeeded.map((p, i) => (
                <div key={i} className="text-xs text-gray-200 bg-gray-800 rounded px-2 py-1">{p}</div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <div className="text-xs font-medium text-gray-400 mb-2">Tools Required</div>
            <div className="flex flex-wrap gap-1.5">
              {fault.tools.map((t, i) => (
                <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </div>

          {/* Step by step */}
          <div>
            <div className="text-xs font-medium text-gray-400 mb-2">Repair Steps</div>
            <div className="space-y-1.5">
              {fault.steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => onExpandStep(expandedStep === i ? null : i)}
                  className="w-full text-left flex items-start gap-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
                >
                  <span className="text-xs font-bold text-green-400 w-4 shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-xs text-gray-200">{step}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {fault.warnings.length > 0 && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 space-y-1.5">
              {fault.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-yellow-300">
                  <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                  {w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-2.5">
      <div className="flex items-center gap-1 text-gray-400 mb-1">{icon}<span className="text-xs">{label}</span></div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}
