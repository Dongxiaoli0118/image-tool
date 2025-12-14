import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeIDPhoto = async (base64Image: string): Promise<string> => {
  const ai = getGeminiClient();
  if (!ai) {
    return "Error: API Key is missing. Please configure your environment.";
  }

  try {
    // Strip the data:image/xyz;base64, prefix if present
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `Act as a professional photographer reviewing an ID photo. 
            Analyze this image for suitability as a formal ID or Passport photo.
            Check the following criteria:
            1. Background (Is it clean/plain?)
            2. Lighting (Are there shadows on the face?)
            3. Face Visibility (Eyes open, looking straight?)
            4. Head Position (Is it centered?)
            
            Provide a short, constructive assessment in bullet points.
            Start with an overall verdict: "✅ Suitable" or "⚠️ Needs Improvement".`
          }
        ]
      }
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to analyze image. Please try again later.";
  }
};