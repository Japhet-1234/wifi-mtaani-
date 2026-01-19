
import { GoogleGenAI } from "@google/genai";

export const callAI = async (history: any[], prompt: string) => {
  try {
    const key = (window as any).process?.env?.API_KEY || '';
    if (!key) return "Samahani, msaidizi hawezi kufanya kazi bila ufunguo wa huduma.";
    
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: "Wewe ni msaidizi wa WIFI MTAANI. Jibu kwa Kiswahili kifupi na msaada. Namba ya malipo ni 0779231924 (M-PESA)." }] },
        ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: prompt }] }
      ]
    });
    return response.text || "Samahani, sijapata jibu.";
  } catch (e) { 
    console.error(e);
    return "Samahani, nimepata hitilafu kidogo."; 
  }
};
