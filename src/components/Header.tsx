import React from 'react';
import { Video, Eye, Sparkles, Loader2, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  sceneCount: number;
  isGenerating: boolean;
  progress?: { completed: number; total: number } | null;
  onPreviewScenes: () => void;
  onGeneratePrompts: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sceneCount,
  isGenerating,
  progress,
  onPreviewScenes,
  onGeneratePrompts,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-200 dark:shadow-none shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Veo Story-to-Prompt
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800">
                Veo 3.1
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Professional video prompt engineering for Gemini Veo
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-amber-300 dark:hover:bg-slate-700/80 transition-all shadow-2xs cursor-pointer"
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            aria-label="Chuyển chế độ sáng/tối"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 hover:text-violet-600 transition-colors" />
            )}
          </button>

          <button
            onClick={onPreviewScenes}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700/80 dark:hover:border-slate-600 transition-colors shadow-2xs hover:border-slate-300 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Xem phân cảnh ({sceneCount} cảnh)</span>
          </button>

          <button
            onClick={onGeneratePrompts}
            disabled={isGenerating || sceneCount === 0}
            className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-md transition-all ${
              isGenerating || sceneCount === 0
                ? 'bg-violet-400 cursor-not-allowed opacity-90'
                : 'bg-violet-600 hover:bg-violet-700 hover:shadow-violet-200 active:scale-98 cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span className="font-mono font-bold tracking-wide">
                  {progress && progress.total > 0
                    ? `${progress.completed}/${progress.total}`
                    : 'Đang tạo...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-violet-200" />
                <span>Tạo Prompts ({sceneCount} cảnh)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
