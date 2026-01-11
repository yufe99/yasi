
import { GoogleGenAI, Type } from "@google/genai";
import { Story } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getRandomCoverUrl(keywords: string) {
    const seed = Math.floor(Math.random() * 1000);
    // 使用 picsum 配合随机 seed 确保图片永远可用且每次不同
    return `https://picsum.photos/seed/${seed}/800/600`;
  }

  async generateStory(theme: string): Promise<any> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一名资深雅思名师和顶级爽文编剧。请为一名雅思 8.0+ 目标的高认知精英女性学习者，创作一段【${theme}】题材的沉浸式剧本。
      
      要求：
      1. 标题（title）：必须使用【极具吸引力的中文爽文标题】，体现智商碾袭、职场逆袭或高端社交博弈。
      2. 剧情摘要（tagline）：用一句简短、高级的中文描述本集爽点。
      3. 题材（genre）：必须使用中文，如“现代职场”、“豪门智斗”、“跨国博弈”等。
      4. 沉浸读内容（immersionContent）：必须使用【高质量全中文剧情】，节奏快、反转多。自然地将 5-8 个雅思核心词汇（Band 7-9）以【英文形式】嵌入到中文句子中。
         - 注意：内容必须是一个对象数组，每个对象包含 type ("text" 或 "word"), content (字符串) 和 wordId (如果是词汇)。
      5. 全英文版（blindContent）：提供该剧情对应的纯正、高阶全英文翻译。
      6. 词汇表（vocabulary）：提供嵌入单词的音标、中英文定义、地道例句、准确翻译、雅思等级。
      7. 封面图（coverImage）：请直接返回字符串 "RANDOM_PLACEHOLDER"。
      
      输出格式：严格按照指定的 JSON 格式输出。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: this.getStorySchema()
      }
    });

    try {
      const data = JSON.parse(response.text || '{}');
      if (data.coverImage === "RANDOM_PLACEHOLDER") {
        data.coverImage = this.getRandomCoverUrl(theme);
      }
      return data;
    } catch (e) {
      console.error("JSON Parse Error", e);
      throw e;
    }
  }

  async extendStory(previousStory: Story): Promise<any> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `作为爽文编剧，请为上一集剧集《${previousStory.title}》创作续集。
      
      请创作【下一集】剧情。要求：
      1. 标题（title）：必须使用【中文】，延续前作风格。
      2. 沉浸读内容（immersionContent）：全中文叙述，自然嵌入 5-8 个【新】的雅思 Band 7-9 核心词汇。
      3. 封面图（coverImage）：请返回 "RANDOM_PLACEHOLDER"。
      
      输出格式：严格按照指定的 JSON 格式输出。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: this.getStorySchema()
      }
    });

    try {
      const data = JSON.parse(response.text || '{}');
      if (data.coverImage === "RANDOM_PLACEHOLDER") {
        data.coverImage = this.getRandomCoverUrl(previousStory.genre);
      }
      return data;
    } catch (e) {
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
              level: { type: Type.STRING, enum: ["Band7", "Band8", "Band9"] }
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
