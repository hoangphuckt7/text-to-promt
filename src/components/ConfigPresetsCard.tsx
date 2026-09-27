import React, { useState } from 'react';
import { Bookmark, Save, Trash2, ArrowUpRight, RotateCcw } from 'lucide-react';
import { ConfigPreset } from '../types';

interface ConfigPresetsCardProps {
  presets: ConfigPreset[];
  onSaveCurrentConfig: (name: string) => void;
  onLoadConfig: (preset: ConfigPreset) => void;
  onDeleteConfig: (id: string) => void;
  onResetDefaults: () => void;
}

export const ConfigPresetsCard: React.FC<ConfigPresetsCardProps> = ({
  presets,
  onSaveCurrentConfig,
  onLoadConfig,
  onDeleteConfig,
  onResetDefaults,
}) => {
  const [configName, setConfigName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configName.trim()) return;
    onSaveCurrentConfig(configName.trim());
    setConfigName('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
          <Bookmark className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Cấu hình & Lưu trữ cá nhân
        </h2>
      </div>

      {/* Input to save current config */}
      <form onSubmit={handleSave} className="flex items-center gap-2">
        <input
          type="text"
          value={configName}
          onChange={(e) => setConfigName(e.target.value)}
          placeholder="Đặt tên cấu hình hiện tại..."
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 shadow-2xs font-sans"
        />
        <button
          type="submit"
          disabled={!configName.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saveSuccess ? 'Đã lưu!' : 'Lưu cấu hình'}</span>
        </button>
      </form>

      {/* Preset List */}
      {presets.length === 0 ? (
        <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
          Chưa có cấu hình tùy chỉnh nào được lưu. Hãy nhập tên và bấm "Lưu cấu hình" ở trên để lưu lại kịch bản, các phong cách, thể loại, cài đặt nhân vật và quay phim của bạn.
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-violet-50/30 hover:border-violet-200 transition-all flex items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <span className="font-bold text-xs text-slate-800 truncate block">
                  {preset.name}
                </span>
                <span className="text-2xs text-slate-400">
                  {new Date(preset.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onLoadConfig(preset)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold text-violet-700 bg-violet-100/70 hover:bg-violet-200 transition-colors cursor-pointer"
                >
                  <span>Nạp</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteConfig(preset.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Xóa cấu hình này"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Notes */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400">
        <span>* Đã kích hoạt tự động lưu lựa chọn hiện tại</span>
        <button
          type="button"
          onClick={onResetDefaults}
          className="flex items-center gap-1 text-slate-500 hover:text-rose-600 hover:underline cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Khôi phục mặc định</span>
        </button>
      </div>
    </div>
  );
};
