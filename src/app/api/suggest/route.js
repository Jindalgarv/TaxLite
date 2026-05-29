import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const FALLBACK_MODELS = [
  'gemini-2.0-flash-lite-001',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

export async function POST(req) {
  try {
    const { step } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ suggestion: "API key is missing. Please add GEMINI_API_KEY to your .env.local file." });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let prompt = "You are a friendly, encouraging tax assistant. Provide a single, short sentence of advice or encouragement for someone filling out their Indian Income Tax Return.";
    
    if (step === 1) prompt += "\nFocus on personal details. For example: 'Make sure your name matches your PAN card exactly!'";
    if (step === 2) prompt += "\nFocus on income. For example: 'Don't forget to include interest from your savings accounts!'";
    if (step === 3) prompt += "\nFocus on deductions. Instead of quoting tax sections, just say things like 'Great job investing in your health insurance, that saves you tax!' or 'Did you know paying your children's tuition fee can lower your tax?'";

    let lastError = null;

    for (const modelName of FALLBACK_MODELS) {
      try {
        console.log(`[Suggest API] Attempting to use model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt
        });
        
        console.log(`[Suggest API] Successfully generated response using ${modelName}`);
        return NextResponse.json({ suggestion: response.text });
        
      } catch (err) {
        console.warn(`[Suggest API] Failed with model ${modelName}:`, err.message || err);
        lastError = err;
      }
    }

    console.error("[Suggest API] All fallback models exhausted. Last error:", lastError);
    return NextResponse.json({ suggestion: "We are currently experiencing high traffic. Please proceed without AI suggestions." });

  } catch (error) {
    console.error("Suggest API Error:", error);
    return NextResponse.json({ suggestion: "Unable to generate suggestion at this time." });
  }
}
