export enum ReadingMode {
  IMMERSION = 'IMMERSION',
  BLIND = 'BLIND',
}

export enum UserRole {
  GUEST = 'GUEST',
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

export type MembershipType = 'monthly' | 'annual';

// 后端管理的标准词库条目
export interface VocabularyBankEntry {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  definition: string;
  example: string;
  level: 'Band7' | 'Band8' | 'Band9';
  tags: string[]; 
  lastUpdated: string;
}

export interface VocabularyWord extends VocabularyBankEntry {}

export interface StoryContentPart {
  type: 'text' | 'word';
  content: string;
  wordId?: string;
}

export interface Story {
  id: string;
  title: string;
  tagline: string;
  genre: string;
  coverImage: string;
  immersionContent: StoryContentPart[];
  blindContent: string;
  vocabulary: VocabularyWord[];
  dateAdded: string;
  isUserGenerated?: boolean;
  prevId?: string;
  nextId?: string;
  attachments?: string[]; 
}

export interface UserProgress {
  masteredWords: string[];
  collectedWords: string[];
  completedStories: string[];
  currentPlanLevel: number;
  isVip: boolean;
  membershipType?: MembershipType;
  freeStoriesRead: number;
  freeTrialQuota: number; // 新增：剩余试用额度
}

export interface ActivationCode {
  code: string;
  isUsed: boolean;
  expiresAt: string;
  type: MembershipType;
}