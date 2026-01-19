
import { GoogleGenAI, Type } from "@google/genai";
import { Story, VocabularyBankEntry } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getRandomCoverUrl(keywords: string) {
    const seed = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${seed}/800/600`;
  }

  /**
   * 基于后端精准词库生成剧情
   * @param theme 剧情主题
   * @param bankWords 从后端词库中筛选出的备选词汇
   */
  async generateStoryFromBank(theme: string, bankWords: VocabularyBankEntry[]): Promise<any> {
    // 将词库转换为 AI 可理解的简要上下文
    const vocabularyContext = bankWords.map(w => 
      `${w.word} (${w.translation}): ${w.definition}`
    ).join('\n');

    const prompt = `你是一名顶级雅思名师。
    当前任务：为高认知女性编写【${theme}】题材的雅思爽文。
    
    必须使用的精准词库（请从中挑选 5-8 个核心词嵌入剧情）：
    ${vocabularyContext}

    要求：
    1. 标题（title）：极具吸引力的中文爽文标题。
    2. 沉浸读内容（immersionContent）：全中文剧情，节奏极快，反转强烈。将挑选的单词以英文形式自然嵌入。
    3. 词汇表（vocabulary）：必须包含你挑选的单词，且信息与提供的词库保持一致。
    4. 封面图：返回 "RANDOM_PLACEHOLDER"。

    输出格式：JSON。`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
      console.error("Story Gen Error", e);
      throw e;
    }
  }

  async generateStory(theme: string): Promise<any> {
    // 兼容旧版或无词库状态
    return this.generateStoryFromBank(theme, []);
  }

  async extendStory(previousStory: Story): Promise<any> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `为续作《${previousStory.title}》创作下一集。续写剧情。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: this.getStorySchema()
      }
    });
    const data = JSON.parse(response.text || '{}');
    data.coverImage = this.getRandomCoverUrl(previousStory.genre);
    return data;
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
