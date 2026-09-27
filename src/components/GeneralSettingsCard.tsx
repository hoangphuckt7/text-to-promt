import React, { useState } from 'react';
import {
  Settings,
  Clock,
  Sparkles,
  Layers,
  Ratio,
  Globe,
  Sliders,
  Plus,
} from 'lucide-react';
import { AppSettings, Scene } from '../types';

interface GeneralSettingsCardProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  scenes: Scene[];
}

export const GeneralSettingsCard: React.FC<GeneralSettingsCardProps> = ({
  settings,
  onSettingsChange,
  scenes,
}) => {
  const [customMinModal, setCustomMinModal] = useState(false);
  const [customMinInput, setCustomMinInput] = useState('4');

  // Compute total estimated duration of current scenes
  const totalSeconds = scenes.reduce((acc, s) => acc + s.estimatedDurationSec, 0);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const durationFormatted = `${mins}m ${secs.toString().padStart(2, '0')}s`;

  const durationOptions = [
    { key: 'auto', label: 'Tự động (Dựa trên cốt truyện)' },
    { key: '1', label: '1 phút (~8 prompts)' },
    { key: '2', label: '2 phút (~15 prompts)' },
    { key: '3', label: '3 phút (~23 prompts)' },
    { key: '5', label: '5 phút (~38 prompts)' },
    { key: '6', label: '6 phút (~45 prompts)' },
    { key: '7', label: '7 phút (~53 prompts)' },
    { key: '8', label: '8 phút (~60 prompts)' },
    { key: '9', label: '9 phút (~68 prompts)' },
    { key: '10', label: '10 phút (~75 prompts)' },
    { key: '15', label: '15 phút (~113 prompts)' },
    { key: '20', label: '20 phút (~150 prompts)' },
  ];

  const handleCustomDurationSave = () => {
    const val = parseFloat(customMinInput);
    if (!isNaN(val) && val > 0) {
      onSettingsChange({
        ...settings,
        targetDurationMinutes: 'custom',
        customMinutes: val,
      });
    }
    setCustomMinModal(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-6">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
          <Settings className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Cài đặt chung
          </h2>
          <p className="text-xs text-slate-500">
            Tùy biến model Veo, thời lượng video, tỉ lệ và độ chi tiết prompt
          </p>
        </div>
      </div>

      {/* MODEL TẠO PROMPT / VEO MODEL */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          MODEL TẠO VIDEO (GOOGLE VEO):
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'Veo 3.1 Pro' as const, label: 'Veo 3.1 Pro', sub: 'Chất lượng cao' },
            { id: 'Veo 3.1 Fast' as const, label: 'Veo 3.1 Fast', sub: 'Nhanh (Khuyến dùng)' },
            { id: 'Veo 3.1 Lite' as const, label: 'Veo 3.1 Lite', sub: 'Tiết kiệm' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSettingsChange({ ...settings, veoModel: m.id })}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                settings.veoModel === m.id
                  ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="font-bold text-xs">{m.label}</div>
              <div
                className={`text-2xs mt-0.5 ${
                  settings.veoModel === m.id ? 'text-violet-100' : 'text-slate-400'
                }`}
              >
                {m.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* LOẠI PROMPT */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          LOẠI PROMPT ĐẦU RA:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSettingsChange({ ...settings, promptType: 'multi' })}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
              settings.promptType === 'multi'
                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <div className="font-bold text-xs">Nhiều Prompt (Mỗi prompt ~8s)</div>
            <div
              className={`text-2xs mt-0.5 ${
                settings.promptType === 'multi' ? 'text-violet-100' : 'text-slate-400'
              }`}
            >
              Tách cảnh độc lập theo dòng thời gian
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSettingsChange({ ...settings, promptType: 'summary' })}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
              settings.promptType === 'summary'
                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <div className="font-bold text-xs">Một Prompt (Tóm tắt)</div>
            <div
              className={`text-2xs mt-0.5 ${
                settings.promptType === 'summary' ? 'text-violet-100' : 'text-slate-400'
              }`}
            >
              Gộp toàn bộ câu chuyện thành 1 video
            </div>
          </button>
        </div>
      </div>

      {/* THỜI LƯỢNG VIDEO */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            THỜI LƯỢNG VIDEO MỤC TIÊU:
          </label>
          <span className="text-2xs text-slate-400">
            Hệ thống tự động căn chỉnh số từ/cảnh để khớp thời lượng
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
          {durationOptions.map((opt) => {
            const isSelected = settings.targetDurationMinutes === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    targetDurationMinutes: opt.key,
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-violet-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setCustomMinModal(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
              settings.targetDurationMinutes === 'custom'
                ? 'bg-violet-600 text-white font-semibold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>
              {settings.targetDurationMinutes === 'custom'
                ? `${settings.customMinutes} phút (Tùy chỉnh)`
                : 'Thêm'}
            </span>
          </button>
        </div>
      </div>

      {/* TỈ LỆ KHUNG HÌNH & NGÔN NGỮ & ĐỘ CHI TIẾT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tỉ lệ khung hình */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
            <Ratio className="w-3.5 h-3.5 text-violet-600" />
            TỈ LỆ KHUNG HÌNH:
          </label>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            {(['16:9', '9:16', '1:1'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onSettingsChange({ ...settings, aspectRatio: r })}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  settings.aspectRatio === r
                    ? 'bg-white text-violet-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Ngôn ngữ prompt */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-violet-600" />
            NGÔN NGỮ PROMPT:
          </label>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            {(
              [
                { id: 'en' as const, label: 'Tiếng Anh (Veo)' },
                { id: 'vi' as const, label: 'Tiếng Việt' },
              ] as const
            ).map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => onSettingsChange({ ...settings, promptLanguage: lang.id })}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  settings.promptLanguage === lang.id
                    ? 'bg-white text-violet-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Độ chi tiết */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-violet-600" />
            ĐỘ CHI TIẾT PROMPT:
          </label>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            {(
              [
                { id: 'low' as const, label: 'Thấp' },
                { id: 'medium' as const, label: 'Trung bình' },
                { id: 'high' as const, label: 'Cao' },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => onSettingsChange({ ...settings, promptDetail: d.id })}
                className={`flex-1 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  settings.promptDetail === d.id
                    ? 'bg-white text-violet-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PHÂN TÍCH CỐT TRUYỆN BANNER (PURPLE CARD MATCHING IMAGE 4) */}
      <div className="rounded-2xl bg-violet-600 text-white p-5 shadow-md shadow-violet-200 space-y-4">
        <div className="flex items-center justify-between border-b border-violet-400/40 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-200" />
            PHÂN TÍCH CỐT TRUYỆN ({settings.splitMode === 'speech_rate' ? 'THEO TỐC ĐỘ NÓI' : 'THEO CÂU ĐƠN'})
          </span>
          <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-violet-500/70 border border-violet-400/50 text-white">
            Veo 3 Ready
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xs font-semibold uppercase text-violet-200">
              THỜI LƯỢNG THOẠI ƯỚC TÍNH
            </div>
            <div className="text-2xl font-black tracking-tight text-white mt-0.5">
              {durationFormatted}
            </div>
          </div>

          <div>
            <div className="text-2xs font-semibold uppercase text-violet-200">
              CẤU TRÚC ({settings.splitMode === 'single_sentence' ? '1 CÂU / CẢNH' : '~8S / CẢNH'})
            </div>
            <div className="text-2xl font-black tracking-tight text-white mt-0.5">
              {scenes.length} {settings.splitMode === 'single_sentence' ? 'Câu / Prompts' : 'Cảnh / Prompts'}
            </div>
          </div>
        </div>

        <div className="text-2xs text-violet-100/90 pt-2 border-t border-violet-400/40 leading-relaxed">
          Quy tắc: 1 Prompt = 1 Cảnh ứng với ~8s hoặc 1 câu đơn trong kịch bản. Tỉ lệ: {settings.aspectRatio} | Model: {settings.veoModel}.
        </div>
      </div>

      {/* Custom Duration Modal */}
      {customMinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Nhập số phút mục tiêu
            </h3>
            <p className="text-xs text-slate-500">
              Hệ thống sẽ tự động tính toán số cảnh và số từ mỗi cảnh để tổng thời lượng video đạt số phút mong muốn.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.5"
                max="60"
                step="0.5"
                value={customMinInput}
                onChange={(e) => setCustomMinInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
                autoFocus
              />
              <span className="text-sm font-semibold text-slate-700 shrink-0">phút</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomMinModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCustomDurationSave}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
