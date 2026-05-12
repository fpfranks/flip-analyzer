import { priceDatabase } from "./priceDatabase";

export type RiskLevel = "low" | "medium" | "high" | "extreme";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export const PLATFORM_FEES: Record<string, number> = {
  "eBay": 0.128,         // 12.8% managed payments fee
  "Vinted": 0.05,        // 5% + buyer protection (absorbed by buyer, but affects perception)
  "Facebook Marketplace": 0,
  "CEX": 0,
};

export interface PlatformProfit {
  platform: string;
  grossSell: number;
  fee: number;
  netProfit: number;
  netRoi: number;
}

export interface FlipAnalysis {
  deviceType: string;
  model: string;
  faultDescription: string;
  buyPrice: number;
  repairCostMin: number;
  repairCostMax: number;
  repairCostEstimate: number;
  totalInvestmentMin: number;
  totalInvestmentMax: number;
  totalInvestmentEstimate: number;
  cexCash: number;
  cexVoucher: number;
  ebayAvg: number;
  fbAvg: number;
  bestSellPrice: number;
  bestPlatform: string;
  profitMin: number;
  profitMax: number;
  profitEstimate: number;
  profitAfterFees: number;
  roiMin: number;
  roiMax: number;
  roiEstimate: number;
  roiAfterFees: number;
  platformBreakdown: PlatformProfit[];
  worstCaseLoss: number;
  difficulty: DifficultyLevel;
  risk: RiskLevel;
  flipScore: number;
  recommendedAction: "BUY" | "NEGOTIATE" | "AVOID" | "WATCH";
  flags: string[];
  scamFlags: string[];
  repairNotes: string;
  demand: string;
}

