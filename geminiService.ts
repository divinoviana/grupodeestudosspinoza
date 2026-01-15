
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "AIzaSyBo_bmFG3GEYD3j5vKkHmKw7S5WDfmN7kM" });

export const askSpinozaAI = async (prompt: string, context: string = "") => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é um assistente acadêmico especialista no pensamento de Baruch Spinoza para o Grupo de Estudos Spinoza do Prof. Divino Viana. 
      Ajude o usuário com revisões, dicas de leitura ou esclarecendo conceitos de Ética, Ontologia, Política, etc. 
      Contexto opcional: ${context}. 
      Pergunta do usuário: ${prompt}`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    return response.text || "Desculpe, não consegui processar sua solicitação no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao conectar com a IA de Spinoza.";
  }
};
