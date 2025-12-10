
import { GoogleGenAI, Type } from "@google/genai";
import { Message, NutritionPlan, GroceryItem, FormAnalysis } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Chat with the Coach.
 */
export const chatWithCoach = async (
  history: Message[],
  newMessage: string,
  isDeepThink: boolean,
  language: 'en' | 'cs'
): Promise<string> => {
  try {
    const model = isDeepThink ? "gemini-3-pro-preview" : "gemini-2.5-flash";
    
    const langInstruction = language === 'cs' 
        ? "You must answer in Czech language." 
        : "You must answer in English language.";

    const config: any = {
      systemInstruction: `You are VitalFlow, an elite AI fitness coach. You are concise, encouraging, and highly technical when needed. Context: User is 30yo Male, Goal: Hypertrophy. Keep responses under 100 words unless detailed explanation is asked. ${langInstruction}`,
    };

    if (isDeepThink) {
      config.thinkingConfig = { thinkingBudget: 1024 }; 
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: newMessage }] }
      ],
      config: config
    });

    return response.text || (language === 'cs' ? "Teď nemohu přemýšlet. Zkuste to znovu." : "I'm having trouble thinking right now. Try again?");
  } catch (error) {
    console.error("Chat Error:", error);
    return language === 'cs' ? "Chyba připojení." : "Connection error.";
  }
};

/**
 * Analyze Food Image.
 */
export const analyzeFoodImage = async (base64Image: string, language: 'en' | 'cs'): Promise<{
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}> => {
  try {
    const langInstruction = language === 'cs' 
        ? "Identify the main food item and return its name in Czech language (foodName)." 
        : "Identify the main food item and return its name in English (foodName).";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: `Analyze this image. ${langInstruction} Estimate calories, protein (g), carbs (g), and fats (g). Return strictly JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
          },
          required: ["foodName", "calories", "protein", "carbs", "fats"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Nutrition Analysis Error:", error);
    throw error;
  }
};

/**
 * Edit Image (Studio Mode).
 */
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};

/**
 * Generate an Image from text.
 */
export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }]
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

/**
 * Generate a Context Pill.
 */
export const generateContextPill = async (language: 'en' | 'cs'): Promise<string> => {
    try {
        const langInstruction = language === 'cs' ? "in Czech language" : "in English";
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a 12-word fitness context pill for a user who slept 6 hours and has a heavy leg day today. Be punchy and write ${langInstruction}.`,
        });
        return response.text || (language === 'cs' ? "Odpočívej, makej." : "Rest well, lift heavy.");
    } catch (e) {
        return language === 'cs' ? "Soustřeď se na regeneraci." : "Focus on recovery today.";
    }
}

/**
 * Find Nearby Routes.
 */
export const findNearbyPlaces = async (
    query: string, 
    latitude: number, 
    longitude: number, 
    language: 'en' | 'cs'
): Promise<{ text: string, places: { title: string, uri: string }[] }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: query,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: { latitude, longitude }
                    }
                },
                systemInstruction: language === 'cs' ? "You are a local guide. Answer in Czech." : "You are a local guide."
            },
        });

        const places: { title: string, uri: string }[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web?.uri && chunk.web?.title) {
                     places.push({ title: chunk.web.title, uri: chunk.web.uri });
                }
            });
        }

        return {
            text: response.text || "No details found.",
            places: places
        };
    } catch (error) {
        console.error("Maps Error:", error);
        throw error;
    }
}

/**
 * Generate Adaptive Nutrition Strategy.
 */