const faultMappings: Record<string, { repairMin: number; repairMax: number; difficulty: DifficultyLevel; risk: RiskLevel; notes: string }> = {
  "stick drift": { repairMin: 2, repairMax: 8, difficulty: "beginner", risk: "low", notes: "Replace analog stick module. Very common, easy profit." },
  "drift": { repairMin: 2, repairMax: 8, difficulty: "beginner", risk: "low", notes: "Replace analog stick module." },
  "battery": { repairMin: 8, repairMax: 25, difficulty: "beginner", risk: "low", notes: "Straight battery swap. High success rate." },
  "won't charge": { repairMin: 10, repairMax: 40, difficulty: "intermediate", risk: "medium", notes: "Could be port, cable, or charging IC. Test port first." },
  "not charging": { repairMin: 10, repairMax: 40, difficulty: "intermediate", risk: "medium", notes: "Check port for damage before ordering parts." },
  "cracked screen": { repairMin: 20, repairMax: 80, difficulty: "intermediate", risk: "medium", notes: "Screen swap. Profit margin depends on glass cost." },
  "broken screen": { repairMin: 20, repairMax: 80, difficulty: "intermediate", risk: "medium", notes: "Screen replacement. Research OEM vs aftermarket price." },
  "smashed screen": { repairMin: 20, repairMax: 80, difficulty: "intermediate", risk: "medium", notes: "Screen replacement needed." },
  "no display": { repairMin: 20, repairMax: 100, difficulty: "advanced", risk: "high", notes: "Could be screen, cable, or GPU fault. Test cable first." },
  "no power": { repairMin: 15, repairMax: 80, difficulty: "advanced", risk: "high", notes: "High risk — could be minor (fuse) or major (motherboard). Avoid unless cheap." },
  "won't turn on": { repairMin: 15, repairMax: 80, difficulty: "advanced", risk: "high", notes: "Try SMC reset first. Could be battery or logic board." },
  "dead": { repairMin: 15, repairMax: 80, difficulty: "advanced", risk: "high", notes: "Unknown cause. High risk unless very cheap." },
  "hdmi": { repairMin: 20, repairMax: 60, difficulty: "advanced", risk: "high", notes: "HDMI port or chip fault. Requires soldering skills." },
  "overheating": { repairMin: 3, repairMax: 15, difficulty: "beginner", risk: "low", notes: "Usually just dust + thermal paste. Easy win." },
  "fan": { repairMin: 5, repairMax: 30, difficulty: "beginner", risk: "low", notes: "Fan replacement. Simple and cheap." },
  "water damage": { repairMin: 20, repairMax: 150, difficulty: "expert", risk: "extreme", notes: "EXTREME RISK. Corrosion spreads. Only buy if near free." },
  "liquid damage": { repairMin: 20, repairMax: 150, difficulty: "expert", risk: "extreme", notes: "EXTREME RISK. Avoid unless you have ultrasonic cleaner." },
  "spill": { repairMin: 20, repairMax: 150, difficulty: "expert", risk: "extreme", notes: "Liquid ingress. Unpredictable outcome." },
  "disc not reading": { repairMin: 10, repairMax: 50, difficulty: "intermediate", risk: "medium", notes: "Laser lens or drive unit. Usually fixable." },
  "disc": { repairMin: 10, repairMax: 50, difficulty: "intermediate", risk: "medium", notes: "Disc drive fault." },
  "usb-c": { repairMin: 5, repairMax: 30, difficulty: "intermediate", risk: "medium", notes: "USB-C port replacement. Common and profitable." },
  "charging port": { repairMin: 5, repairMax: 30, difficulty: "intermediate", risk: "medium", notes: "Port swap. Good beginner repair." },
  "untested": { repairMin: 10, repairMax: 80, difficulty: "intermediate", risk: "medium", notes: "Unknown fault. Negotiate hard. Test before committing to repair." },
  "spares or repairs": { repairMin: 10, repairMax: 100, difficulty: "intermediate", risk: "high", notes: "Parts listing. Could be any fault." },
  "for parts": { repairMin: 10, repairMax: 100, difficulty: "intermediate", risk: "high", notes: "Parts listing. Research what's salvageable." },
  "face id": { repairMin: 0, repairMax: 200, difficulty: "expert", risk: "extreme", notes: "Face ID is paired to motherboard. Cannot be repaired with aftermarket parts. AVOID." },
  "touch id": { repairMin: 0, repairMax: 80, difficulty: "expert", risk: "high", notes: "Touch ID home button is paired. Replacement loses fingerprint function." },
  "keyboard": { repairMin: 10, repairMax: 80, difficulty: "intermediate", risk: "medium", notes: "Key replacement or full keyboard swap. Check butterfly vs scissor model." },
};

function detectFault(description: string) {
  const lower = description.toLowerCase();
  for (const [keyword, data] of Object.entries(faultMappings)) {
    if (lower.includes(keyword)) return data;
  }
  return { repairMin: 15, repairMax: 60, difficulty: "intermediate" as DifficultyLevel, risk: "medium" as RiskLevel, notes: "Unknown fault. Inspect before committing to repair." };
}

function detectScamFlags(description: string, buyPrice: number, marketPrice: number): string[] {
  const flags: string[] = [];
  const lower = description.toLowerCase();
  if (lower.includes("no returns") && lower.includes("untested")) flags.push("No returns + untested — zero recourse if it's junk");
  if (lower.includes("sold as seen") || lower.includes("as is")) flags.push("'Sold as seen' — no recourse if faulty beyond description");
  if (lower.includes("can't test") || lower.includes("cannot test") || lower.includes("no way to test")) flags.push("Seller claims they can't test it — suspicious, demand photos of power on");
  if (lower.includes("collection only") && buyPrice < 30) flags.push("Collection only + very cheap — verify it works before handing over cash");
  if (lower.includes("urgent") || lower.includes("moving") || lower.includes("quick sale")) flags.push("'Urgent sale' pressure — common in scam listings, don't rush");
  if (marketPrice > 0 && buyPrice < marketPrice * 0.3) flags.push(`Price ${Math.round((buyPrice / marketPrice) * 100)}% of market value — suspiciously cheap, may be stolen or worse than described`);
  if (lower.includes("no box") && lower.includes("no charger") && lower.includes("no accessories")) flags.push("No accessories at all — stripped item, check IMEI/serial not blocked");
  if (lower.includes("icloud") || lower.includes("find my") || lower.includes("activation lock")) flags.push("iCloud / Activation Lock mentioned — DO NOT BUY unless you can verify it's unlocked");
  if (lower.includes("network locked") || lower.includes("carrier locked")) flags.push("Network locked device — check unlock cost before buying");
  return flags;
}

