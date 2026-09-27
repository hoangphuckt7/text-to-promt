export interface Character {
  id: string;
  name: string;
  description: string;
  voice?: string;
}

export interface TagItem {
  id: string;
  name: string;
  fragment: string;
  isCustom?: boolean;
}

export interface Scene {
  id: number;
  sceneNumber: number;
  text: string;
  words: number;
  estimatedDurationSec: number;
  startTimeFormatted: string;
  prompt?: string;
  status?: 'idle' | 'generating' | 'success' | 'error';
  errorMessage?: string;
  detectedCharacters?: string[];
}

export interface AppSettings {
  splitMode: 'speech_rate' | 'single_sentence';
  wordsPerScene: number; // default ~22 words for ~8s
  targetDurationMinutes: string; // 'auto' | '1' | '2' | '3' | '5' | '6' | '7' | '8' | '9' | '10' | '15' | '20' | 'custom'
  customMinutes?: number;
  promptType: 'multi' | 'summary';
  promptLanguage: 'en' | 'vi';
  veoModel: 'Veo 3.1 Pro' | 'Veo 3.1 Fast' | 'Veo 3.1 Lite';
  promptDetail: 'low' | 'medium' | 'high';
  aspectRatio: '16:9' | '9:16' | '1:1';
  fixedPrefix: string;
  useSeed: boolean;
  seed: number;
  // Consistency & rule toggles
  useLightingColor: boolean;
  syncCharacters: boolean; // Chỉ sao chép Character Sheet xuất hiện trong phân cảnh
  includeVoiceLanguage: boolean;
  matchDurationPrompts: boolean;
  storyContinuityGoal: boolean;
  individualCharacterSheets: boolean;
  continuity: boolean; // Liên kết các cảnh cuối của prompt trước với cảnh đầu của prompt sau
}

export interface StoryPreset {
  id: string;
  title: string;
  story: string;
  createdAt: number;
}

export interface ConfigPreset {
  id: string;
  name: string;
  createdAt: number;
  settings: Partial<AppSettings>;
  selectedStyles: string[];
  selectedGenres: string[];
  characters?: Character[];
}

export interface GenerateBatchRequest {
  scenes: {
    id: number;
    sceneNumber: number;
    text: string;
    words: number;
    duration: number;
  }[];
  characters: Character[];
  selectedStyles: { name: string; fragment: string }[];
  selectedGenres: { name: string; fragment: string }[];
  settings: AppSettings;
}

export interface GenerateBatchResponse {
  results: {
    sceneNumber: number;
    prompt: string;
    detectedCharacters?: string[];
  }[];
}

export interface GenerateSingleRequest {
  scene: {
    id: number;
    sceneNumber: number;
    text: string;
    words: number;
    duration: number;
  };
  previousScenePrompt?: string;
  nextSceneText?: string;
  characters: Character[];
  selectedStyles: { name: string; fragment: string }[];
  selectedGenres: { name: string; fragment: string }[];
  settings: AppSettings;
}
