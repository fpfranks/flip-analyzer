"use client";
import { useEffect, useState } from "react";
import { getFlips, getStats, TrackedFlip } from "@/lib/flipTracker";
import { TrendingUp, DollarSign, Package, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";

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
  const recent = [...flips].reverse().slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Your flipping operation at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign size={18} />} label="Total Profit" value={`£${stats.totalProfit.toFixed(0)}`} color="green" />
        <StatCard icon={<Package size={18} />} label="Active Flips" value={stats.activeFlips.toString()} color="blue" />
        <StatCard icon={<TrendingUp size={18} />} label="Items Sold" value={stats.totalSold.toString()} color="purple" />
        <StatCard icon={<BarChart3 size={18} />} label="Avg ROI" value={`${stats.avgRoi}%`} color="yellow" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction href="/analyzer" title="Analyze a Listing" desc="Paste any listing text for instant profit analysis" />
        <QuickAction href="/fault-finder" title="Diagnose a Fault" desc="Step-by-step repair guide for any device or brand" />
        <QuickAction href="/tracker" title="Log a Flip" desc="Track your buys, repairs, and sales in one place" />
      </div>

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
            <Link href="/tracker" className="text-green-400 hover:underline">
              Log your first flip
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recent.map(flip => (
              <div key={flip.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-medium text-white">
                    {flip.deviceType} {flip.model}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{flip.fault}</div>
                </div>
                <div className="flex items-center gap-3">
                  {flip.profit !== undefined && (
                    <span className={`text-sm font-bold ${flip.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {flip.profit >= 0 ? "+" : ""}£{flip.profit}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[flip.status]}`}>
                    {flip.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="font-semibold text-white mb-3">Best Beginner Flips Right Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TipCard device="Joy-Con Stick Drift" profit="£25-45" difficulty="Beginner" roi="300%+" />
          <TipCard device="PS5 DualSense Drift" profit="£20-40" difficulty="Beginner" roi="250%+" />
          <TipCard device="Switch Battery Swap" profit="£30-50" difficulty="Beginner" roi="200%+" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
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
    </div>
  );
}

function QuickAction({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-green-500/50 hover:bg-gray-800 transition-all group block"
    >
      <div className="font-medium text-white group-hover:text-green-400 transition-colors">{title}</div>
      <div className="text-xs text-gray-400 mt-1">{desc}</div>
      <ArrowRight size={14} className="mt-3 text-gray-600 group-hover:text-green-400 transition-colors" />
    </Link>
  );
}

function TipCard({ device, profit, difficulty, roi }: { device: string; profit: string; difficulty: string; roi: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="text-sm font-medium text-white">{device}</div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">{profit} profit</span>
        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{difficulty}</span>
      </div>
      <div className="text-xs text-gray-400 mt-1">ROI: {roi}</div>
    </div>
  );
}
