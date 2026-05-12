"use client";
import { useState, useMemo } from "react";
import { calcRequiredSellPrice, calcRoiFromSellPrice, PLATFORM_FEES } from "@/lib/flipScorer";
import { Calculator } from "lucide-react";

const platforms = Object.keys(PLATFORM_FEES);

type Mode = "target-roi" | "target-sell";

export default function CalculatorPage() {
  const [mode, setMode] = useState<Mode>("target-roi");
  const [buyPrice, setBuyPrice] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [deliveryCost, setDeliveryCost] = useState("0");
  const [platform, setPlatform] = useState("eBay");
  const [targetRoi, setTargetRoi] = useState("50");
  const [sellPrice, setSellPrice] = useState("");

  const result = useMemo(() => {
    const buy = parseFloat(buyPrice) || 0;
    const repair = parseFloat(repairCost) || 0;
    const delivery = parseFloat(deliveryCost) || 0;
    const total = buy + repair + delivery;
    if (total <= 0) return null;

    if (mode === "target-roi") {
      const roi = parseFloat(targetRoi) || 0;
      const required = calcRequiredSellPrice(buy, repair, delivery, roi, platform);
      const fee = PLATFORM_FEES[platform] ?? 0;
      const netProfit = required * (1 - fee) - total;
      return { required, netProfit: Math.round(netProfit), total, fee: Math.round(required * fee) };
    } else {
      const sell = parseFloat(sellPrice) || 0;
      if (sell <= 0) return null;
      const roi = calcRoiFromSellPrice(buy, repair, delivery, sell, platform);
      const fee = PLATFORM_FEES[platform] ?? 0;
      const netProfit = sell * (1 - fee) - total;
      return { roi, netProfit: Math.round(netProfit * 100) / 100, total, fee: Math.round(sell * fee) };
    }
  }, [buyPrice, repairCost, deliveryCost, platform, targetRoi, sellPrice, mode]);

  const presets = [
    { label: "Joy-Con Drift", buy: 20, repair: 5 },
    { label: "PS5 DualSense Drift", buy: 25, repair: 5 },
    { label: "Switch OLED Drift", buy: 100, repair: 5 },
    { label: "iPhone Screen", buy: 80, repair: 35 },
    { label: "PS5 Overheating", buy: 150, repair: 8 },
    { label: "MacBook Battery", buy: 200, repair: 25 },
  ];

  function applyPreset(buy: number, repair: number) {
    setBuyPrice(buy.toString());
    setRepairCost(repair.toString());
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">ROI Calculator</h1>
        <p className="text-gray-400 text-sm mt-1">Work out required sell price or ROI on any deal — fees included</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button onClick={() => setMode("target-roi")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "target-roi" ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
          What do I need to sell for?
        </button>
        <button onClick={() => setMode("target-sell")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "target-sell" ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
          What&apos;s my ROI if I sell for...?
        </button>
      </div>

      {/* Quick presets */}
      <div>
        <div className="text-xs text-gray-400 mb-2">Quick presets</div>
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button key={p.label} onClick={() => applyPreset(p.buy, p.repair)}
              className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs hover:bg-gray-700 hover:text-white transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <CalcField label="Buy Price (£)" value={buyPrice} onChange={setBuyPrice} placeholder="e.g. 80" />
          <CalcField label="Repair Cost (£)" value={repairCost} onChange={setRepairCost} placeholder="e.g. 5" />
          <div className="col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Delivery Cost (£) — cost to receive the item</label>
            <input type="number" placeholder="0" value={deliveryCost} onChange={e => setDeliveryCost(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 mb-1.5" />
            <div className="flex gap-1.5 flex-wrap">
              {[["Collection", "0"], ["Evri", "3.49"], ["Royal Mail", "3.30"], ["DPD", "6.99"], ["Large item", "8.99"]].map(([label, val]) => (
                <button key={label} onClick={() => setDeliveryCost(val)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${deliveryCost === val ? "bg-green-500 text-black" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                  {label} {val !== "0" ? `£${val}` : ""}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Selling Platform</label>
          <div className="flex gap-2 flex-wrap">
            {platforms.map(p => (
              <button key={p} onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${platform === p ? "bg-green-500 text-black font-medium" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
                {p} {PLATFORM_FEES[p] > 0 ? `(${(PLATFORM_FEES[p] * 100).toFixed(0)}% fee)` : "(no fee)"}
              </button>
            ))}
          </div>
        </div>

        {mode === "target-roi" ? (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Target ROI %</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {[25, 50, 75, 100, 150, 200].map(r => (
                <button key={r} onClick={() => setTargetRoi(r.toString())}
                  className={`px-3 py-1 rounded text-xs transition-colors ${targetRoi === r.toString() ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
                  {r}%
                </button>
              ))}
            </div>
            <input type="number" value={targetRoi} onChange={e => setTargetRoi(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
          </div>
        ) : (
          <CalcField label="Expected Sell Price (£)" value={sellPrice} onChange={setSellPrice} placeholder="e.g. 130" />
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={16} className="text-green-400" />
            <span className="text-sm font-semibold text-white">Result</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Total Invested</div>
              <div className="text-xl font-bold text-white">£{result.total}</div>
            </div>
            {"required" in result ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Required Sell Price</div>
                <div className="text-xl font-bold text-green-400">£{result.required}</div>
                <div className="text-xs text-gray-500 mt-0.5">Platform fee: £{result.fee}</div>
              </div>
            ) : (
              <div className={`rounded-lg p-3 border ${"roi" in result && result.roi >= 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                <div className="text-xs text-gray-400 mb-1">Your ROI</div>
                <div className={`text-xl font-bold ${"roi" in result && result.roi >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {"roi" in result ? `${result.roi}%` : ""}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Platform fee: £{result.fee}</div>
              </div>
            )}
            <div className={`col-span-2 rounded-lg p-3 border ${result.netProfit >= 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
              <div className="text-xs text-gray-400 mb-1">Net Profit (after fees)</div>
              <div className={`text-2xl font-bold ${result.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {result.netProfit >= 0 ? "+" : ""}£{result.netProfit}
              </div>
            </div>
          </div>

          {/* Break-even info */}
          <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Break-even ({platform}): <span className="text-white font-medium">
                £{Math.ceil(result.total / (1 - (PLATFORM_FEES[platform] ?? 0)))}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Total invested: <span className="text-white">£{result.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalcField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input type="number" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
    </div>
  );
}
