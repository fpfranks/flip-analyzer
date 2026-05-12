"use client";
import { useState } from "react";
import { priceDatabase } from "@/lib/priceDatabase";

const deviceCategories = [...new Set(priceDatabase.map(p => p.device))];

const demandColors: Record<string, string> = {
  "very high": "text-green-400 bg-green-500/10",
  "high": "text-blue-400 bg-blue-500/10",
  "medium": "text-yellow-400 bg-yellow-500/10",
  "low": "text-gray-400 bg-gray-700",
};

export default function PricesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = priceDatabase.filter(p => {
    const matchSearch = search === "" || p.device.toLowerCase().includes(search.toLowerCase()) || p.model.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.device === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Price Reference</h1>
        <p className="text-gray-400 text-sm mt-1">CEX and eBay prices for working devices — use as your resale target</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search device or model..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 w-56"
        />
        <div className="flex flex-wrap gap-1.5">
          {["All", ...deviceCategories].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === cat ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Device / Model</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">CEX Cash</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">CEX Voucher</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">eBay Avg</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">Facebook MP</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">Demand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((p, i) => (
                <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{p.model}</div>
                    <div className="text-xs text-gray-500">{p.device}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-green-400 font-medium">£{p.cexCash}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-blue-400 font-medium">£{p.cexVoucher}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white font-medium">£{p.ebayAvg}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-gray-300">£{p.fbAvg}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${demandColors[p.demand]}`}>{p.demand}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">No results found</div>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-xs text-yellow-300">
        <strong>Note:</strong> Prices are approximate UK market averages for working/good condition devices. Always verify on eBay &quot;Sold Listings&quot; and live CEX before buying. Prices fluctuate with stock and season.
      </div>
    </div>
  );
}
