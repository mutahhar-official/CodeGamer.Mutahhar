import { GoogleGenAI } from "@google/genai";

// Use import.meta.env for build-time keys, or localStorage for session-based keys
const getApiKey = () => {
  let key = '';
  try {
    key = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_session_key') || '';
  } catch (e) {
    key = import.meta.env.VITE_GEMINI_API_KEY || '';
  }
  
  // Clean up potential "placeholder strings" that CI/CD or users might inject
  const cleaned = key.trim();
  if (cleaned === 'undefined' || cleaned === 'null' || !cleaned) {
    return '';
  }
  return cleaned;
};
let genAI: GoogleGenAI | null = null;
let currentKey: string | null = null;

export async function generateCode(prompt: string, language: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid Gemini API key.");
  }

  try {
    if (!genAI || currentKey !== apiKey) {
      // Clear previous instance
      genAI = null;
      genAI = new GoogleGenAI({ apiKey });
      currentKey = apiKey;
    }

    const systemInstruction = `You are CodeGamer, a professional multi-language Code Generation AI Agent. 
Your goal is to convert user instructions into correct, clean, and executable code in the requested programming language: ${language}.

Strictly follow this output format:
1. Briefly restate the interpreted requirement in simple terms.
2. Provide the complete working code in a properly formatted markdown code block with the correct language tag.
3. Provide a short explanation of how the solution works.

Principles:
- Correctness, readability, efficiency, and proper structure.
- Meaningful variable names and proper indentation.
- Stateless operation: assume no prior context.
- Choose the most efficient/practical approach.`;

    const response = await genAI.models.generateContent({ 
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    
    const text = response.text;
    
    if (!text) {
      throw new Error("The AI returned an empty response. Please try a different prompt.");
    }
    
    return text;
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    
    const message = error?.message || String(error);
    
    if (message.includes("API key not valid") || message.includes("403")) {
      throw new Error("The API key provided is invalid. Please check it and try again.");
    }
    
    if (message.includes("API Key must be set")) {
      throw new Error("API Key is missing or incorrectly set. Please reconnect your API key.");
    }
    
    throw new Error(`AI generation failed: ${message}`);
  }
}
