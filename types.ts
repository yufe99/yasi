
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
  tags: string[]; // 如 "2024更新", "职场", "听力高频"
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
  attachments?: string[]; // 资料下载链接
}

export interface UserProgress {
  masteredWords: string[];
  collectedWords: string[];
  completedStories: string[];
  currentPlanLevel: number;
  isVip: boolean;
  membershipType?: MembershipType;
  freeStoriesRead: number;
}

export interface ActivationCode {
  code: string;
  isUsed: boolean;
  expiresAt: string;
  type: MembershipType;
}
