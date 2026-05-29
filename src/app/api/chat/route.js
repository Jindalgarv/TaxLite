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
    const { messages, systemContext } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ reply: "Please configure your GEMINI_API_KEY in the environment variables." });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Map messages to Gemini's expected format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    let lastError = null;

    // Try each model in the fallback array
    for (const modelName of FALLBACK_MODELS) {
      try {
        console.log(`[Chat API] Attempting to use model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemContext || "You are a helpful, expert AI assistant specializing in Indian Income Tax Returns (ITR). Provide clear, concise, and accurate tax advice and step-by-step guidance."
          }
        });
        
        console.log(`[Chat API] Successfully generated response using ${modelName}`);
        return NextResponse.json({ reply: response.text });
        
      } catch (err) {
        console.warn(`[Chat API] Failed with model ${modelName}:`, err.message || err);
        lastError = err;
        // Continue to the next model in the loop
      }
    }

    // If we've exhausted all models, return an error
    console.error("[Chat API] All fallback models exhausted. Last error:", lastError);
    return NextResponse.json(
      { reply: "Our AI is currently experiencing high traffic (Rate Limits). Please try again in a minute." }, 
      { status: 429 }
    );

  } catch (error) {
    console.error("Chat API Fatal Error:", error);
    return NextResponse.json({ reply: "Sorry, I encountered an error while processing your request." }, { status: 500 });
  }
}
