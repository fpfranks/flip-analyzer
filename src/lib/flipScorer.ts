import { priceDatabase } from "./priceDatabase";

export type RiskLevel = "low" | "medium" | "high" | "extreme";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

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
  roiMin: number;
  roiMax: number;
  roiEstimate: number;
  worstCaseLoss: number;
  difficulty: DifficultyLevel;
  risk: RiskLevel;
  flipScore: number;
  recommendedAction: "BUY" | "NEGOTIATE" | "AVOID" | "WATCH";
  flags: string[];
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

function detectFault(description: string): { repairMin: number; repairMax: number; difficulty: DifficultyLevel; risk: RiskLevel; notes: string } {
  const lower = description.toLowerCase();
  for (const [keyword, data] of Object.entries(faultMappings)) {
    if (lower.includes(keyword)) return data;
  }
  return { repairMin: 15, repairMax: 60, difficulty: "intermediate", risk: "medium", notes: "Unknown fault. Inspect before committing to repair." };
}

function findBestPrice(deviceQuery: string): { cexCash: number; cexVoucher: number; ebayAvg: number; fbAvg: number; demand: string } | null {
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

  const bestSell = Math.max(cexCash, ebayAvg, fbAvg);
  const bestPlatform = bestSell === ebayAvg ? "eBay" : bestSell === fbAvg ? "Facebook Marketplace" : "CEX";

  const profitMin = bestSell - totalMax;
  const profitMax = bestSell - totalMin;
  const profitEst = bestSell - totalEst;

  const roiMin = totalMax > 0 ? Math.round((profitMin / totalMax) * 100) : 0;
  const roiMax = totalMin > 0 ? Math.round((profitMax / totalMin) * 100) : 0;
  const roiEst = totalEst > 0 ? Math.round((profitEst / totalEst) * 100) : 0;

  const worstCase = buyPrice + fault.repairMax;

  const flipScore = calcFlipScore(profitEst, roiEst, fault.risk, fault.difficulty);

  const flags: string[] = [];
  if (faultDescription.toLowerCase().includes("untested")) flags.push("UNTESTED — hidden faults possible");
  if (fault.risk === "extreme") flags.push("EXTREME RISK — water/liquid damage");
  if (faultDescription.toLowerCase().includes("face id")) flags.push("Face ID broken — unrepairable without Apple");
  if (profitEst >= 50 && fault.risk === "low") flags.push("HIGH PROFIT + LOW RISK — strong buy");
  if (fault.difficulty === "beginner") flags.push("BEGINNER FRIENDLY repair");
  if (accessories && accessories.toLowerCase().includes("box")) flags.push("Comes with box — adds resale value");
  if (buyPrice < 10) flags.push("VERY CHEAP — worth the risk even if repair fails");

  let action: FlipAnalysis["recommendedAction"] = "WATCH";
  if (flipScore >= 7 && fault.risk !== "extreme") action = "BUY";
  else if (flipScore >= 5 && profitEst > 0) action = "NEGOTIATE";
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
    roiMin,
    roiMax,
    roiEstimate: roiEst,
    worstCaseLoss: worstCase,
    difficulty: fault.difficulty,
    risk: fault.risk,
    flipScore,
    recommendedAction: action,
    flags,
    repairNotes: fault.notes,
    demand: prices?.demand ?? "unknown",
  };
}
