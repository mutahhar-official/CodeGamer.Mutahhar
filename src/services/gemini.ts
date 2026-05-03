import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCode(prompt: string, language: string) {
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
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate code. Please check your connection or API key.");
  }
}
