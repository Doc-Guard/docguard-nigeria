import { GoogleGenAI, Type } from "@google/genai";
import { Secrets } from "@/config/secrets";

let _ai: GoogleGenAI | null = null;

/**
 * Initializes and returns a singleton instance of GoogleGenAI.
 * Priorities: 1. Electron Secure Storage, 2. Local Secrets, 3. Environment Variables.
 */
const getAIInstance = async (): Promise<GoogleGenAI> => {
  if (_ai) return _ai;

  let apiKey: string | null = null;

  // Attempt to fetch from Electron secure storage if available
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

  // Fallback to local secrets
  if (!apiKey) {
    if (!Secrets.isInitialized()) {
      await Secrets.initialize();
    }
    apiKey = Secrets.GEMINI_API_KEY;
  }

  // Final fallback to Vite environment variables
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

/**
 * Generic generation wrapper with built-in retry logic and exponential backoff.
 */
const generateWithRetry = async (model: any, config: any, retries = 2): Promise<any> => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await model.generateContent(config);
    } catch (e: any) {
      if (i === retries) throw e;
      console.warn(`Gemini generation attempt ${i + 1} failed, retrying...`, e);
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};

/**
 * Analyzes a legal clause for compliance with Nigerian frameworks.
 * Supports different analysis perspectives (Borrower vs Lender).
 */
export const analyzeClause = async (
  clauseText: string,
  context: string,
  persona: 'borrower' | 'lender' | 'neutral' = 'neutral'
): Promise<AnalysisResult> => {
  try {
    const ai = await getAIInstance();
    const response = await generateWithRetry(ai.models, {
      model: "gemini-3-flash-preview",
      contents: `Analyze the following Nigerian loan documentation clause from the perspective of the **${persona.toUpperCase()}** for compliance with:
        1. LMA Nigeria Templates
        2. CAMA 2020 (Corporate and Allied Matters Act)
        3. STMA 2017 (Secured Transactions in Movable Assets Act)
        4. CBN Prudential Guidelines
        5. FCCPC 2025 Digital Lending Regulations

        Perspective Guidelines:
        - **LENDER**: Focus on risk mitigation, enforceability, perfection of security, and ease of default triggering.
        - **BORROWER**: Focus on flexibility, grace periods, materiality qualifiers, and avoiding overly restrictive covenants.
        - **NEUTRAL**: Focus on general legal compliance and standard market practice.

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

    const jsonStr = (response.text || '').trim();
    if (!jsonStr) {
      throw new Error("Model returned empty text.");
    }
    return JSON.parse(jsonStr);
  } catch (e: any) {
    console.error("Clause Analysis Error:", e);

    return {
      isCompliant: false,
      score: 0,
      flags: [e.message || "AI Service Unavailable"],
      suggestions: ["Check internet connection", "Verify API Key in Settings"],
      legalReference: "System Error"
    };
  }
};

/**
 * Analyzes portfolio-wide deadline risks.
 * Provides executive summary and severity level.
 */
export const analyzePortfolioRisks = async (
  risks: { entity: string, task: string, days: number }[]
): Promise<{ summary: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' }> => {
  try {
    const ai = await getAIInstance();
    const response = await generateWithRetry(ai.models, {
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

    const jsonStr = (response.text || '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Portfolio Analysis Error:", e);
    return { summary: "Unable to calculate risk exposure at this time.", severity: "MEDIUM" };
  }
};

/**
 * Rewrites a legal clause based on specific instructions.
 */
export const rewriteClause = async (clauseText: string, instruction: string): Promise<string> => {
  try {
    const ai = await getAIInstance();
    const response = await generateWithRetry(ai.models, {
      model: "gemini-3-flash-preview",
      contents: `Rewrite the following legal clause based on this instruction: "${instruction}".

      Original Clause: "${clauseText}"

      Return ONLY the rewritten text. Do not add quotes or markdown.`,
    });

    return (response.text || '').trim();
  } catch (e) {
    console.error("Clause Rewrite Error:", e);
    throw e;
  }
};