import { GoogleGenAI } from "@google/genai";
import { ImageFile } from "../types";

const LOCAL_STORAGE_KEY = "dressme_api_key";

export const getStoredApiKey = (): string | null => {
  return localStorage.getItem(LOCAL_STORAGE_KEY);
};

export const setStoredApiKey = (key: string) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, key);
};

export const removeStoredApiKey = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

/**
 * Validates the API key by making a lightweight request.
 */
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use a lightweight model just to check if the key is valid
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'test',
    });
    return true;
  } catch (error) {
    console.error("API Key Validation Failed:", error);
    return false;
  }
};

// Helper to check for selected API key for Veo (Cloud specific)
export const checkApiKeySelection = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    return hasKey;
  }
  // Fallback: check if we have a local key for standard generation
  return !!getStoredApiKey();
};

export const promptApiKeySelection = async (): Promise<void> => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  } else {
    // If we are in a normal web env, we rely on the manual input modal
    // This method is kept for compatibility with specific demo environments
    console.warn("Using manual API key input instead of AI Studio extension.");
  }
};

const getClient = () => {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error("Chave de API não encontrada. Por favor, insira sua chave.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a look by combining model, top, and bottom images.
 */
export const generateFashionLook = async (
  model: ImageFile,
  top: ImageFile | null,
  bottom: ImageFile | null
): Promise<string> => {
  const ai = getClient();
  
  const parts: any[] = [];

  // Add Model
  parts.push({
    inlineData: {
      data: model.base64,
      mimeType: model.mimeType,
    },
  });
  parts.push({ text: "Esta é a imagem da MODELO (Pessoa)." });

  // Add Top
  if (top) {
    parts.push({
      inlineData: {
        data: top.base64,
        mimeType: top.mimeType,
      },
    });
    parts.push({ text: "Esta é a PEÇA DE CIMA (roupa)." });
  }

  // Add Bottom
  if (bottom) {
    parts.push({
      inlineData: {
        data: bottom.base64,
        mimeType: bottom.mimeType,
      },
    });
    parts.push({ text: "Esta é a PEÇA DE BAIXO (roupa)." });
  }

  // Final Instruction
  const prompt = `
    Crie uma imagem realista de moda de alta qualidade (fotografia de corpo inteiro).
    Vista a MODELO fornecida com a PEÇA DE CIMA e a PEÇA DE BAIXO fornecidas.
    Mantenha as características faciais e corporais da modelo o máximo possível.
    Ajuste as roupas para que caibam naturalmente no corpo da modelo.
    Se faltar uma peça (cima ou baixo), escolha algo neutro e estiloso para completar o look que combine.
    O resultado deve ser uma foto de moda profissional.
  `;
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview', // High quality for fashion
    contents: {
      parts: parts,
    },
    config: {
      imageConfig: {
        aspectRatio: "9:16", // Vertical format requested
        imageSize: "1K"
      }
    },
  });

  // Extract Image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Nenhuma imagem foi gerada. Tente novamente.");
};

/**
 * Edits the background of the generated image.
 */
export const editBackground = async (
  currentImageBase64: string, // Pure base64 without prefix
  promptText: string
): Promise<string> => {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: currentImageBase64,
            mimeType: 'image/png',
          },
        },
        {
          text: `Altere o fundo ou o ambiente desta imagem baseado na seguinte descrição: "${promptText}". Mantenha a modelo e as roupas inalteradas. Mantenha a proporção 9:16.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "9:16",
        imageSize: "1K"
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Não foi possível editar a imagem.");
};

/**
 * Generates a video from the image using Veo.
 */
export const generateFashionVideo = async (
  imageBase64: string,
  promptText: string = "A model posing fashionably, slow motion, elegant movement"
): Promise<string> => {
  const ai = getClient();

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: promptText,
    image: {
      imageBytes: imageBase64,
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16' // Vertical video
    }
  });

  // Polling mechanism
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!videoUri) {
    throw new Error("Falha ao gerar o vídeo.");
  }

  // Fetch the actual video blob
  // Note: We use the stored API key here
  const apiKey = getStoredApiKey();
  const response = await fetch(`${videoUri}&key=${apiKey}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};