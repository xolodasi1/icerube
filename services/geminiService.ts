
import { GoogleGenAI, Type } from "@google/genai";
import { Video } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const fetchRealVideos = async (query: string): Promise<Video[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search YouTube for the top 10 videos related to "${query}". 
      Return ONLY a JSON array of objects with this structure: 
      {
        "id": "youtube_video_id",
        "title": "video title",
        "channelName": "channel name",
        "thumbnail": "https://img.youtube.com/vi/ID/maxresdefault.jpg",
        "duration": "mm:ss",
        "description": "brief description",
        "category": "category_name"
      }. 
      Ensure IDs are real and valid. Try to include a variety of channels.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              channelName: { type: Type.STRING },
              thumbnail: { type: Type.STRING },
              duration: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["id", "title", "channelName", "thumbnail", "duration", "category"]
          }
        }
      }
    });

    const results = JSON.parse(response.text || "[]");
    return results.map((v: any) => ({
      ...v,
      channelId: `ch-${v.channelName.replace(/\s+/g, '')}`,
      channelAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.channelName}`,
      views: Math.floor(Math.random() * 1000000) + 50000,
      likes: Math.floor(Math.random() * 50000) + 1000,
      postedAt: Date.now() - Math.floor(Math.random() * 1000000000),
      comments: []
    }));
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};

export const summarizeVideo = async (title: string, description: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Сделай краткий обзор видео (2 предложения) на русском языке. 
      Название: "${title}"
      Описание: "${description}"`,
    });
    return response.text || "Не удалось сгенерировать инсайт.";
  } catch (error) {
    return "Ошибка нейросети.";
  }
};
