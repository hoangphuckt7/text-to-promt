import { AppSettings, Character, ConfigPreset, Scene, StoryPreset, TagItem } from '../types';
import { DEFAULT_CHARACTERS, DEFAULT_GENRES, DEFAULT_SETTINGS, DEFAULT_STYLES, SAMPLE_STORIES } from '../data/defaults';

const STORAGE_KEYS = {
  SETTINGS: 'veo_prompt_settings',
  STORIES: 'veo_prompt_stories',
  CURRENT_STORY: 'veo_prompt_current_story',
  CONFIG_PRESETS: 'veo_prompt_config_presets',
  CUSTOM_STYLES: 'veo_prompt_custom_styles',
  CUSTOM_GENRES: 'veo_prompt_custom_genres',
  CHARACTERS: 'veo_prompt_characters',
  SELECTED_STYLES: 'veo_prompt_selected_styles',
  SELECTED_GENRES: 'veo_prompt_selected_genres',
  THEME: 'veo_prompt_theme',
};

export type AppTheme = 'light' | 'dark';

export function loadStoredTheme(): AppTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'dark' || raw === 'light') return raw;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveStoredTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error('Error saving theme', e);
  }
}

export function loadStoredStories(): StoryPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORIES);
    if (!raw) return SAMPLE_STORIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_STORIES;
  } catch {
    return SAMPLE_STORIES;
  }
}

export function saveStoredStories(stories: StoryPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
  } catch (e) {
    console.error('Error saving stories to localStorage', e);
  }
}

export function loadCurrentStory(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_STORY);
    return raw !== null ? raw : SAMPLE_STORIES[0].story;
  } catch {
    return SAMPLE_STORIES[0].story;
  }
}

export function saveCurrentStory(story: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STORY, story);
  } catch (e) {
    console.error('Error saving current story', e);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function loadStoredStyles(): TagItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_STYLES);
    if (!raw) return DEFAULT_STYLES;
    const custom: TagItem[] = JSON.parse(raw);
    return [...DEFAULT_STYLES, ...custom];
  } catch {
    return DEFAULT_STYLES;
  }
}

export function saveCustomStyle(newStyle: TagItem): TagItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_STYLES);
    const existing: TagItem[] = raw ? JSON.parse(raw) : [];
    const updated = [...existing, newStyle];
    localStorage.setItem(STORAGE_KEYS.CUSTOM_STYLES, JSON.stringify(updated));
    return [...DEFAULT_STYLES, ...updated];
  } catch {
    return DEFAULT_STYLES;
  }
}

export function loadStoredGenres(): TagItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_GENRES);
    if (!raw) return DEFAULT_GENRES;
    const custom: TagItem[] = JSON.parse(raw);
    return [...DEFAULT_GENRES, ...custom];
  } catch {
    return DEFAULT_GENRES;
  }
}

export function saveCustomGenre(newGenre: TagItem): TagItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_GENRES);
    const existing: TagItem[] = raw ? JSON.parse(raw) : [];
    const updated = [...existing, newGenre];
    localStorage.setItem(STORAGE_KEYS.CUSTOM_GENRES, JSON.stringify(updated));
    return [...DEFAULT_GENRES, ...updated];
  } catch {
    return DEFAULT_GENRES;
  }
}

export function loadStoredCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
    if (!raw) return DEFAULT_CHARACTERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CHARACTERS;
  } catch {
    return DEFAULT_CHARACTERS;
  }
}

export function saveStoredCharacters(characters: Character[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
  } catch (e) {
    console.error('Error saving characters', e);
  }
}

export function loadSelectedStyles(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SELECTED_STYLES);
    return raw ? JSON.parse(raw) : ['phim', 'chanthuc'];
  } catch {
    return ['phim', 'chanthuc'];
  }
}

export function saveSelectedStyles(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_STYLES, JSON.stringify(ids));
  } catch (e) {
    console.error('Error saving selected styles', e);
  }
}

export function loadSelectedGenres(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SELECTED_GENRES);
    return raw ? JSON.parse(raw) : ['mystery', 'drama'];
  } catch {
    return ['mystery', 'drama'];
  }
}

export function saveSelectedGenres(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_GENRES, JSON.stringify(ids));
  } catch (e) {
    console.error('Error saving selected genres', e);
  }
}

export function loadConfigPresets(): ConfigPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG_PRESETS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConfigPresets(presets: ConfigPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG_PRESETS, JSON.stringify(presets));
  } catch (e) {
    console.error('Error saving config presets', e);
  }
}

export function exportScenesToTxt(scenes: Scene[], storyTitle = 'veo3_prompts'): void {
  const content = scenes
    // .map((s) => {
    //   const promptText = s.prompt || `[Chưa tạo prompt]\nKịch bản gốc: ${s.text}`;
    //   return `--- CẢNH ${s.sceneNumber} (${s.startTimeFormatted} | ~${s.estimatedDurationSec}s) ---\n${promptText}`;
    // })
    // .join('\n\n');
    .map((s) => {
      const promptText = s.prompt || `[Chưa tạo prompt]\nKịch bản gốc: ${s.text}`;
      return `--- CẢNH ${s.sceneNumber} (${s.startTimeFormatted} | ~${s.estimatedDurationSec}s) ---\n${promptText}`;
    })
    .join('\n\n');
    

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${storyTitle.replace(/\s+/g, '_')}_prompts.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportScenesToCsv(scenes: Scene[], storyTitle = 'veo3_prompts'): void {
  const headers = ['Scene_Number', 'Start_Time', 'Duration_Sec', 'Word_Count', 'Original_Script', 'Veo3_Prompt'];
  const rows = scenes.map((s) => [
    s.sceneNumber,
    s.startTimeFormatted,
    s.estimatedDurationSec,
    s.words,
    `"${(s.text || '').replace(/"/g, '""')}"`,
    `"${(s.prompt || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${storyTitle.replace(/\s+/g, '_')}_scenes.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatSceneForExport(s: Scene, idx: number, total: number) {
  const isLast = idx === total - 1;
  const sceneCode = s.sceneCode || `SC${(idx + 1).toString().padStart(2, '0')}`;
  return {
    id: sceneCode,
    character: s.character ?? (s.detectedCharacters ? s.detectedCharacters.join('; ') : ''),
    character_info: s.character_info ?? '',
    prompt: s.prompt || s.text || '',
    subtitle_ids: s.subtitle_ids || [s.sceneNumber || idx + 1],
    start_at: s.start_at || s.startTimeFormatted || '00:00:00,000',
    end_at: s.end_at || (isLast ? 'AUDIO_END' : '00:00:00,000'),
    motion: s.motion || { type: 'none', strength: 'subtle' },
  };
}

export function getScenesJsonString(scenes: Scene[]): string {
  const data = scenes.map((s, idx) => formatSceneForExport(s, idx, scenes.length));
  return JSON.stringify(data, null, 2);
}

export function exportScenesToJson(scenes: Scene[], storyTitle = 'scenes'): void {
  const jsonContent = getScenesJsonString(scenes);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${storyTitle.replace(/\s+/g, '_')}_scenes.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