function findBestPrice(deviceQuery: string) {
  const q = deviceQuery.toLowerCase();
  const entry = priceDatabase.find(p =>
    p.device.toLowerCase().includes(q) ||
    p.model.toLowerCase().includes(q) ||
    q.includes(p.device.toLowerCase()) ||
    q.includes(p.model.toLowerCase().split(" ")[0])
  );
  return entry ? { cexCash: entry.cexCash, cexVoucher: entry.cexVoucher, ebayAvg: entry.ebayAvg, fbAvg: entry.fbAvg, demand: entry.demand } : null;
}

function calcFlipScore(profit: number, roi: number, risk: RiskLevel, difficulty: DifficultyLevel): number {
  let score = 5;
  if (profit >= 80) score += 2;
  else if (profit >= 40) score += 1;
  else if (profit < 10) score -= 2;
  if (roi >= 100) score += 2;
  else if (roi >= 50) score += 1;
  else if (roi < 20) score -= 1;
  if (risk === "low") score += 1;
  else if (risk === "high") score -= 1;
  else if (risk === "extreme") score -= 3;
  if (difficulty === "beginner") score += 1;
  else if (difficulty === "expert") score -= 1;
  return Math.max(1, Math.min(10, score));
}

export function calcRequiredSellPrice(buyPrice: number, repairCost: number, targetRoi: number, platform: string): number {
  const fee = PLATFORM_FEES[platform] ?? 0;
  const total = buyPrice + repairCost;
  const requiredNet = total * (1 + targetRoi / 100);
  return Math.ceil(requiredNet / (1 - fee));
}

export function calcRoiFromSellPrice(buyPrice: number, repairCost: number, sellPrice: number, platform: string): number {
  const fee = PLATFORM_FEES[platform] ?? 0;
  const total = buyPrice + repairCost;
  const net = sellPrice * (1 - fee) - total;
  return total > 0 ? Math.round((net / total) * 100) : 0;
}

