
import { GoogleGenAI, Type } from "@google/genai";
import { Todo, AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async optimizeTasks(todos: Todo[]): Promise<AIResponse> {
    if (todos.length === 0) {
      return { optimizedTasks: [], summary: "No tasks to optimize." };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these tasks and suggest priorities (low, medium, high) based on the content and common productivity best practices. 
      Tasks: ${JSON.stringify(todos.map(t => ({ id: t.id, text: t.text })))}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  suggestedPriority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                  reasoning: { type: Type.STRING }
                },
                required: ["id", "suggestedPriority", "reasoning"]
              }
            },
            summary: { type: Type.STRING }
          },
          required: ["optimizedTasks", "summary"]
        }
      }
    });

    try {
      return JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Failed to parse AI response", e);
      throw new Error("Failed to optimize tasks with AI.");
    }
  }
};