export const generateNutritionPlan = async (
    userProfile: any, 
    context: string, 
    language: 'en' | 'cs'
): Promise<NutritionPlan> => {
    try {
        const langInstruction = language === 'cs' 
            ? "Provide the response in Czech language." 
            : "Provide the response in English.";

        const prompt = `
            Act as an elite sports nutritionist. 
            User Profile: ${JSON.stringify(userProfile)}
            Current Context: ${context}
            Generate a daily nutrition plan.
            ${langInstruction}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        targetCalories: { type: Type.NUMBER },
                        targetProtein: { type: Type.NUMBER },
                        targetCarbs: { type: Type.NUMBER },
                        targetFats: { type: Type.NUMBER },
                        reasoning: { type: Type.STRING },
                        mealTiming: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING },
                                    label: { type: Type.STRING },
                                    suggestion: { type: Type.STRING }
                                }
                            }
                        },
                        supplements: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    dosage: { type: Type.STRING },
                                    reason: { type: Type.STRING }
                                }
                            }
                        }
                    },
                    required: ["targetCalories", "targetProtein", "targetCarbs", "targetFats", "reasoning", "mealTiming", "supplements"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as NutritionPlan;
        }
        throw new Error("Empty response");

    } catch (error) {
        console.error("Nutrition Plan Error:", error);
        throw error;
    }
}

/**
 * Generate Grocery List from Plan (Premium).
 */
export const generateGroceryList = async (plan: NutritionPlan, language: 'en' | 'cs'): Promise<GroceryItem[]> => {
    try {
        const langInstruction = language === 'cs' ? "in Czech" : "in English";
        // Explicitly ask for categories to ensure good grouping
        const prompt = `Based on this nutrition plan: ${JSON.stringify(plan.mealTiming)}, create a consolidated grocery list for one day. Group items into clear categories like "Produce", "Protein", "Dairy", "Pantry", "Other". Write ${langInstruction}.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            category: { type: Type.STRING },
                            item: { type: Type.STRING },
                            quantity: { type: Type.STRING }
                        },
                        required: ["category", "item", "quantity"]
                    }
                }
            }
        });
        
        if (response.text) {
            const items = JSON.parse(response.text);
            // Initialize checked property for UI interaction
            return items.map((i: any) => ({ ...i, checked: false }));
        }
        return [];
    } catch (error) {
        console.error("Grocery Error", error);
        return [];
    }
}

/**
 * Analyze Exercise Form or Physique (Premium).
 * Uses Gemini 3.0 Pro for advanced visual reasoning.
 */
export const analyzeForm = async (base64Image: string, language: 'en' | 'cs'): Promise<FormAnalysis> => {
    try {
         const langInstruction = language === 'cs' ? "Response must be in Czech." : "Response must be in English.";
         
         const prompt = `Analyze this fitness photo. It could be an exercise form check (e.g. squat, deadlift) OR a physique progress check.
         
         1. Identify what is shown (Specific Exercise Name or "Physique Check").
         2. If Exercise: Critique biomechanics, safety, and efficiency. Identify the exercise phase.
         3. If Physique: Identify muscle groups to focus on for balance, estimate visual body fat % range (optional).
         4. Provide a score (0-100). For exercise: Safety/Technique score. For physique: Readiness/Condition score.
         5. Verdict: Provide a specific recommendation for the *next* training session based on this image (e.g., "Focus on depth next leg day" or "Increase calorie surplus for mass").
         
         Return a JSON object with:
         - exerciseName
         - safetyScore
         - goodPoints (list of strengths)
         - improvements (list of corrections or focus areas)
         - verdict (Coach's specific advice)
         
         ${langInstruction}`;
         
         const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        exerciseName: { type: Type.STRING },
                        safetyScore: { type: Type.NUMBER },
                        goodPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                        improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                        verdict: { type: Type.STRING }
                    },
                    required: ["exerciseName", "safetyScore", "goodPoints", "improvements", "verdict"]
                }
            }
         });

         if (response.text) return JSON.parse(response.text);
         throw new Error("Analysis failed");
    } catch (error) {
        console.error("Form Check Error", error);
        throw error;
    }
}

/**
 * Fact Check a Nutrition Trend.
 */
export const verifyNutritionFact = async (query: string, language: 'en' | 'cs'): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Verify this nutrition claim: "${query}". Is it true or false based on science? Keep it short.`,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: language === 'cs' ? "Answer in Czech." : "Answer in English."
            },
        });
        return response.text || "Could not verify.";
    } catch (error) {
        return "Service unavailable.";
    }
}
