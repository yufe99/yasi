
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

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  translation: string;
  level: 'Band6' | 'Band7' | 'Band8' | 'Band9';
}

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
