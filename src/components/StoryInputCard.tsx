import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Trash2,
  BookmarkPlus,
  BookOpen,
  Sparkles,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { AppSettings, StoryPreset } from '../types';

interface StoryInputCardProps {
  story: string;
  onStoryChange: (story: string) => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  storyPresets: StoryPreset[];
  onSelectPreset: (preset: StoryPreset) => void;
  onSavePreset: (title: string, story: string) => void;
  onDeletePreset: (id: string) => void;
  onExportTxt: () => void;
  onExportCsv: () => void;
  onCopyAllPrompts: () => void;
  hasGeneratedPrompts: boolean;
}

export const StoryInputCard: React.FC<StoryInputCardProps> = ({
  story,
  onStoryChange,
  settings,
  onSettingsChange,
  storyPresets,
  onSelectPreset,
  onSavePreset,
  onDeletePreset,
  onExportTxt,
  onExportCsv,
  onCopyAllPrompts,
  hasGeneratedPrompts,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'library'>('manual');
  const [isCopied, setIsCopied] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newPresetTitle, setNewPresetTitle] = useState('');

  const characterCount = story.length;
  const wordCount = story.trim() ? story.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleCopy = () => {
    if (hasGeneratedPrompts) {
      onCopyAllPrompts();
    } else {
      navigator.clipboard.writeText(story);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveToLibrary = () => {
    if (!newPresetTitle.trim() || !story.trim()) return;
    onSavePreset(newPresetTitle.trim(), story.trim());
    setNewPresetTitle('');
    setSaveModalOpen(false);
    setActiveTab('library');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
      {/* Card Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Nội dung câu chuyện / kịch bản
            </h2>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-500">
            <span className="text-violet-700 font-semibold">{characterCount.toLocaleString()} KÝ TỰ</span>
            <span>•</span>
            <span className="text-slate-600">{wordCount.toLocaleString()} TỪ</span>
          </div>
        </div>

        {/* Action buttons (Txt, Csv, Copy) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportTxt}
            title="Xuất toàn bộ prompt ra file TXT"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Xuất .TXT</span>
          </button>

          <button
            onClick={onExportCsv}
            title="Xuất kịch bản & prompt ra bảng CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Xuất .CSV</span>
          </button>

          <button
            onClick={handleCopy}
            title={hasGeneratedPrompts ? 'Sao chép tất cả prompt đã tạo' : 'Sao chép nội dung truyện'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Đã chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs: Nhập thủ công vs Thư viện mẫu */}
      <div className="flex items-center border-b border-slate-100 px-5 bg-slate-50/50">
        <button
          onClick={() => setActiveTab('manual')}
          className={`py-3 px-4 text-xs font-bold tracking-wide uppercase transition-all border-b-2 cursor-pointer ${
            activeTab === 'manual'
              ? 'border-violet-600 text-violet-700 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Nhập thủ công
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`py-3 px-4 text-xs font-bold tracking-wide uppercase transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'library'
              ? 'border-violet-600 text-violet-700 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Thư viện mẫu</span>
          <span className="text-2xs font-semibold px-1.5 py-0.2 rounded-full bg-violet-100 text-violet-700">
            {storyPresets.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {activeTab === 'manual' ? (
          <div className="space-y-4">
            {/* Chế độ phân cảnh Selector */}
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  Chế độ phân cảnh:
                </span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                  {settings.splitMode === 'speech_rate' ? 'Tốc độ đọc ~8s / Prompt' : 'Mỗi câu đơn = 1 Prompt'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Mode 1: Tốc độ nói */}
                <button
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, splitMode: 'speech_rate' })}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    settings.splitMode === 'speech_rate'
                      ? 'border-violet-600 bg-violet-50/40 ring-1 ring-violet-600/30 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-violet-600" />
                      Tốc độ nói (~8s)
                    </span>
                    <span className="text-2xs font-medium px-2 py-0.5 rounded-md bg-violet-100 text-violet-700">
                      ~8s / Cảnh
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
                    Tự động gom từ ngữ theo tốc độ đọc của người dẫn chuyện để khớp thời lượng chuẩn 8 giây của video Google Veo.
                  </p>
                </button>

                {/* Mode 2: Từng câu đơn */}
                <button
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, splitMode: 'single_sentence' })}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    settings.splitMode === 'single_sentence'
                      ? 'border-violet-600 bg-violet-50/40 ring-1 ring-violet-600/30 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-violet-600" />
                      Từng câu đơn
                    </span>
                    <span className="text-2xs font-medium px-2 py-0.5 rounded-md bg-violet-100 text-violet-700">
                      1 Câu = 1 Cảnh
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
                    Mỗi câu đơn hoặc lời thoại kịch bản tạo thành 1 phân cảnh độc lập, bám sát từng nhịp diễn đạt của câu chuyện.
                  </p>
                </button>
              </div>

              {/* Adjust words/scene when in speech_rate mode */}
              {settings.splitMode === 'speech_rate' && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span>Số từ mục tiêu mỗi cảnh:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={12}
                      max={40}
                      value={settings.wordsPerScene}
                      onChange={(e) =>
                        onSettingsChange({
                          ...settings,
                          wordsPerScene: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-24 accent-violet-600 cursor-pointer"
                    />
                    <span className="font-semibold text-violet-700 w-12 text-right">
                      {settings.wordsPerScene} từ
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Story Textarea */}
            <div className="relative">
              <textarea
                value={story}
                onChange={(e) => onStoryChange(e.target.value)}
                placeholder="Dán hoặc nhập câu chuyện, kịch bản video ngắn của bạn vào đây (ví dụ: review, tin tức, truyện ma, câu chuyện lịch sử, anime, kịch bản viral TikTok / Shorts)..."
                rows={9}
                className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm leading-relaxed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 resize-y shadow-2xs font-sans transition-all"
              />
              {story && (
                <div className="flex justify-between items-center mt-2 px-1">
                  <button
                    type="button"
                    onClick={() => setSaveModalOpen(true)}
                    className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium hover:underline cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Lưu vào Thư viện mẫu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStoryChange('')}
                    className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xoá nội dung</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Library Tab */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Chọn một kịch bản mẫu để nạp nhanh vào trình soạn thảo:</span>
              <button
                type="button"
                onClick={() => {
                  setNewPresetTitle('');
                  setSaveModalOpen(true);
                }}
                className="text-xs font-semibold text-violet-600 hover:text-violet-700 cursor-pointer"
              >
                + Lưu truyện hiện tại
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {storyPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-violet-50/30 hover:border-violet-300 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-violet-600 shrink-0" />
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {preset.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {preset.story}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPreset(preset);
                        setActiveTab('manual');
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors cursor-pointer"
                    >
                      Nạp
                    </button>
                    {/* Allow deleting presets */}
                    <button
                      type="button"
                      onClick={() => onDeletePreset(preset.id)}
                      title="Xóa kịch bản này"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Lưu vào Thư viện kịch bản mẫu
            </h3>
            <p className="text-xs text-slate-500">
              Đặt tên gợi nhớ cho câu chuyện này để bạn có thể tái sử dụng bất cứ lúc nào.
            </p>
            <input
              type="text"
              value={newPresetTitle}
              onChange={(e) => setNewPresetTitle(e.target.value)}
              placeholder="Ví dụ: Kịch bản Trinh thám Sài Gòn tập 1..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveToLibrary}
                disabled={!newPresetTitle.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
