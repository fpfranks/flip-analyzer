import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeFlip } from "@/lib/flipScorer";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { listingText, manualInput } = await req.json();

  let deviceType = "", model = "", fault = "", buyPrice = 0, accessories = "";

  if (manualInput) {
    deviceType = manualInput.deviceType;
    model = manualInput.model;
    fault = manualInput.fault;
    buyPrice = manualInput.buyPrice;
    accessories = manualInput.accessories || "";
  } else {
    const extractPrompt = `Extract the following fields from this electronics listing. Return ONLY valid JSON, no markdown, no explanation.

Listing:
${listingText}

Return this exact JSON structure:
{
  "deviceType": "e.g. Nintendo Switch, PS5, iPhone 13, MacBook Air",
  "model": "specific model/variant if known, else empty string",
  "fault": "description of fault or condition (untested, cracked screen, stick drift, etc)",
  "buyPrice": number in GBP (just the number, no £ sign),
  "accessories": "what is included e.g. box, controllers, cables",
  "location": "city/area if mentioned",
  "cosmetic": "cosmetic condition notes"
}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: extractPrompt }],
    });

    try {
      const text = (message.content[0] as { text: string }).text.trim();
      const json = JSON.parse(text);
      deviceType = json.deviceType || "";
      model = json.model || "";
      fault = json.fault || "untested";
      buyPrice = parseFloat(json.buyPrice) || 0;
      accessories = json.accessories || "";
    } catch {
      return NextResponse.json({ error: "Could not parse listing. Try manual input." }, { status: 400 });
    }
  }

  const analysis = analyzeFlip(deviceType, model, fault, buyPrice, accessories);
  return NextResponse.json({ analysis, extracted: { deviceType, model, fault, buyPrice, accessories } });
}
