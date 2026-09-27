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
} from './utils/storage';
import { splitStoryIntoScenes } from './utils/sceneSplitter';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function App() {
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

  // Scenes & Generation state
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const sceneListRef = useRef<HTMLDivElement>(null);
  const previousPromptsMap = useRef<Map<string, string>>(new Map());

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

  // Generate Prompts for all scenes
  const handleGeneratePrompts = async () => {
    if (!story.trim() || scenes.length === 0) {
      showToast('Vui lòng nhập câu chuyện trước khi tạo prompts.', 'error');
      return;
    }

    setIsGenerating(true);
    setScenes((prev) => prev.map((s) => ({ ...s, status: 'generating', errorMessage: undefined })));

    try {
      if (settings.promptType === 'summary') {
        // Generate single master summary prompt
        const res = await fetch('/api/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            story,
            characters,
            selectedStyles: activeStyleObjects,
            selectedGenres: activeGenreObjects,
            settings,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Lỗi khi tạo master prompt');
        }

        const data = await res.json();
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
        // Multi-prompt batch mode
        const res = await fetch('/api/generate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenes: scenes.map((s) => ({
              id: s.id,
              sceneNumber: s.sceneNumber,
              text: s.text,
              words: s.words,
              duration: s.estimatedDurationSec,
            })),
            characters,
            selectedStyles: activeStyleObjects,
            selectedGenres: activeGenreObjects,
            settings,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Lỗi từ máy chủ Gemini API');
        }

        const data = await res.json();
        const resultsMap = new Map<number, string>();
        if (Array.isArray(data.results)) {
          data.results.forEach((r: any) => {
            if (r.sceneNumber && r.prompt) {
              resultsMap.set(r.sceneNumber, r.prompt);
            }
          });
        }

        setScenes((prev) =>
          prev.map((s) => {
            const p = resultsMap.get(s.sceneNumber);
            if (p) {
              previousPromptsMap.current.set(s.text.trim(), p);
              return {
                ...s,
                prompt: p,
                status: 'success',
              };
            }
            return {
              ...s,
              status: 'error',
              errorMessage: 'Không nhận được kết quả cho cảnh này.',
            };
          })
        );

        showToast(`Đã tạo thành công ${resultsMap.size}/${scenes.length} video prompts!`, 'success');
      }

      // Scroll to scenes view
      handlePreviewScenes();
    } catch (err: any) {
      console.error(err);
      setScenes((prev) =>
        prev.map((s) => (s.prompt ? s : { ...s, status: 'error', errorMessage: err.message }))
      );
      showToast(`Lỗi tạo prompt: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
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
            text: targetScene.text,
            words: targetScene.words,
            duration: targetScene.estimatedDurationSec,
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
        prev.map((s) => (s.id === sceneId ? { ...s, prompt: data.prompt, status: 'success' } : s))
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
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased selection:bg-violet-600 selection:text-white flex flex-col">
      {/* Top Header */}
      <Header
        sceneCount={scenes.length}
        isGenerating={isGenerating}
        onPreviewScenes={handlePreviewScenes}
        onGeneratePrompts={handleGeneratePrompts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
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
              onCopyAllPrompts={handleCopyAllPrompts}
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
              />
            </div>

            <ConfigPresetsCard
              presets={configPresets}
              onSaveCurrentConfig={handleSaveCurrentConfig}
              onLoadConfig={handleLoadConfig}
              onDeleteConfig={handleDeleteConfig}
              onResetDefaults={handleResetDefaults}
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

            <GeneralSettingsCard
              settings={settings}
              onSettingsChange={setSettings}
              scenes={scenes}
            />
          </div>
        </div>
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
