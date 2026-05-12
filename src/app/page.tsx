"use client";
import { useEffect, useState } from "react";
import { getFlips, getStats, getProfitTimeline, TrackedFlip } from "@/lib/flipTracker";
import { TrendingUp, DollarSign, Package, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ProfitChart = dynamic(() => import("@/components/ProfitChart"), { ssr: false });

const statusColors: Record<string, string> = {
  watching: "bg-gray-700 text-gray-300",
  bought: "bg-blue-500/20 text-blue-400",
  repairing: "bg-yellow-500/20 text-yellow-400",
  listed: "bg-purple-500/20 text-purple-400",
  sold: "bg-green-500/20 text-green-400",
  scrapped: "bg-red-500/20 text-red-400",
};

export default function Dashboard() {
  const [flips, setFlips] = useState<TrackedFlip[]>([]);

  useEffect(() => {
    setFlips(getFlips());
  }, []);

  const stats = getStats(flips);
  const timeline = getProfitTimeline(flips);
  const recent = [...flips].reverse().slice(0, 5);
  const pendingParts = flips.reduce((sum, f) => sum + f.parts.filter(p => p.status === "ordered").length, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Your flipping operation at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign size={18} />} label="Total Profit" value={`£${stats.totalProfit.toFixed(0)}`} color="green" />
        <StatCard icon={<Package size={18} />} label="Active Flips" value={stats.activeFlips.toString()} color="blue" sub={pendingParts > 0 ? `${pendingParts} parts in transit` : undefined} />
        <StatCard icon={<TrendingUp size={18} />} label="Items Sold" value={stats.totalSold.toString()} color="purple" />
        <StatCard icon={<BarChart3 size={18} />} label="Avg ROI" value={`${stats.avgRoi}%`} color="yellow" />
      </div>

      {/* Profit chart */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white text-sm">Cumulative Profit</h2>
          {stats.bestFlip && (
            <div className="text-xs text-gray-400">
              Best flip: <span className="text-green-400 font-medium">{stats.bestFlip.deviceType} {stats.bestFlip.model} (+£{stats.bestFlip.profit?.toFixed(0)})</span>
            </div>
          )}
        </div>
        <ProfitChart data={timeline} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickAction href="/analyzer" title="Analyze Listing" desc="Paste any listing for instant analysis" />
        <QuickAction href="/fault-finder" title="Fault Finder" desc="Step-by-step repair diagnostics" />
        <QuickAction href="/calculator" title="ROI Calculator" desc="Work out sell price or ROI fast" />
        <QuickAction href="/tracker" title="Flip Tracker" desc="Log and track your flips" />
      </div>

      {/* Recent flips */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Recent Flips</h2>
          <Link href="/tracker" className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No flips tracked yet.{" "}
            <Link href="/tracker" className="text-green-400 hover:underline">Log your first flip</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recent.map(flip => (
              <div key={flip.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-medium text-white">{flip.deviceType} {flip.model}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{flip.fault}</div>
                </div>
                <div className="flex items-center gap-3">
                  {flip.parts.some(p => p.status === "ordered") && (
                    <span className="text-xs text-yellow-400">parts pending</span>
                  )}
                  {flip.profit !== undefined && (
                    <span className={`text-sm font-bold ${flip.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {flip.profit >= 0 ? "+" : ""}£{flip.profit.toFixed(0)}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[flip.status]}`}>{flip.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Beginner tips */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="font-semibold text-white mb-3">Best Beginner Flips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TipCard device="Joy-Con Stick Drift" profit="£25-45" difficulty="Beginner" roi="300%+" note="£2-5 part, 30 mins" />
          <TipCard device="PS5 DualSense Drift" profit="£20-40" difficulty="Beginner" roi="250%+" note="£3-6 part, 45 mins" />
          <TipCard device="Switch Battery Swap" profit="£30-50" difficulty="Beginner" roi="200%+" note="£10 battery, 45 mins" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }: { icon: React.ReactNode; label: string; value: string; color: string; sub?: string }) {
  const colors: Record<string, string> = {
    green: "text-green-400 bg-green-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
  };
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
      {sub && <div className="text-xs text-yellow-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function QuickAction({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-green-500/50 hover:bg-gray-800 transition-all group block">
      <div className="font-medium text-white group-hover:text-green-400 transition-colors text-sm">{title}</div>
      <div className="text-xs text-gray-400 mt-1">{desc}</div>
      <ArrowRight size={14} className="mt-3 text-gray-600 group-hover:text-green-400 transition-colors" />
    </Link>
  );
}

function TipCard({ device, profit, difficulty, roi, note }: { device: string; profit: string; difficulty: string; roi: string; note: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="text-sm font-medium text-white">{device}</div>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">{profit}</span>
        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{difficulty}</span>
      </div>
      <div className="text-xs text-gray-400 mt-1.5">ROI: {roi} · {note}</div>
    </div>
  );
}
