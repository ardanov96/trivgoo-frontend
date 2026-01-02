import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const apiKey = "";

export const generateTripPlan = async (
  userStory: string,
  availableProducts: Product[]
): Promise<{ itinerary: string; recommendedProductIds: number[] }> => {
  if (!apiKey) {
    return {
      itinerary:
        "API Key is missing. Please configure the environment variable.",
      recommendedProductIds: [],
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Simplify product data to save tokens, only sending necessary fields for matching
    const productContext = availableProducts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      location: p.location,
      category:
        p.category_id === 1
          ? "Tour"
          : p.category_id === 2
          ? "Stay"
          : "Transport",
    }));

    const prompt = `
      You are an expert travel consultant for Trivgoo. 
      
      USER REQUEST: "${userStory}"

      AVAILABLE TRIVGOO SERVICES (JSON):
      ${JSON.stringify(productContext)}

      YOUR TASK:
      1. Create a detailed, engaging travel itinerary based on the user's request. Use Markdown formatting.
      2. Analyze the "AVAILABLE TRIVGOO SERVICES" list. If any service matches the user's needs (location, budget, style), you MUST recommend it.
      3. At the very end of your response, output a strict JSON array containing ONLY the IDs of the recommended products. 
      
      FORMAT:
      [Itinerary Text in Markdown]
      
      ---
      [[RECOMMENDED_IDS]]: [101, 102]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const fullText = response.text || "";

    // Parse the response to separate text and IDs
    let itinerary = fullText;
    let recommendedProductIds: number[] = [];

    const splitMarker = "[[RECOMMENDED_IDS]]:";
    if (fullText.includes(splitMarker)) {
      const parts = fullText.split(splitMarker);
      itinerary = parts[0].replace("---", "").trim(); // content before marker
      try {
        const jsonStr = parts[1].trim();
        recommendedProductIds = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse recommended IDs", e);
      }
    }

    return { itinerary, recommendedProductIds };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      itinerary:
        "An error occurred while communicating with the AI. Please try again later.",
      recommendedProductIds: [],
    };
  }
};
