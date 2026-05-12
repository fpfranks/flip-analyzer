export type FlipStatus = "watching" | "bought" | "repairing" | "listed" | "sold" | "scrapped";

export interface TrackedFlip {
  id: string;
  deviceType: string;
  model: string;
  fault: string;
  buyPrice: number;
  repairCost: number;
  sellPrice?: number;
  platform?: string;
  status: FlipStatus;
  profit?: number;
  roi?: number;
  notes?: string;
  createdAt: string;
  soldAt?: string;
}

const STORAGE_KEY = "flip_tracker";

export function getFlips(): TrackedFlip[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveFlip(flip: Omit<TrackedFlip, "id" | "createdAt">): TrackedFlip {
  const flips = getFlips();
  const newFlip: TrackedFlip = {
    ...flip,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  flips.push(newFlip);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flips));
  return newFlip;
}

export function updateFlip(id: string, updates: Partial<TrackedFlip>): void {
  const flips = getFlips();
  const idx = flips.findIndex(f => f.id === id);
  if (idx === -1) return;
  flips[idx] = { ...flips[idx], ...updates };
  if (updates.sellPrice && updates.status === "sold") {
    const total = flips[idx].buyPrice + flips[idx].repairCost;
    flips[idx].profit = updates.sellPrice - total;
    flips[idx].roi = total > 0 ? Math.round((flips[idx].profit! / total) * 100) : 0;
    flips[idx].soldAt = new Date().toISOString();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flips));
}

export function deleteFlip(id: string): void {
  const flips = getFlips().filter(f => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flips));
}

export function getStats(flips: TrackedFlip[]) {
  const sold = flips.filter(f => f.status === "sold" && f.profit !== undefined);
  const active = flips.filter(f => f.status !== "sold" && f.status !== "scrapped");
  const totalProfit = sold.reduce((sum, f) => sum + (f.profit ?? 0), 0);
  const totalInvested = active.reduce((sum, f) => sum + f.buyPrice + f.repairCost, 0);
  const avgRoi = sold.length > 0 ? Math.round(sold.reduce((sum, f) => sum + (f.roi ?? 0), 0) / sold.length) : 0;
  return { totalProfit, totalInvested, avgRoi, totalSold: sold.length, activeFlips: active.length };
}
