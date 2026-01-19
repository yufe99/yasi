import { GoogleGenAI, Type } from "@google/genai";
import { Story, VocabularyBankEntry } from "../types";

export class GeminiService {
  private getAI() {
    // 每次调用时获取，确保能拿到最新的环境变量（针对某些热更新场景）
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getRandomCoverUrl(keywords: string) {
    const seed = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${seed}/800/600`;
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
    2. 沉浸读内容（immersionContent）：全中文剧情，节奏极快，反转强烈。将挑选的英文单词自然嵌入，不要生硬。
    3. 词汇表（vocabulary）：必须包含你挑选的单词，信息与词库一致。
    4. 输出格式：纯 JSON 格式。`;

    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: this.getStorySchema()
      }
    });

    try {
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
    // 获取前文文本作为上下文
    const prevContent = previousStory.immersionContent
      .map(p => p.content)
      .join('');

    const prompt = `你正在续写一部名为《${previousStory.title}》的雅思爽文。
    
    前情提要：
    "${prevContent}"
    
    任务：创作下一章。
    要求：
    1. 保持人设和风格的一致性。
    2. 引入 5 个左右新的高级雅思词汇（Band 7-9）。
    3. 剧情要有新的张力和反转。
    4. 封面图：返回 "RANDOM_PLACEHOLDER"。
    
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