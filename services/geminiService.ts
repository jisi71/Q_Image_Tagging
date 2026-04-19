import { GoogleGenAI, Type } from "@google/genai";
import { TagResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash"; // Excellent for vision tasks and speed/cost balance

/**
 * Converts a File object to a Base64 string required by the API.
 */
const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Generates tags for a single image using Gemini.
 */
export const generateImageTags = async (file: File): Promise<TagResponse> => {
  try {
    const imagePart = await fileToPart(file);

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          imagePart,
          {
            text: `Analyze this image in detail. Instead of single keywords, generate **short natural language phrases**.
            
            **Strictly follow this order for the tags**:
            1. **Character/Identity**: Start with who or what is the subject (e.g., 'a young cyberpunk warrior', 'a cute cat').
            2. **Action/Pose**: Follow with what they are doing or their pose (e.g., 'standing confidently with sword', 'sleeping on a rug').
            3. **Details**: End with clothing, props, background, and perspective (e.g., 'wearing red armor', 'holding a glowing lantern', 'rainy neon street background', 'close-up shot').

            Ensure the translation (zh) is also a natural short phrase, not just a dictionary definition.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING, description: "The tag phrase in English" },
                  zh: { type: Type.STRING, description: "The tag phrase in Chinese" }
                },
                required: ["en", "zh"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from AI");
    }
    
    return JSON.parse(text) as TagResponse;
  } catch (error) {
    console.error("Error generating tags:", error);
    throw error;
  }
};