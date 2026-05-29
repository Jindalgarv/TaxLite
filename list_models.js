import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function list() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const models = await ai.models.list();
    // In @google/genai, ai.models is not meant to list maybe? 
    // Actually the v1beta endpoint has models.list() or we can just fetch from https://generativelanguage.googleapis.com/v1beta/models?key=API_KEY
  } catch (e) {
    console.error(e);
  }
}

list();
