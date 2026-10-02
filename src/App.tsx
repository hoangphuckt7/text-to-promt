import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { StoryInputCard } from './components/StoryInputCard';
import { SceneListCard } from './components/SceneListCard';
import { StyleGenreCard } from './components/StyleGenreCard';
import { CharacterSheetCard } from './components/CharacterSheetCard';
import { GeneralSettingsCard } from './components/GeneralSettingsCard';
import { ConfigPresetsCard } from './components/ConfigPresetsCard';
import {
  AppSettings,
  Character,
  ConfigPreset,
  Scene,
  StoryPreset,
  TagItem,
} from './types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_STYLES,
  DEFAULT_GENRES,
  DEFAULT_CHARACTERS,
} from './data/defaults';
import {
  loadConfigPresets,
  loadCurrentStory,
  loadSelectedGenres,
  loadSelectedStyles,
  loadStoredCharacters,
  loadStoredGenres,
  loadStoredSettings,
  loadStoredStories,
  loadStoredStyles,
  saveConfigPresets,
  saveCurrentStory,
  saveCustomGenre,
  saveCustomStyle,
  saveSelectedGenres,
  saveSelectedStyles,
  saveStoredCharacters,
  saveStoredSettings,
  saveStoredStories,
  exportScenesToTxt,
  exportScenesToCsv,
  exportScenesToJson,
  exportAllConfigsToFile,
  importConfigsFromFile,
  getScenesJsonString,
  AppTheme,
  loadStoredTheme,
  saveStoredTheme,
} from './utils/storage';
import { splitStoryIntoScenes } from './utils/sceneSplitter';
import { AlertCircle, CheckCircle, Info, Loader2, Square } from 'lucide-react';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<AppTheme>(loadStoredTheme);

  // State Initialization
  const [story, setStory] = useState<string>(loadCurrentStory);
  const [settings, setSettings] = useState<AppSettings>(loadStoredSettings);
  const [styles, setStyles] = useState<TagItem[]>(loadStoredStyles);
  const [genres, setGenres] = useState<TagItem[]>(loadStoredGenres);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(loadSelectedStyles);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(loadSelectedGenres);
  const [characters, setCharacters] = useState<Character[]>(loadStoredCharacters);
  const [storyPresets, setStoryPresets] = useState<StoryPreset[]>(loadStoredStories);
  const [configPresets, setConfigPresets] = useState<ConfigPreset[]>(loadConfigPresets);

  // Synchronize Dark Theme class on html document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Scenes & Generation state
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const sceneListRef = useRef<HTMLDivElement>(null);
  const previousPromptsMap = useRef<Map<string, string>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Re-split scenes whenever story, splitMode, wordsPerScene, targetDurationMinutes, or characters change
  useEffect(() => {
    const rawScenes = splitStoryIntoScenes(story, settings, characters);

    // Retain existing prompt for matching text if already generated
    const mappedScenes = rawScenes.map((s) => {
      const existingPrompt = previousPromptsMap.current.get(s.text.trim());
      if (existingPrompt) {
        return { ...s, prompt: existingPrompt, status: 'success' as const };
      }
      return s;
    });

    setScenes(mappedScenes);
  }, [
    story,
    settings.splitMode,
    settings.wordsPerScene,
    settings.targetDurationMinutes,
    settings.customMinutes,
    characters,
  ]);

  // Persist story to localStorage
  useEffect(() => {
    saveCurrentStory(story);
  }, [story]);

  // Persist settings to localStorage
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Persist selections
  useEffect(() => {
    saveSelectedStyles(selectedStyles);
  }, [selectedStyles]);

  useEffect(() => {
    saveSelectedGenres(selectedGenres);
  }, [selectedGenres]);

  useEffect(() => {
    saveStoredCharacters(characters);
  }, [characters]);

  // Scroll to scene preview
  const handlePreviewScenes = () => {
    if (sceneListRef.current) {
      sceneListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Selected Style/Genre objects
  const activeStyleObjects = useMemo(() => {
    return styles.filter((s) => selectedStyles.includes(s.id));
  }, [styles, selectedStyles]);

  const activeGenreObjects = useMemo(() => {
    return genres.filter((g) => selectedGenres.includes(g.id));
  }, [genres, selectedGenres]);

  // Stop prompt generation and preserve already generated prompts
  const handleStopGeneration = () => {
    isCancelledRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setGenerationProgress(null);
    setScenes((prev) =>
      prev.map((s) => (s.status === 'generating' ? { ...s, status: s.prompt ? 'success' : 'idle' } : s))
    );
    showToast('Đã dừng tạo prompt. Các kết quả đã tạo được giữ lại.', 'info');
  };

  // Generate Prompts for all scenes
  const handleGeneratePrompts = async () => {
    if (!story.trim() || scenes.length === 0) {
      showToast('Vui lòng nhập câu chuyện trước khi tạo prompts.', 'error');
      return;
    }

    setIsGenerating(true);
    isCancelledRef.current = false;
    setScenes((prev) => prev.map((s) => ({ ...s, status: 'generating', errorMessage: undefined })));

    try {
      if (settings.promptType === 'summary') {
        // Generate single master summary prompt
        setGenerationProgress({ completed: 0, total: 1 });
        abortControllerRef.current = new AbortController();

        const res = await fetch('/api/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            story,
            characters,
            selectedStyles: activeStyleObjects,
            selectedGenres: activeGenreObjects,
            settings,
          }),
        });

        if (isCancelledRef.current) return;

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Lỗi khi tạo master prompt');
        }

        const data = await res.json();
        if (isCancelledRef.current) return;

        setGenerationProgress({ completed: 1, total: 1 });
        setScenes((prev) =>
          prev.map((s, idx) => {
            const promptVal = idx === 0 ? data.prompt : `(Thuộc video tóm tắt chung: xem Cảnh 1)`;
            previousPromptsMap.current.set(s.text.trim(), promptVal);
            return {
              ...s,
              prompt: promptVal,
              status: 'success',
            };
          })
        );
        showToast('Đã tạo thành công Master Prompt Veo 3 tóm tắt!', 'success');
      } else {
        // Multi-prompt batch mode: process in batches of 10 scenes to avoid LLM hallucination (missing scenes)
        // Giảm CHUNK_SIZE xuống 4 để tránh tải nặng (503) khi text quá dài
        const CHUNK_SIZE = 4;
        // Only process scenes that haven't been successfully generated yet
        const scenesToProcess = scenes.filter((s) => !s.prompt || s.status === 'error');
        const totalScenesToProcess = scenesToProcess.length;
        
        let currentCompleted = scenes.length - totalScenesToProcess;
        let totalSuccess = 0;

        setGenerationProgress({ completed: currentCompleted, total: scenes.length });

        for (let i = 0; i < scenesToProcess.length; i += CHUNK_SIZE) {
          if (isCancelledRef.current) break;

          const currentChunk = scenesToProcess.slice(i, i + CHUNK_SIZE);
          abortControllerRef.current = new AbortController();

          try {
            const res = await fetch('/api/generate-batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: abortControllerRef.current.signal,
              body: JSON.stringify({
                scenes: currentChunk.map((s) => ({
                  id: s.id,
                  sceneNumber: s.sceneNumber,
                  sceneCode: s.sceneCode,
                  text: s.text,
                  words: s.words,
                  duration: s.estimatedDurationSec,
                  subtitle_ids: s.subtitle_ids,
                  start_at: s.start_at,
                  end_at: s.end_at,
                })),
                characters,
                selectedStyles: activeStyleObjects,
                selectedGenres: activeGenreObjects,
                settings,
              }),
            });

            if (isCancelledRef.current) break;

            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.error || 'Lỗi từ máy chủ Gemini API');
            }

            const data = await res.json();
            if (isCancelledRef.current) break;

            const chunkResultsMap = new Map<number, any>();
            if (Array.isArray(data.results)) {
              data.results.forEach((r: any) => {
                if (r.sceneNumber && r.prompt) {
                  chunkResultsMap.set(r.sceneNumber, r);
                }
              });
            }

            totalSuccess += chunkResultsMap.size;

            setScenes((prev) =>
              prev.map((s) => {
                const r = chunkResultsMap.get(s.sceneNumber);
                if (r) {
                  previousPromptsMap.current.set(s.text.trim(), r.prompt);
                  return {
                    ...s,
                    prompt: r.prompt,
                    character: r.character !== undefined ? r.character : s.character,
                    character_info: r.character_info !== undefined ? r.character_info : s.character_info,
                    motion: r.motion !== undefined ? r.motion : s.motion,
                    status: 'success',
                  };
                } else if (currentChunk.some((c) => c.id === s.id)) {
                  return {
                    ...s,
                    status: 'error',
                    errorMessage: 'Không nhận được kết quả cho cảnh này.',
                  };
                }
                return s;
              })
            );

            currentCompleted += currentChunk.length;
            setGenerationProgress({
              completed: Math.min(currentCompleted, scenes.length),
              total: scenes.length,
            });

            // Polite pacing delay (6s) between batches to respect free tier RPM (max 10 requests/minute)
            if (i + CHUNK_SIZE < scenesToProcess.length && !isCancelledRef.current) {
              await new Promise((resolve) => setTimeout(resolve, 6000));
            }
          } catch (err: any) {
            if (err.name === 'AbortError' || isCancelledRef.current) {
              break;
            }
            console.error(err);
            setScenes((prev) =>
              prev.map((s) => {
                if (currentChunk.some((c) => c.id === s.id)) {
                  return { ...s, status: s.prompt ? 'success' : 'error', errorMessage: err.message };
                }
                return s;
              })
            );
            currentCompleted += currentChunk.length;
            setGenerationProgress({
              completed: Math.min(currentCompleted, scenes.length),
              total: scenes.length,
            });
          }
        }

        if (!isCancelledRef.current) {
          showToast(`Đã tạo thành công ${totalSuccess}/${scenes.length} video prompts!`, 'success');
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !isCancelledRef.current) {
        console.error(err);
        setScenes((prev) =>
          prev.map((s) => (s.prompt ? s : { ...s, status: 'error', errorMessage: err.message }))
        );
        showToast(`Lỗi tạo prompt: ${err.message}`, 'error');
      }
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
      abortControllerRef.current = null;
      setScenes((prev) =>
        prev.map((s) => (s.status === 'generating' ? { ...s, status: s.prompt ? 'success' : 'idle' } : s))
      );
    }
  };

  // Generate / Regenerate Single Scene
  const handleGenerateSingleScene = async (sceneId: number) => {
    const targetScene = scenes.find((s) => s.id === sceneId);
    if (!targetScene) return;

    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, status: 'generating', errorMessage: undefined } : s))
    );

    // Find previous scene prompt for continuity
    const targetIndex = scenes.findIndex((s) => s.id === sceneId);
    const prevScene = targetIndex > 0 ? scenes[targetIndex - 1] : null;
    const nextScene = targetIndex < scenes.length - 1 ? scenes[targetIndex + 1] : null;

    try {
      const res = await fetch('/api/generate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene: {
            id: targetScene.id,
            sceneNumber: targetScene.sceneNumber,
            sceneCode: targetScene.sceneCode,
            text: targetScene.text,
            words: targetScene.words,
            duration: targetScene.estimatedDurationSec,
            subtitle_ids: targetScene.subtitle_ids,
            start_at: targetScene.start_at,
            end_at: targetScene.end_at,
          },
          previousScenePrompt: prevScene?.prompt,
          nextSceneText: nextScene?.text,
          characters,
          selectedStyles: activeStyleObjects,
          selectedGenres: activeGenreObjects,
          settings,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Lỗi khi tạo prompt cho cảnh');
      }

      const data = await res.json();
      if (!data.prompt) {
        throw new Error('Không nhận được prompt từ model.');
      }

      previousPromptsMap.current.set(targetScene.text.trim(), data.prompt);

      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId
            ? {
                ...s,
                prompt: data.prompt,
                character: data.character !== undefined ? data.character : s.character,
                character_info: data.character_info !== undefined ? data.character_info : s.character_info,
                motion: data.motion !== undefined ? data.motion : s.motion,
                status: 'success',
              }
            : s
        )
      );
      showToast(`Đã tạo xong prompt cho Cảnh ${targetScene.sceneNumber}!`, 'success');
    } catch (err: any) {
      setScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? { ...s, status: 'error', errorMessage: err.message } : s))
      );
      showToast(`Lỗi: ${err.message}`, 'error');
    }
  };

  // Update scene prompt manually
  const handleUpdateScenePrompt = (sceneId: number, newPrompt: string) => {
    setScenes((prev) =>
      prev.map((s) => {
        if (s.id === sceneId) {
          previousPromptsMap.current.set(s.text.trim(), newPrompt);
          return { ...s, prompt: newPrompt };
        }
        return s;
      })
    );
  };

  // Toggle Styles & Genres
  const handleToggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleGenre = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustomStyle = (name: string, fragment: string) => {
    const newStyle: TagItem = {
      id: `custom-style-${Date.now()}`,
      name,
      fragment,
      isCustom: true,
    };
    const updated = saveCustomStyle(newStyle);
    setStyles(updated);
    setSelectedStyles((prev) => [...prev, newStyle.id]);
    showToast(`Đã thêm phong cách "${name}"`, 'success');
  };

  const handleAddCustomGenre = (name: string, fragment: string) => {
    const newGenre: TagItem = {
      id: `custom-genre-${Date.now()}`,
      name,
      fragment,
      isCustom: true,
    };
    const updated = saveCustomGenre(newGenre);
    setGenres(updated);
    setSelectedGenres((prev) => [...prev, newGenre.id]);
    showToast(`Đã thêm thể loại "${name}"`, 'success');
  };

  // Character Handlers
  const handleAddCharacter = (character: Character) => {
    setCharacters((prev) => [...prev, character]);
    showToast(`Đã thêm nhân vật ${character.name}`, 'success');
  };

  const handleUpdateCharacter = (updated: Character) => {
    setCharacters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast(`Đã cập nhật nhân vật ${updated.name}`, 'success');
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  // Story Presets Handlers
  const handleSelectStoryPreset = (preset: StoryPreset) => {
    setStory(preset.story);
    showToast(`Đã nạp kịch bản "${preset.title}"`, 'info');
  };

  const handleSaveStoryPreset = (title: string, newStory: string) => {
    const newPreset: StoryPreset = {
      id: `story-${Date.now()}`,
      title,
      story: newStory,
      createdAt: Date.now(),
    };
    const updated = [newPreset, ...storyPresets];
    setStoryPresets(updated);
    saveStoredStories(updated);
    showToast(`Đã lưu "${title}" vào Thư viện mẫu!`, 'success');
  };

  const handleDeleteStoryPreset = (id: string) => {
    const updated = storyPresets.filter((p) => p.id !== id);
    setStoryPresets(updated);
    saveStoredStories(updated);
    showToast('Đã xóa kịch bản khỏi Thư viện mẫu.', 'info');
  };

  // Configuration Presets Handlers
  const handleSaveCurrentConfig = (name: string) => {
    const newPreset: ConfigPreset = {
      id: `config-${Date.now()}`,
      name,
      createdAt: Date.now(),
      settings,
      selectedStyles,
      selectedGenres,
      characters,
    };
    const updated = [newPreset, ...configPresets];
    setConfigPresets(updated);
    saveConfigPresets(updated);
    showToast(`Đã lưu cấu hình "${name}"!`, 'success');
  };

  const handleLoadConfig = (preset: ConfigPreset) => {
    if (preset.settings) {
      setSettings((prev) => ({ ...prev, ...preset.settings }));
    }
    if (preset.selectedStyles) {
      setSelectedStyles(preset.selectedStyles);
    }
    if (preset.selectedGenres) {
      setSelectedGenres(preset.selectedGenres);
    }
    if (preset.characters && preset.characters.length > 0) {
      setCharacters(preset.characters);
    }
    showToast(`Đã nạp cấu hình "${preset.name}"!`, 'success');
  };

  const handleDeleteConfig = (id: string) => {
    const updated = configPresets.filter((p) => p.id !== id);
    setConfigPresets(updated);
    saveConfigPresets(updated);
    showToast('Đã xóa cấu hình.', 'info');
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setSelectedStyles(['phim', 'chanthuc']);
    setSelectedGenres(['mystery', 'drama']);
    setCharacters(DEFAULT_CHARACTERS);
    showToast('Đã khôi phục cài đặt mặc định.', 'info');
  };

  // Exports
  const handleExportTxt = () => {
    exportScenesToTxt(scenes, 'Veo3_Prompts');
    showToast('Đã xuất file .TXT thành công!', 'success');
  };

  const handleExportCsv = () => {
    exportScenesToCsv(scenes, 'Veo3_Scenes');
    showToast('Đã xuất file .CSV thành công!', 'success');
  };

  const handleExportJson = () => {
    exportScenesToJson(scenes, 'Story_Scenes');
    showToast('Đã xuất file .JSON chuẩn cho Extension thành công!', 'success');
  };

  const handleExportAllConfig = () => {
    exportAllConfigsToFile();
    showToast('Đã xuất toàn bộ cấu hình dự án thành công!', 'success');
  };

  const handleImportAllConfig = (file: File) => {
    importConfigsFromFile(
      file,
      () => {
        showToast('Nạp cấu hình thành công! Đang tải lại trang...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      },
      (err) => {
        showToast(err, 'error');
      }
    );
  };

  const handleExportPayload = () => {
    const payload = {
      scenes: scenes.map((s) => ({
        id: s.id,
        sceneNumber: s.sceneNumber,
        sceneCode: s.sceneCode,
        text: s.text,
        words: s.words,
        duration: s.estimatedDurationSec,
        subtitle_ids: s.subtitle_ids,
        start_at: s.start_at,
        end_at: s.end_at,
      })),
      characters,
      selectedStyles: activeStyleObjects,
      selectedGenres: activeGenreObjects,
      settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'veo3_setup_payload.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file Setup Payload! Có thể gửi cho AI để xử lý.', 'success');
  };

  const handleCopyJson = () => {
    const jsonStr = getScenesJsonString(scenes);
    navigator.clipboard.writeText(jsonStr);
    showToast('Đã sao chép mảng JSON chuẩn vào clipboard!', 'success');
  };

  const handleCopyAllPrompts = () => {
    const allPromptsText = scenes
      .map((s) => {
        return s.prompt
          ? `--- Cảnh ${s.sceneNumber} (${s.startTimeFormatted}) ---\n${s.prompt}`
          : `--- Cảnh ${s.sceneNumber} ---\n${s.text}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(allPromptsText);
    showToast('Đã sao chép toàn bộ prompts vào clipboard!', 'success');
  };

  const hasGeneratedPrompts = scenes.some((s) => s.prompt && s.prompt.trim().length > 0);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-violet-600 selection:text-white flex flex-col transition-colors">
      {/* Top Header */}
      <Header
        sceneCount={scenes.length}
        isGenerating={isGenerating}
        progress={generationProgress}
        onPreviewScenes={handlePreviewScenes}
        onGeneratePrompts={handleGeneratePrompts}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[90rem] w-full mx-auto px-4 lg:px-8 py-6">
        {/* Real-time Progress Bar Card under Header */}
        {isGenerating && generationProgress && (
          <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-violet-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-5 transition-all animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-spin shrink-0" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Đang tạo prompt...{' '}
                  <span className="font-bold text-violet-700 dark:text-violet-400 font-mono">
                    {generationProgress.completed}/{generationProgress.total}
                  </span>{' '}
                  cảnh
                </span>
              </div>

              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <span className="text-xs font-bold text-violet-700 dark:text-violet-300 font-mono bg-violet-50 dark:bg-violet-950/60 px-2.5 py-1 rounded-md border border-violet-100 dark:border-violet-800">
                  {Math.round(
                    (generationProgress.completed / Math.max(generationProgress.total, 1)) * 100
                  )}%
                </span>
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-900/50 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title="Dừng & Giữ lại kết quả đã hoàn thành"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>Dừng & Giữ lại kết quả</span>
                </button>
              </div>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/80 dark:border-slate-700">
              <div
                className="bg-linear-to-r from-violet-600 via-indigo-600 to-violet-500 h-full rounded-full transition-all duration-300 ease-out shadow-xs"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      Math.round(
                        (generationProgress.completed / Math.max(generationProgress.total, 1)) * 100
                      )
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Main Workflow: Input, Scenes Breakdown & Prompts, Preset Storage) */}
          <div className="lg:col-span-7 space-y-6">
            <StoryInputCard
              story={story}
              onStoryChange={setStory}
              settings={settings}
              onSettingsChange={setSettings}
              storyPresets={storyPresets}
              onSelectPreset={handleSelectStoryPreset}
              onSavePreset={handleSaveStoryPreset}
              onDeletePreset={handleDeleteStoryPreset}
              onExportTxt={handleExportTxt}
              onExportCsv={handleExportCsv}
              onExportJson={handleExportJson}
              onExportPayload={handleExportPayload}
              onCopyAllPrompts={handleCopyAllPrompts}
              onCopyJson={handleCopyJson}
              hasGeneratedPrompts={hasGeneratedPrompts}
            />

            <div ref={sceneListRef}>
              <SceneListCard
                scenes={scenes}
                settings={settings}
                isGenerating={isGenerating}
                onGenerateSingleScene={handleGenerateSingleScene}
                onUpdateScenePrompt={handleUpdateScenePrompt}
                onCopyAllPrompts={handleCopyAllPrompts}
                onExportJson={handleExportJson}
                onCopyJson={handleCopyJson}
              />
            </div>

            <ConfigPresetsCard
              presets={configPresets}
              onSaveCurrentConfig={handleSaveCurrentConfig}
              onLoadConfig={handleLoadConfig}
              onDeleteConfig={handleDeleteConfig}
              onResetDefaults={handleResetDefaults}
              onExportConfig={handleExportAllConfig}
              onImportConfig={handleImportAllConfig}
            />

            <GeneralSettingsCard
              settings={settings}
              onSettingsChange={setSettings}
              scenes={scenes}
            />
          </div>

          {/* Right Column (Styles, Character Sheet & Consistency, General Settings) */}
          <div className="lg:col-span-5 space-y-6">
            <StyleGenreCard
              styles={styles}
              genres={genres}
              selectedStyles={selectedStyles}
              selectedGenres={selectedGenres}
              onToggleStyle={handleToggleStyle}
              onToggleGenre={handleToggleGenre}
              onAddCustomStyle={handleAddCustomStyle}
              onAddCustomGenre={handleAddCustomGenre}
            />

            <CharacterSheetCard
              characters={characters}
              settings={settings}
              onSettingsChange={setSettings}
              onAddCharacter={handleAddCharacter}
              onUpdateCharacter={handleUpdateCharacter}
              onDeleteCharacter={handleDeleteCharacter}
            />

            {/* <GeneralSettingsCard
              settings={settings}
              onSettingsChange={setSettings}
              scenes={scenes}
            /> */}
          </div>
        </div>
        {/* <GeneralSettingsCard
              settings={settings}
              onSettingsChange={setSettings}
              scenes={scenes}
            /> */}
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-violet-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
