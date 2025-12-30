import { GoogleGenAI, Type } from "@google/genai";

import { Secrets } from "../src/config/secrets";

let _ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!_ai) {
    const apiKey = Secrets.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Gemini AI not initialized: Missing API Key");
      // Fallback or handle appropriately
    }
    _ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-initialization' });
  }
  return _ai;
};

export interface AnalysisResult {
  isCompliant: boolean;
  score: number;
  flags: string[];
  suggestions: string[];
  legalReference: string;
}

export const analyzeClause = async (clauseText: string, context: string): Promise<AnalysisResult> => {
  const ai = getAI();
  // Use ai.models.generateContent to query GenAI with model and prompt simultaneously.
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following Nigerian loan documentation clause for compliance with:
    1. LMA Nigeria Templates
    2. CAMA 2020 (Corporate and Allied Matters Act)
    3. STMA 2017 (Secured Transactions in Movable Assets Act)
    4. CBN Prudential Guidelines
    5. FCCPC 2025 Digital Lending Regulations

    Clause to analyze: "${clauseText}"
    Context: ${context}

    Return a structured JSON analysis.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCompliant: { type: Type.BOOLEAN },
          score: { type: Type.NUMBER, description: 'Safety score 0-100' },
          flags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Red flags or risks'
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Recommended language improvements'
          },
          legalReference: { type: Type.STRING, description: 'Specific Act or Section referenced' }
        },
        required: ['isCompliant', 'score', 'flags', 'suggestions', 'legalReference']
      }
    }
  });

  try {
    // Access response.text directly (it's a property, not a method) as per guidelines.
    const jsonStr = (response.text || '').trim();
    if (!jsonStr) {
      throw new Error("Model returned empty text.");
    }
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {
      isCompliant: false,
      score: 0,
      flags: ["Analysis Error: Unexpected AI output format"],
      suggestions: ["Retry analysis or manually review clause"],
      legalReference: "N/A"
    };
  }
};

export const analyzePortfolioRisks = async (risks: { entity: string, task: string, days: number }[]): Promise<{ summary: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following portfolio deadline risks for a Nigerian Bank:
    ${risks.map(r => `- ${r.entity}: ${r.task} due in ${r.days} days`).join('\n')}
    
    Provide a 1-sentence executive summary of the portfolio exposure and an overall severity level.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] }
        },
        required: ['summary', 'severity']
      }
    }
  });

  try {
    const jsonStr = (response.text || '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    return { summary: "Unable to calculate risk exposure at this time.", severity: "MEDIUM" };
  }
};

export const rewriteClause = async (clauseText: string, instruction: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Rewrite the following legal clause based on this instruction: "${instruction}".
    
    Original Clause: "${clauseText}"
    
    Return ONLY the rewritten text. Do not add quotes or markdown.`,
  });

  return (response.text || '').trim();
};