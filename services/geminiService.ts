
import { GoogleGenAI } from "@google/genai";

export const callAI = async (history: any[], prompt: string) => {
  try {
    const key = (window as any).process?.env?.API_KEY || '';
    if (!key) return "Samahani, msaidizi yuko nje ya mtandao kwa sasa.";
    
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: "Wewe ni msaidizi wa WIFI MTAANI. Jibu kwa Kiswahili cha mchanganyiko (cha mtaani na rasmi) kusaidia watu sokoni na stand. Namba ya malipo ni 0779231924 (M-PESA). Kuwa mchangamfu na msaada." }] },
        ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: prompt }] }
      ]
    });
    return response.text || "Nimeshindwa kupata jibu, jaribu tena.";
  } catch (e) { 
    console.error(e);
    return "Nimepata hitilafu, wasiliana na huduma kwa wateja kwa 0779231924."; 
  }
};
