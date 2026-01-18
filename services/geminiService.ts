
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (history: ChatMessage[], userPrompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { 
          role: 'user', 
          parts: [{ 
            text: "Wewe ni msaidizi wa huduma kwa wateja wa 'WIFI Mtaani'. Jibu maswali kwa Kiswahili fasaha. " +
                  "Huduma yetu inapatikana masokoni na mitaani. Vifurushi vyetu ni: " +
                  "1. Masaa 6 unlimited kwa TZS 500. " +
                  "2. Siku nzima unlimited kwa TZS 1,000. " +
                  "3. Wiki nzima unlimited kwa TZS 6,000. " +
                  "Tunapokea njia ZOTE za malipo ya simu Tanzania (M-Pesa, Tigo-Pesa, Airtel Money, HaloPesa, AzamPesa). " +
                  "Namba rasmi ya kupokelea malipo ni 0779231924. " +
                  "Mteja akitaka kununua, mwelekeze kuchagua kifurushi na kubofya 'Nunua Sasa'. " +
                  "Hakikisha unasisitiza kuwa malipo ni salama na yanakwenda kwenye namba yetu rasmi." 
          }] 
        },
        ...history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    return response.text || "Samahani, naona changamoto kidogo kwenye mfumo. Jaribu tena baadaye.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Pole, siwezi kujibu kwa sasa. Tafadhali wasiliana na huduma kwa wateja kwa namba 0779231924.";
  }
};
