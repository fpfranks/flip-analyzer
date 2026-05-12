export type Condition = "working" | "faulty" | "good" | "fair" | "poor";

export interface PriceEntry {
  device: string;
  model: string;
  cexCash: number;
  cexVoucher: number;
  ebayAvg: number;
  fbAvg: number;
  demand: "very high" | "high" | "medium" | "low";
}

export const priceDatabase: PriceEntry[] = [
  // Nintendo Switch
  { device: "Nintendo Switch", model: "Switch OG (2017-2019)", cexCash: 90, cexVoucher: 110, ebayAvg: 130, fbAvg: 110, demand: "high" },
  { device: "Nintendo Switch", model: "Switch V2 (2019+)", cexCash: 110, cexVoucher: 135, ebayAvg: 155, fbAvg: 130, demand: "high" },
  { device: "Nintendo Switch", model: "Switch OLED", cexCash: 175, cexVoucher: 210, ebayAvg: 230, fbAvg: 210, demand: "very high" },
  { device: "Nintendo Switch", model: "Switch Lite", cexCash: 70, cexVoucher: 85, ebayAvg: 100, fbAvg: 85, demand: "medium" },
  // Joy-Cons
  { device: "Joy-Con", model: "Joy-Con Pair (any colour)", cexCash: 35, cexVoucher: 45, ebayAvg: 55, fbAvg: 45, demand: "very high" },
  { device: "Joy-Con", model: "Joy-Con Single", cexCash: 18, cexVoucher: 22, ebayAvg: 28, fbAvg: 22, demand: "high" },
  // PlayStation
  { device: "PS5", model: "PS5 Disc Edition", cexCash: 300, cexVoucher: 360, ebayAvg: 390, fbAvg: 360, demand: "very high" },
  { device: "PS5", model: "PS5 Digital Edition", cexCash: 250, cexVoucher: 300, ebayAvg: 330, fbAvg: 300, demand: "very high" },
  { device: "PS5 Controller", model: "DualSense", cexCash: 35, cexVoucher: 45, ebayAvg: 55, fbAvg: 45, demand: "very high" },
  { device: "PS5 Controller", model: "DualSense Edge", cexCash: 90, cexVoucher: 110, ebayAvg: 130, fbAvg: 115, demand: "high" },
  // Xbox
  { device: "Xbox Series X", model: "Xbox Series X", cexCash: 250, cexVoucher: 300, ebayAvg: 330, fbAvg: 300, demand: "high" },
  { device: "Xbox Series S", model: "Xbox Series S", cexCash: 150, cexVoucher: 180, ebayAvg: 200, fbAvg: 180, demand: "high" },
  { device: "Xbox Controller", model: "Xbox Series Controller", cexCash: 25, cexVoucher: 32, ebayAvg: 40, fbAvg: 35, demand: "high" },
  { device: "Xbox Controller", model: "Xbox Elite Series 2", cexCash: 70, cexVoucher: 85, ebayAvg: 100, fbAvg: 90, demand: "medium" },
  // Steam Deck
  { device: "Steam Deck", model: "Steam Deck 64GB LCD", cexCash: 200, cexVoucher: 240, ebayAvg: 270, fbAvg: 250, demand: "high" },
  { device: "Steam Deck", model: "Steam Deck 256GB LCD", cexCash: 230, cexVoucher: 275, ebayAvg: 310, fbAvg: 280, demand: "high" },
  { device: "Steam Deck", model: "Steam Deck OLED 512GB", cexCash: 320, cexVoucher: 385, ebayAvg: 420, fbAvg: 390, demand: "very high" },
  // iPhones
  { device: "iPhone", model: "iPhone 12", cexCash: 90, cexVoucher: 110, ebayAvg: 130, fbAvg: 110, demand: "high" },
  { device: "iPhone", model: "iPhone 13", cexCash: 140, cexVoucher: 170, ebayAvg: 195, fbAvg: 170, demand: "very high" },
  { device: "iPhone", model: "iPhone 14", cexCash: 200, cexVoucher: 240, ebayAvg: 270, fbAvg: 245, demand: "very high" },
  { device: "iPhone", model: "iPhone 15", cexCash: 280, cexVoucher: 335, ebayAvg: 370, fbAvg: 340, demand: "very high" },
  { device: "iPhone", model: "iPhone 15 Pro", cexCash: 380, cexVoucher: 455, ebayAvg: 500, fbAvg: 460, demand: "very high" },
  // iPads
  { device: "iPad", model: "iPad 9th Gen", cexCash: 100, cexVoucher: 120, ebayAvg: 140, fbAvg: 120, demand: "high" },
  { device: "iPad", model: "iPad 10th Gen", cexCash: 160, cexVoucher: 195, ebayAvg: 220, fbAvg: 195, demand: "high" },
  { device: "iPad", model: "iPad Air (M1)", cexCash: 250, cexVoucher: 300, ebayAvg: 340, fbAvg: 310, demand: "high" },
  { device: "iPad", model: "iPad Pro 11\" (M2)", cexCash: 400, cexVoucher: 480, ebayAvg: 530, fbAvg: 490, demand: "very high" },
  // MacBooks
  { device: "MacBook", model: "MacBook Air M1", cexCash: 450, cexVoucher: 540, ebayAvg: 600, fbAvg: 560, demand: "very high" },
  { device: "MacBook", model: "MacBook Air M2", cexCash: 600, cexVoucher: 720, ebayAvg: 800, fbAvg: 740, demand: "very high" },
  { device: "MacBook", model: "MacBook Pro M1 13\"", cexCash: 500, cexVoucher: 600, ebayAvg: 670, fbAvg: 620, demand: "high" },
  { device: "MacBook", model: "MacBook Pro M2 14\"", cexCash: 750, cexVoucher: 900, ebayAvg: 1000, fbAvg: 930, demand: "very high" },
  // GPUs
  { device: "GPU", model: "RTX 3060", cexCash: 130, cexVoucher: 155, ebayAvg: 175, fbAvg: 155, demand: "high" },
  { device: "GPU", model: "RTX 3070", cexCash: 180, cexVoucher: 215, ebayAvg: 240, fbAvg: 220, demand: "high" },
  { device: "GPU", model: "RTX 3080", cexCash: 250, cexVoucher: 300, ebayAvg: 335, fbAvg: 310, demand: "high" },
  { device: "GPU", model: "RTX 4070", cexCash: 320, cexVoucher: 385, ebayAvg: 430, fbAvg: 400, demand: "very high" },
  { device: "GPU", model: "RX 6700 XT", cexCash: 150, cexVoucher: 180, ebayAvg: 200, fbAvg: 185, demand: "medium" },
];

export function findPrice(deviceQuery: string): PriceEntry | null {
  const q = deviceQuery.toLowerCase();
  return priceDatabase.find(p =>
    p.device.toLowerCase().includes(q) || p.model.toLowerCase().includes(q)
  ) || null;
}
