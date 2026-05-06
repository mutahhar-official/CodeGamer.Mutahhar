import { GoogleGenAI } from "@google/genai";

// Use import.meta.env for client-side accessibility on Netlify/Vercel/etc.
const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
let genAI: GoogleGenAI | null = null;

export async function generateCode(prompt: string, language: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not defined. Please add it to your environment variables on your deployment platform (e.g., Netlify).");
  }

  if (!genAI) {
    genAI = new GoogleGenAI(apiKey);
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

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      systemInstruction: {
        role: "system",
        parts: [{ text: systemInstruction }]
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate code. Please check your connection or API key.");
  }
}
