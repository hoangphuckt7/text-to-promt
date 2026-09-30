import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Users,
  AlertCircle,
  Clock,
  Edit3,
  Download,
  FileJson,
} from 'lucide-react';
import { AppSettings, Scene } from '../types';

interface SceneListCardProps {
  scenes: Scene[];
  settings: AppSettings;
  isGenerating: boolean;
  onGenerateSingleScene: (sceneId: number) => void;
  onUpdateScenePrompt: (sceneId: number, newPrompt: string) => void;
  onCopyAllPrompts: () => void;
  onExportJson?: () => void;
  onCopyJson?: () => void;
}

export const SceneListCard: React.FC<SceneListCardProps> = ({
  scenes,
  settings,
  isGenerating,
  onGenerateSingleScene,
  onUpdateScenePrompt,
  onCopyAllPrompts,
  onExportJson,
  onCopyJson,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleCopyPrompt = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    onCopyAllPrompts();
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyJsonClick = () => {
    if (onCopyJson) {
      onCopyJson();
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const isSentenceMode = settings.splitMode === 'single_sentence';
  const hasPrompts = scenes.some((s) => s.prompt && s.prompt.trim().length > 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight uppercase">
              {isSentenceMode
                ? 'PHÂN CẢNH THEO TỪNG CÂU ĐƠN'
                : 'PHÂN CẢNH THEO TỐC ĐỘ NÓI (~8S)'}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
              {scenes.length} {isSentenceMode ? 'câu' : 'cảnh'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSentenceMode
              ? 'Kịch bản được tách tự động theo từng câu đơn (dấu chấm, chấm than, hỏi, ngắt dòng). Mỗi câu tương ứng 1 prompt độc lập.'
              : `Kịch bản gom tự động theo tốc độ đọc chuẩn (~${settings.wordsPerScene} từ/cảnh). Mỗi phân cảnh khớp thời lượng chuẩn của video.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onExportJson && (
            <button
              onClick={onExportJson}
              title="Xuất mảng JSON chuẩn (id, character, character_info, prompt, subtitle_ids, start_at, end_at, motion)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <FileJson className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Xuất .JSON</span>
            </button>
          )}

          {onCopyJson && (
            <button
              onClick={handleCopyJsonClick}
              title="Sao chép toàn bộ mảng JSON chuẩn vào clipboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors cursor-pointer shrink-0"
            >
              {copiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Đã chép JSON!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  <span>Sao chép JSON</span>
                </>
              )}
            </button>
          )}

          {hasPrompts && (
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 dark:bg-violet-950/50 dark:hover:bg-violet-900/60 dark:border-violet-800 dark:text-violet-300 transition-colors cursor-pointer shrink-0"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Đã sao chép tất cả!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span>Sao chép tất cả Prompts</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Scenes List */}
      <div className="p-5 space-y-4 max-h-120 overflow-y-auto">
        {scenes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium">Chưa có nội dung phân cảnh.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Hãy nhập câu chuyện vào ô trên hoặc chọn một kịch bản từ Thư viện mẫu.
            </p>
          </div>
        ) : (
          scenes.map((scene, idx) => {
            const sceneCode = scene.sceneCode || `SC${(idx + 1).toString().padStart(2, '0')}`;
            const subIds = scene.subtitle_ids && scene.subtitle_ids.length > 0 ? scene.subtitle_ids : [scene.sceneNumber || idx + 1];

            return (
              <div
                key={scene.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  scene.status === 'generating'
                    ? 'border-violet-400 dark:border-violet-500 bg-violet-50/20 dark:bg-violet-950/20 ring-2 ring-violet-500/20'
                    : scene.status === 'error'
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20'
                    : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                }`}
              >
                {/* Scene Card Header */}
                <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {sceneCode}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isSentenceMode ? `Câu ${scene.sceneNumber}` : `Cảnh ${scene.sceneNumber}`}
                      </span>
                      <span className="text-2xs font-semibold text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800">
                        Sub: [{subIds.join(', ')}]
                      </span>
                      <span className="text-2xs font-mono text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800">
                        {scene.start_at || scene.startTimeFormatted} ➔ {scene.end_at || '...'}
                      </span>
                      <span className="text-2xs font-medium text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800/80">
                        {scene.words} từ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                      ~{scene.estimatedDurationSec}s thoại
                    </span>
                    {scene.prompt && (
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(scene.id, scene.prompt!)}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/80 hover:bg-violet-200 dark:hover:bg-violet-900/60 border border-violet-200 dark:border-violet-800 transition-all cursor-pointer"
                        title="Sao chép nhanh prompt"
                      >
                        {copiedId === scene.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-700 dark:text-emerald-400">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Scene Original Text */}
                <div className="p-4">
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {scene.text}
                  </p>

                  {/* Character Meta Information */}
                  {((scene.character && scene.character.trim().length > 0) || (scene.detectedCharacters && scene.detectedCharacters.length > 0)) && (
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                      <span className="text-2xs font-medium text-slate-500 dark:text-slate-400">Nhân vật:</span>
                      <div className="flex flex-wrap gap-1">
                        {(scene.character || scene.detectedCharacters?.join('; ') || '')
                          .split(';')
                          .map((c) => c.trim())
                          .filter(Boolean)
                          .map((cName, i) => (
                            <span
                              key={i}
                              className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60"
                            >
                              {cName}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {scene.character_info && scene.character_info.trim().length > 0 && (
                    <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-2xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Mô tả tham chiếu: </span>
                      {scene.character_info}
                    </div>
                  )}

                  {/* Prompt Section */}
                  <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                    {scene.prompt ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-2xs">
                          <span className="font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                            Prompt hình ảnh ({sceneCode}):
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingId(editingId === scene.id ? null : scene.id)
                              }
                              className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="Chỉnh sửa prompt"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onGenerateSingleScene(scene.id)}
                              disabled={isGenerating || scene.status === 'generating'}
                              className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                              title="Tạo lại prompt cho riêng cảnh này"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${
                                  scene.status === 'generating' ? 'animate-spin text-violet-600 dark:text-violet-400' : ''
                                }`}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyPrompt(scene.id, scene.prompt!)}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/80 hover:bg-violet-200 dark:hover:bg-violet-900/60 border border-violet-300 dark:border-violet-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                              title="Sao chép prompt của cảnh này"
                            >
                              {copiedId === scene.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                                  <span className="text-emerald-700 dark:text-emerald-400">Đã chép prompt!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-violet-700 dark:text-violet-300" />
                                  <span>Sao chép Prompt</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {editingId === scene.id ? (
                          <textarea
                            value={scene.prompt}
                            onChange={(e) => onUpdateScenePrompt(scene.id, e.target.value)}
                            rows={3}
                            className="w-full p-2.5 rounded-lg border border-violet-300 dark:border-violet-600 bg-violet-50/20 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono leading-relaxed"
                          />
                        ) : (
                          <div className="relative group">
                            <div className="p-3.5 pr-6 rounded-xl bg-slate-900 dark:bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed selection:bg-violet-500 selection:text-white break-words border border-slate-800">
                              {scene.prompt}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : scene.status === 'generating' ? (
                      <div className="py-4 flex items-center justify-center gap-2 text-violet-600 dark:text-violet-400 text-xs font-semibold">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang tạo prompt bằng Gemini AI...</span>
                      </div>
                    ) : scene.status === 'error' ? (
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{scene.errorMessage || 'Lỗi khi tạo prompt cho cảnh này.'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onGenerateSingleScene(scene.id)}
                          className="px-2.5 py-1 rounded bg-rose-600 text-white text-2xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
                        >
                          Thử lại
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-1">
                        <span>Chưa tạo prompt cho cảnh này.</span>
                        <button
                          type="button"
                          onClick={() => onGenerateSingleScene(scene.id)}
                          disabled={isGenerating}
                          className="flex items-center gap-1 text-2xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Tạo prompt riêng</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
