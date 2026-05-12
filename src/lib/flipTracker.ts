export type FlipStatus = "watching" | "bought" | "repairing" | "listed" | "sold" | "scrapped";

export interface RepairLogEntry {
  id: string;
  date: string;
  note: string;
  cost?: number;
}

export interface PartOrder {
  id: string;
  name: string;
  supplier: string;
  cost: number;
  status: "ordered" | "arrived" | "used" | "returned";
  orderedAt: string;
  arrivedAt?: string;
}

export interface TrackedFlip {
  id: string;
  deviceType: string;
  model: string;
  fault: string;
  buyPrice: number;
  repairCost: number;
  actualRepairCost?: number;
  sellPrice?: number;
  platform?: string;
  status: FlipStatus;
  profit?: number;
  roi?: number;
  notes?: string;
  repairLog: RepairLogEntry[];
  parts: PartOrder[];
  createdAt: string;
  soldAt?: string;
  boughtAt?: string;
}

const STORAGE_KEY = "flip_tracker";

export function getFlips(): TrackedFlip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    // migrate old entries that lack repairLog/parts
    return raw.map((f: TrackedFlip) => ({
      ...f,
      repairLog: f.repairLog ?? [],
      parts: f.parts ?? [],
    }));
  } catch {
    return [];
  }
}

export function saveFlip(flip: Omit<TrackedFlip, "id" | "createdAt" | "repairLog" | "parts">): TrackedFlip {
  const flips = getFlips();
  const newFlip: TrackedFlip = {
    ...flip,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    boughtAt: flip.status === "bought" ? new Date().toISOString() : undefined,
    repairLog: [],
    parts: [],
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
  if (updates.sellPrice !== undefined && updates.status === "sold") {
    const partsCost = flips[idx].parts.filter(p => p.status === "used").reduce((s, p) => s + p.cost, 0);
    const totalRepair = flips[idx].actualRepairCost ?? flips[idx].repairCost + partsCost;
    const total = flips[idx].buyPrice + totalRepair;
    flips[idx].profit = Math.round((updates.sellPrice - total) * 100) / 100;
    flips[idx].roi = total > 0 ? Math.round((flips[idx].profit! / total) * 100) : 0;
    flips[idx].soldAt = new Date().toISOString();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flips));
}

export function addRepairLog(flipId: string, note: string, cost?: number): void {
  const flips = getFlips();
  const idx = flips.findIndex(f => f.id === flipId);
  if (idx === -1) return;
  flips[idx].repairLog.push({ id: Date.now().toString(), date: new Date().toISOString(), note, cost });
  if (cost) {
    flips[idx].actualRepairCost = (flips[idx].actualRepairCost ?? 0) + cost;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flips));
}

export function deleteRepairLog(flipId: string, logId: string): void {
  const flips = getFlips();
  const idx = flips.findIndex(f => f.id === flipId);
  if (idx === -1) return;
  const entry = flips[idx].repairLog.find(r => r.id === logId);
  if (entry?.cost) flips[idx].actualRepairCost = Math.max(0, (flips[idx].actualRepairCost ?? 0) - entry.cost);
  flips[idx].repairLog = flips[idx].repairLog.filter(r => r.id !== logId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flips));
}

export function addPart(flipId: string, part: Omit<PartOrder, "id" | "orderedAt">): void {
  const flips = getFlips();
  const idx = flips.findIndex(f => f.id === flipId);
  if (idx === -1) return;
  flips[idx].parts.push({ ...part, id: Date.now().toString(), orderedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flips));
}

export function updatePart(flipId: string, partId: string, updates: Partial<PartOrder>): void {
  const flips = getFlips();
  const idx = flips.findIndex(f => f.id === flipId);
  if (idx === -1) return;
  const pIdx = flips[idx].parts.findIndex(p => p.id === partId);
  if (pIdx === -1) return;
  flips[idx].parts[pIdx] = { ...flips[idx].parts[pIdx], ...updates };
  if (updates.status === "arrived") flips[idx].parts[pIdx].arrivedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flips));
}

export function deletePart(flipId: string, partId: string): void {
  const flips = getFlips();
  const idx = flips.findIndex(f => f.id === flipId);
  if (idx === -1) return;
  flips[idx].parts = flips[idx].parts.filter(p => p.id !== partId);
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
  const bestFlip = sold.reduce((best, f) => (f.profit ?? 0) > (best?.profit ?? 0) ? f : best, null as TrackedFlip | null);
  return { totalProfit, totalInvested, avgRoi, totalSold: sold.length, activeFlips: active.length, bestFlip };
}

export function exportToCsv(flips: TrackedFlip[]): string {
  const headers = ["Device", "Model", "Fault", "Status", "Buy Price", "Repair Cost", "Actual Repair", "Sell Price", "Profit", "ROI %", "Platform", "Date Bought", "Date Sold", "Notes"];
  const rows = flips.map(f => [
    f.deviceType, f.model, f.fault, f.status,
    f.buyPrice, f.repairCost, f.actualRepairCost ?? "",
    f.sellPrice ?? "", f.profit ?? "", f.roi ?? "",
    f.platform ?? "", f.boughtAt ? new Date(f.boughtAt).toLocaleDateString() : "",
    f.soldAt ? new Date(f.soldAt).toLocaleDateString() : "", f.notes ?? ""
  ]);
  return [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
}

export function getProfitTimeline(flips: TrackedFlip[]): { date: string; profit: number; cumulative: number }[] {
  const sold = flips
    .filter(f => f.status === "sold" && f.soldAt && f.profit !== undefined)
    .sort((a, b) => new Date(a.soldAt!).getTime() - new Date(b.soldAt!).getTime());
  let cumulative = 0;
  return sold.map(f => {
    cumulative += f.profit ?? 0;
    return { date: new Date(f.soldAt!).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), profit: f.profit ?? 0, cumulative: Math.round(cumulative * 100) / 100 };
  });
}
