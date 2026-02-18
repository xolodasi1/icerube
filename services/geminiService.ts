
import { GoogleGenAI } from "@google/genai";

// Ensure Gemini is initialized correctly using process.env.API_KEY directly.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const summarizeVideo = async (title: string, description: string): Promise<string> => {
  try {
    const ai = getAI();
    // Directly using ai.models.generateContent to query GenAI.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful YouTube assistant. Provide a concise 2-sentence summary of a video with the following title and description. 
      Title: "${title}"
      Description: "${description}"`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    // Directly access the .text property from GenerateContentResponse.
    return response.text || "Unable to generate summary at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI summary. Please check your connection.";
  }
};

export const getSmartComments = async (title: string): Promise<string[]> => {
  try {
    const ai = getAI();
    // Directly using ai.models.generateContent for text-based tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 3 realistic YouTube comments for a video titled "${title}". 
      Return them as a simple bulleted list.`,
    });

    // Use .text property to extract response.
    const text = response.text || "";
    return text.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^[*-]\s*/, ''));
  } catch (error) {
    return ["Amazing video!", "Very helpful, thanks!", "Can't wait for the next part!"];
  }
};
