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
} from 'lucide-react';
import { AppSettings, Scene } from '../types';

interface SceneListCardProps {
  scenes: Scene[];
  settings: AppSettings;
  isGenerating: boolean;
  onGenerateSingleScene: (sceneId: number) => void;
  onUpdateScenePrompt: (sceneId: number, newPrompt: string) => void;
  onCopyAllPrompts: () => void;
}

export const SceneListCard: React.FC<SceneListCardProps> = ({
  scenes,
  settings,
  isGenerating,
  onGenerateSingleScene,
  onUpdateScenePrompt,
  onCopyAllPrompts,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

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

  const isSentenceMode = settings.splitMode === 'single_sentence';
  const hasPrompts = scenes.some((s) => s.prompt && s.prompt.trim().length > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase">
              {isSentenceMode
                ? 'PHÂN CẢNH THEO TỪNG CÂU ĐƠN'
                : 'PHÂN CẢNH THEO TỐC ĐỘ NÓI (~8S)'}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {scenes.length} {isSentenceMode ? 'câu' : 'cảnh'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isSentenceMode
              ? 'Kịch bản được tách tự động theo từng câu đơn (dấu chấm, chấm than, hỏi, ngắt dòng). Mỗi câu tương ứng 1 prompt độc lập.'
              : `Kịch bản gom tự động theo tốc độ đọc chuẩn (~${settings.wordsPerScene} từ/cảnh). Mỗi phân cảnh khớp thời lượng chuẩn 8 giây của Google Veo.`}
          </p>
        </div>

        {hasPrompts && (
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors cursor-pointer shrink-0"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã sao chép tất cả!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-violet-600" />
                <span>Sao chép tất cả Prompts</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Scenes List */}
      <div className="p-5 space-y-4">
        {scenes.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">Chưa có nội dung phân cảnh.</p>
            <p className="text-xs text-slate-400 mt-1">
              Hãy nhập câu chuyện vào ô trên hoặc chọn một kịch bản từ Thư viện mẫu.
            </p>
          </div>
        ) : (
          scenes.map((scene) => (
            <div
              key={scene.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                scene.status === 'generating'
                  ? 'border-violet-400 bg-violet-50/20 ring-2 ring-violet-500/20'
                  : scene.status === 'error'
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Scene Card Header */}
              <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    C{scene.sceneNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {isSentenceMode ? `Câu ${scene.sceneNumber}` : `Cảnh ${scene.sceneNumber}`}
                    </span>
                    <span className="text-2xs font-medium text-slate-500 px-1.5 py-0.5 rounded bg-slate-200/60">
                      {scene.words} từ
                    </span>
                    <span className="text-2xs font-medium text-slate-400">
                      Bắt đầu: {scene.startTimeFormatted}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                    ~{scene.estimatedDurationSec}s thoại
                  </span>
                  {scene.prompt && (
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(scene.id, scene.prompt!)}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold text-violet-700 bg-violet-100 hover:bg-violet-200 border border-violet-200 transition-all cursor-pointer"
                      title="Sao chép nhanh prompt"
                    >
                      {copiedId === scene.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Đã chép</span>
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
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {scene.text}
                </p>

                {/* Detected Characters */}
                {scene.detectedCharacters && scene.detectedCharacters.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <Users className="w-3.5 h-3.5 text-violet-600" />
                    <span className="text-2xs font-medium text-slate-500">Nhân vật trong cảnh:</span>
                    <div className="flex flex-wrap gap-1">
                      {scene.detectedCharacters.map((cName, i) => (
                        <span
                          key={i}
                          className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-violet-100 text-violet-700"
                        >
                          {cName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompt Section */}
                <div className="mt-3.5 pt-3.5 border-t border-slate-100">
                  {scene.prompt ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-2xs">
                        <span className="font-bold uppercase tracking-wider text-violet-700 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-violet-600" />
                          Veo 3 Video Prompt (Cảnh {scene.sceneNumber}):
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingId(editingId === scene.id ? null : scene.id)
                            }
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                            title="Chỉnh sửa prompt"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onGenerateSingleScene(scene.id)}
                            disabled={isGenerating || scene.status === 'generating'}
                            className="p-1 rounded text-slate-500 hover:text-violet-600 hover:bg-violet-50 cursor-pointer disabled:opacity-50"
                            title="Tạo lại prompt cho riêng cảnh này"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${
                                scene.status === 'generating' ? 'animate-spin text-violet-600' : ''
                              }`}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(scene.id, scene.prompt!)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-violet-700 bg-violet-100 hover:bg-violet-200 border border-violet-300 transition-all cursor-pointer shadow-2xs active:scale-95"
                            title="Sao chép prompt của cảnh này"
                          >
                            {copiedId === scene.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                                <span className="text-emerald-700">Đã chép prompt!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-violet-700" />
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
                          className="w-full p-2.5 rounded-lg border border-violet-300 bg-violet-50/20 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono leading-relaxed"
                        />
                      ) : (
                        <div className="relative group">
                          <div className="p-3.5 pr-28 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed selection:bg-violet-500 selection:text-white break-words border border-slate-800">
                            {scene.prompt}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(scene.id, scene.prompt!)}
                            className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-2xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-sm cursor-pointer active:scale-95"
                            title="Sao chép prompt"
                          >
                            {copiedId === scene.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-300 stroke-[2.5]" />
                                <span className="text-emerald-300">Đã chép!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-violet-200" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : scene.status === 'generating' ? (
                    <div className="py-4 flex items-center justify-center gap-2 text-violet-600 text-xs font-semibold">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tạo prompt Veo 3 bằng Gemini AI...</span>
                    </div>
                  ) : scene.status === 'error' ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
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
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>Chưa tạo prompt cho cảnh này.</span>
                      <button
                        type="button"
                        onClick={() => onGenerateSingleScene(scene.id)}
                        disabled={isGenerating}
                        className="flex items-center gap-1 text-2xs font-semibold text-violet-600 hover:text-violet-700 hover:underline cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Tạo prompt riêng</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
