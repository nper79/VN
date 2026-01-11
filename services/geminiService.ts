import { GoogleGenAI, Type } from "@google/genai";
import { ParsedScript, ScriptLine, LineType } from "../types";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const parseScriptWithGemini = async (rawText: string): Promise<ParsedScript> => {
  const ai = getAiClient();
  
  const prompt = `
    Analyze the following Visual Novel script. 
    1. Identify all characters and infer a brief physical description for them (anime style) based on the text or generic attractive anime tropes if undefined.
    2. Identify all unique scenes/locations.
    3. Parse the script into a structured list of lines.
    
    Format Guidelines:
    - [Scene: ...] indicates a SCENE_HEADING.
    - [Narrator] indicates NARRATION.
    - [CharacterName] (Thinking) ... indicates THOUGHT.
    - [CharacterName] ... indicates DIALOGUE.
    - [Sprite of ...] or [Action] indicates ACTION.
    - Infer the 'emotion' of the speaker for every dialogue line (neutral, happy, laughing, sad, angry, shy, surprised). Default to 'neutral'.

    Script:
    ${rawText}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["name", "description"]
            }
          },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["id", "description"]
            }
          },
          lines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: [
                  "DIALOGUE", "NARRATION", "THOUGHT", "SCENE_HEADING", "ACTION"
                ]},
                speaker: { type: Type.STRING },
                text: { type: Type.STRING },
                emotion: { type: Type.STRING },
                sceneDescription: { type: Type.STRING },
                visualCue: { type: Type.STRING }
              },
              required: ["id", "type", "text"]
            }
          }
        },
        required: ["characters", "scenes", "lines"]
      }
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as ParsedScript;
};

export const generateCharacterSprite = async (
  charName: string, 
  description: string, 
  emotion: string
): Promise<string> => {
  const ai = getAiClient();
  
  // Using gemini-2.5-flash-image (Nano Banana) for generation
  const prompt = `
    Anime visual novel character sprite of ${charName}.
    Description: ${description}.
    Expression: ${emotion}.
    View: Waist-up portrait.
    Background: Pure white background (easy to key out).
    Style: High quality, digital art, vibrant colors, clean lines.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
    config: {
        // Nano banana doesn't support responseMimeType
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
};

export const generateBackground = async (sceneDesc: string): Promise<string> => {
  const ai = getAiClient();
  
  const prompt = `
    Anime visual novel background art.
    Scene: ${sceneDesc}.
    Style: High quality, painterly, detailed, atmospheric, Makoto Shinkai style.
    No characters in the scene.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
  });

   // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No background generated");
};