export function analyzeFlip(
  deviceType: string,
  model: string,
  faultDescription: string,
  buyPrice: number,
  accessories?: string
): FlipAnalysis {
  const fault = detectFault(faultDescription);
  const prices = findBestPrice(`${deviceType} ${model}`);

  const repairMid = Math.round((fault.repairMin + fault.repairMax) / 2);
  const totalMin = buyPrice + fault.repairMin;
  const totalMax = buyPrice + fault.repairMax;
  const totalEst = buyPrice + repairMid;

  const cexCash = prices?.cexCash ?? 0;
  const cexVoucher = prices?.cexVoucher ?? 0;
  const ebayAvg = prices?.ebayAvg ?? 0;
  const fbAvg = prices?.fbAvg ?? 0;

  // Platform breakdown with fees
  const platformBreakdown: PlatformProfit[] = [
    { platform: "eBay", grossSell: ebayAvg, fee: Math.round(ebayAvg * PLATFORM_FEES["eBay"]), netProfit: Math.round(ebayAvg * (1 - PLATFORM_FEES["eBay"]) - totalEst), netRoi: totalEst > 0 ? Math.round(((ebayAvg * (1 - PLATFORM_FEES["eBay"]) - totalEst) / totalEst) * 100) : 0 },
    { platform: "Facebook Marketplace", grossSell: fbAvg, fee: 0, netProfit: fbAvg - totalEst, netRoi: totalEst > 0 ? Math.round(((fbAvg - totalEst) / totalEst) * 100) : 0 },
    { platform: "CEX Cash", grossSell: cexCash, fee: 0, netProfit: cexCash - totalEst, netRoi: totalEst > 0 ? Math.round(((cexCash - totalEst) / totalEst) * 100) : 0 },
    { platform: "CEX Voucher", grossSell: cexVoucher, fee: 0, netProfit: cexVoucher - totalEst, netRoi: totalEst > 0 ? Math.round(((cexVoucher - totalEst) / totalEst) * 100) : 0 },
  ].filter(p => p.grossSell > 0).sort((a, b) => b.netProfit - a.netProfit);

  const bestPlatformEntry = platformBreakdown[0];
  const bestSell = bestPlatformEntry?.grossSell ?? 0;
  const bestPlatform = bestPlatformEntry?.platform ?? "Unknown";
  const profitAfterFees = bestPlatformEntry?.netProfit ?? 0;
  const roiAfterFees = bestPlatformEntry?.netRoi ?? 0;

  const profitMin = bestSell - totalMax;
  const profitMax = bestSell - totalMin;
  const profitEst = bestSell - totalEst;

  const roiMin = totalMax > 0 ? Math.round((profitMin / totalMax) * 100) : 0;
  const roiMax = totalMin > 0 ? Math.round((profitMax / totalMin) * 100) : 0;
  const roiEst = totalEst > 0 ? Math.round((profitEst / totalEst) * 100) : 0;

  const flipScore = calcFlipScore(profitAfterFees, roiAfterFees, fault.risk, fault.difficulty);

  const flags: string[] = [];
  if (fault.risk === "extreme") flags.push("EXTREME RISK — water/liquid damage");
  if (faultDescription.toLowerCase().includes("face id")) flags.push("Face ID broken — unrepairable without Apple");
  if (profitAfterFees >= 50 && fault.risk === "low") flags.push("HIGH PROFIT + LOW RISK — strong buy");
  if (fault.difficulty === "beginner") flags.push("BEGINNER FRIENDLY repair");
  if (accessories && accessories.toLowerCase().includes("box")) flags.push("Comes with box — adds resale value");
  if (buyPrice < 10) flags.push("VERY CHEAP — worth the risk even if repair fails");
  if (faultDescription.toLowerCase().includes("untested")) flags.push("UNTESTED — inspect in person before agreeing price");

  const scamFlags = detectScamFlags(faultDescription, buyPrice, bestSell);

  let action: FlipAnalysis["recommendedAction"] = "WATCH";
  if (scamFlags.some(f => f.includes("iCloud"))) action = "AVOID";
  else if (flipScore >= 7 && fault.risk !== "extreme") action = "BUY";
  else if (flipScore >= 5 && profitAfterFees > 0) action = "NEGOTIATE";
  else if (fault.risk === "extreme" || flipScore <= 3) action = "AVOID";

  return {
    deviceType,
    model,
    faultDescription,
    buyPrice,
    repairCostMin: fault.repairMin,
    repairCostMax: fault.repairMax,
    repairCostEstimate: repairMid,
    totalInvestmentMin: totalMin,
    totalInvestmentMax: totalMax,
    totalInvestmentEstimate: totalEst,
    cexCash,
    cexVoucher,
    ebayAvg,
    fbAvg,
    bestSellPrice: bestSell,
    bestPlatform,
    profitMin,
    profitMax,
    profitEstimate: profitEst,
    profitAfterFees,
    roiMin,
    roiMax,
    roiEstimate: roiEst,
    roiAfterFees,
    platformBreakdown,
    worstCaseLoss: buyPrice + fault.repairMax,
    difficulty: fault.difficulty,
    risk: fault.risk,
    flipScore,
    recommendedAction: action,
    flags,
    scamFlags,
    repairNotes: fault.notes,
    demand: prices?.demand ?? "unknown",
  };
}
