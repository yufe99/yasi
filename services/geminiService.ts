import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Story, VocabularyBankEntry } from "../types";

export class GeminiService {
  private getAI() {
    // 优先级：用户手动配置的代理 > 环境变量内置代理 > 官方默认
    const proxyOverride = localStorage.getItem('lexitale_api_proxy');
    const apiKey = process.env.API_KEY || '';
    
    const config: any = { apiKey };
    
    if (proxyOverride) {
      config.baseUrl = proxyOverride;
    } else if (process.env.API_BASE_URL) {
      config.baseUrl = process.env.API_BASE_URL;
    }
    
    return new GoogleGenAI(config);
  }

  private getRandomCoverUrl(keywords: string) {
    const seed = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${seed}/800/600`;
  }

  async generateTTS(text: string, type: 'standard' | 'slow' | 'full' = 'standard'): Promise<string | undefined> {
    const ai = this.getAI();
    let prompt = "";
    
    if (type === 'full') {
      prompt = `Read the following story slowly and clearly for an IELTS learner. Maintain a sophisticated and professional tone: ${text}`;
    } else if (type === 'slow') {
      prompt = `Pronounce this word VERY SLOWLY, clearly enunciating every single syllable. BREAK IT DOWN for a learner: ${text}`;
    } else {
      prompt = `Pronounce this word clearly at a standard professional speed: ${text}`;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }
            }
          }
        }
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) {
      console.error("Gemini TTS Error:", e);
      return undefined;
    }
  }

  async generateStoryFromBank(theme: string, bankWords: VocabularyBankEntry[]): Promise<any> {
    const vocabularyContext = bankWords.map(w => 
      `${w.word} (${w.translation}): ${w.definition}`
    ).join('\n');

    const prompt = `你是一名顶级雅思名师，擅长创作针对 25-35 岁高认知女性的都市/职场题材爽文。
    当前任务：编写【${theme}】题材的雅思剧情。
    
    必须使用的精准词库（请从中挑选 5-8 个核心词嵌入剧情）：
    ${vocabularyContext}

    要求：
    1. 标题（title）：吸引人的中文爽文标题。
    2. 沉浸读内容（immersionContent）：全中文剧情，节奏极快，反转强烈。将挑选的英文单词自然嵌入。
    3. 词汇表（vocabulary）：必须包含你挑选的单词，信息与词库一致。
    4. 输出格式：纯 JSON 格式。`;

    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: this.getStorySchema()
        }
      });

      const data = JSON.parse(response.text || '{}');
      if (!data.coverImage || data.coverImage === "RANDOM_PLACEHOLDER") {
        data.coverImage = this.getRandomCoverUrl(theme);
      }
      if (data.vocabulary) {
        data.vocabulary = data.vocabulary.map((v: any) => ({
          ...v,
          tags: v.tags || ["AI-Generated"],
          lastUpdated: new Date().toISOString()
        }));
      }
      return data;
    } catch (e) {
      console.error("Story Gen Error:", e);
      throw e;
    }
  }

  async extendStory(previousStory: Story): Promise<any> {
    const prevContent = previousStory.immersionContent
      .map(p => p.content)
      .join('');

    const prompt = `你正在续写一部名为《${previousStory.title}》的雅思爽文。前情提要： "${prevContent}"。
    任务：创作下一章。要求：保持风格一致，引入 5 个新高级雅思词汇，要有反转。
    输出格式：JSON。`;

    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: this.getStorySchema()
        }
      });

      const data = JSON.parse(response.text || '{}');
      data.coverImage = this.getRandomCoverUrl(previousStory.genre);
      if (data.vocabulary) {
        data.vocabulary = data.vocabulary.map((v: any) => ({
          ...v,
          tags: v.tags || ["AI-Extension"],
          lastUpdated: new Date().toISOString()
        }));
      }
      return data;
    } catch (e) {
      console.error("Extension AI Error:", e);
      throw e;
    }
  }

  private getStorySchema() {
    return {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        tagline: { type: Type.STRING },
        genre: { type: Type.STRING },
        coverImage: { type: Type.STRING },
        immersionContent: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["text", "word"] },
              content: { type: Type.STRING },
              wordId: { type: Type.STRING }
            },
            required: ["type", "content"]
          }
        },
        blindContent: { type: Type.STRING },
        vocabulary: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              word: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              definition: { type: Type.STRING },
              example: { type: Type.STRING },
              translation: { type: Type.STRING },
              level: { type: Type.STRING, enum: ["Band7", "Band8", "Band9"] },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              lastUpdated: { type: Type.STRING }
            },
            required: ["id", "word", "phonetic", "definition", "example", "translation", "level"]
          }
        }
      },
      required: ["title", "tagline", "genre", "coverImage", "immersionContent", "blindContent", "vocabulary"]
    };
  }
}

export const geminiService = new GeminiService();