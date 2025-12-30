import { GoogleGenAI, Type } from "@google/genai";
import { Secrets } from "../src/config/secrets";

let _ai: GoogleGenAI | null = null;

const getAIInstance = async (): Promise<GoogleGenAI> => {
  if (_ai) return _ai;

  let apiKey: string | null = null;

  // 1. Try Secure Storage (Electron)
  if (typeof window !== 'undefined' && window.electron && window.electron.getSecret) {
    try {
      const result = await window.electron.getSecret('GEMINI_API_KEY');
      if (result && typeof result === 'object' && 'value' in result) {
        apiKey = result.value;
      } else if (typeof result === 'string') {
        apiKey = result;
      }
    } catch (e) {
      console.warn("Failed to fetch key from secure storage:", e);
    }
  }

  // 2. Fallback to Env/Secrets (Web/Production Bundle)
  if (!apiKey) {
    // Ensure secrets are initialized
    if (!Secrets.isInitialized()) {
      await Secrets.initialize();
    }
    apiKey = Secrets.GEMINI_API_KEY;
  }

  // 3. Fallback to Vite Env (Development)
  if (!apiKey) {
    apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  }

  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please configure it in Settings > API Keys.");
  }

  _ai = new GoogleGenAI({ apiKey });
  return _ai;
};

export interface AnalysisResult {
  isCompliant: boolean;
  score: number;
  flags: string[];
  suggestions: string[];
  legalReference: string;
}

const generateWithRetry = async (model: any, config: any, retries = 2): Promise<any> => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await model.generateContent(config);
    } catch (e: any) {
      if (i === retries) throw e;
      console.warn(`Gemini generation attempt ${i + 1} failed, retrying...`, e);
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoffish
    }
  }
};

export const analyzeClause = async (clauseText: string, context: string): Promise<AnalysisResult> => {
  try {
    const ai = await getAIInstance();
    const response = await generateWithRetry(ai.models, {
      model: "gemini-2.0-flash-exp", // Updated to latest stable experimental
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

    // Access response.text directly (it's a property, not a method) as per guidelines.
    const jsonStr = (response.text || '').trim();
    if (!jsonStr) {
      throw new Error("Model returned empty text.");
    }
    return JSON.parse(jsonStr);
  } catch (e: any) {
    console.error("Failed to parse AI response or API error", e);

    // Return a structured error response instead of crashing
    return {
      isCompliant: false,
      score: 0,
      flags: [e.message || "AI Service Unavailable"],
      suggestions: ["Check internet connection", "Verify API Key in Settings"],
      legalReference: "System Error"
    };
  }
};

export const analyzePortfolioRisks = async (risks: { entity: string, task: string, days: number }[]): Promise<{ summary: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' }> => {
  try {
    const ai = await getAIInstance();
    const response = await generateWithRetry(ai.models, {
      model: "gemini-2.0-flash-exp",
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

    const jsonStr = (response.text || '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    return { summary: "Unable to calculate risk exposure at this time.", severity: "MEDIUM" };
  }
};

export const rewriteClause = async (clauseText: string, instruction: string): Promise<string> => {
  const ai = await getAIInstance();
  const response = await generateWithRetry(ai.models, {
    model: "gemini-2.0-flash-exp",
    contents: `Rewrite the following legal clause based on this instruction: "${instruction}".
    
    Original Clause: "${clauseText}"
    
    Return ONLY the rewritten text. Do not add quotes or markdown.`,
  });

  return (response.text || '').trim();
};