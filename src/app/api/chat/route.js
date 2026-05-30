import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite-001',
  'gemini-2.5-flash',
];

export async function POST(req) {
  try {
    const { messages, systemContext, stream: wantStream } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Please configure your GEMINI_API_KEY in the environment variables." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const systemInstruction = systemContext ||
      "You are a helpful, expert AI assistant specializing in Indian Income Tax Returns (ITR). Provide clear, concise, and accurate tax advice.";

    let lastError = null;

    for (const modelName of FALLBACK_MODELS) {
      try {
        console.log(`[Chat API] Attempting model: ${modelName}, stream: ${!!wantStream}`);

        // ── STREAMING mode ──────────────────────────────────────────────
        if (wantStream) {
          const result = await ai.models.generateContentStream({
            model: modelName,
            contents,
            config: { systemInstruction }
          });

          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of result) {
                  // In @google/genai v2+, chunk.text is a string property
                  let text = '';
                  if (typeof chunk.text === 'string') {
                    text = chunk.text;
                  } else if (typeof chunk.text === 'function') {
                    text = chunk.text();
                  } else {
                    text = chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                  }
                  if (text) controller.enqueue(encoder.encode(text));
                }
              } catch (e) {
                console.error('[Stream] Error reading chunk:', e);
                controller.error(e);
              } finally {
                controller.close();
              }
            }
          });

          return new Response(readable, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-cache',
              'X-Accel-Buffering': 'no',
            }
          });
        }

        // ── NON-STREAMING mode (chatbot) ────────────────────────────────
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: { systemInstruction }
        });

        const replyText = typeof response.text === 'function'
          ? response.text()
          : (response.text ?? response.candidates?.[0]?.content?.parts?.[0]?.text ?? '');

        console.log(`[Chat API] OK with ${modelName}`);
        return NextResponse.json({ reply: replyText });

      } catch (err) {
        console.warn(`[Chat API] Failed with ${modelName}:`, err.message || err);
        lastError = err;
      }
    }

    console.error("[Chat API] All models exhausted:", lastError);
    return NextResponse.json(
      { reply: "Our AI is currently experiencing high traffic. Please try again in a moment." },
      { status: 429 }
    );

  } catch (error) {
    console.error("Chat API Fatal Error:", error);
    return NextResponse.json({ reply: "Sorry, something went wrong." }, { status: 500 });
  }
}
