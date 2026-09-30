import React, { useState } from 'react';
import { Palette, Plus, Check, X, Info } from 'lucide-react';
import { TagItem } from '../types';

interface StyleGenreCardProps {
  styles: TagItem[];
  genres: TagItem[];
  selectedStyles: string[];
  selectedGenres: string[];
  onToggleStyle: (id: string) => void;
  onToggleGenre: (id: string) => void;
  onAddCustomStyle: (name: string, fragment: string) => void;
  onAddCustomGenre: (name: string, fragment: string) => void;
}

export const StyleGenreCard: React.FC<StyleGenreCardProps> = ({
  styles,
  genres,
  selectedStyles,
  selectedGenres,
  onToggleStyle,
  onToggleGenre,
  onAddCustomStyle,
  onAddCustomGenre,
}) => {
  const [modalType, setModalType] = useState<'style' | 'genre' | null>(null);
  const [customName, setCustomName] = useState('');
  const [customFragment, setCustomFragment] = useState('');
  const [hoveredTag, setHoveredTag] = useState<TagItem | null>(null);

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const frag = customFragment.trim() || `${customName.trim()} aesthetic, high production value`;
    if (modalType === 'style') {
      onAddCustomStyle(customName.trim(), frag);
    } else if (modalType === 'genre') {
      onAddCustomGenre(customName.trim(), frag);
    }

    setCustomName('');
    setCustomFragment('');
    setModalType(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Phong cách & Thể loại
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chọn một hoặc nhiều tag để định hình thẩm mỹ và màu sắc video
            </p>
          </div>
        </div>
      </div>

      {/* Group 1: Phong Cách */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            PHONG CÁCH ({selectedStyles.length} đã chọn)
          </span>
          <button
            type="button"
            onClick={() => setModalType('style')}
            className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm phong cách</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 pr-1">
          {styles.map((style) => {
            const isSelected = selectedStyles.includes(style.id);
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onToggleStyle(style.id)}
                onMouseEnter={() => setHoveredTag(style)}
                onMouseLeave={() => setHoveredTag(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-violet-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                <span>{style.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Group 2: Thể Loại */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            THỂ LOẠI ({selectedGenres.length} đã chọn)
          </span>
          <button
            type="button"
            onClick={() => setModalType('genre')}
            className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm thể loại</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          {genres.map((genre) => {
            const isSelected = selectedGenres.includes(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => onToggleGenre(genre.id)}
                onMouseEnter={() => setHoveredTag(genre)}
                onMouseLeave={() => setHoveredTag(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-violet-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                <span>{genre.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag description info preview */}
      {hoveredTag && (
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">{hoveredTag.name}: </span>
            <span className="italic font-mono text-2xs text-slate-600 dark:text-slate-400">{hoveredTag.fragment}</span>
          </div>
        </div>
      )}

      {/* Custom Tag Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-2xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Thêm {modalType === 'style' ? 'phong cách hình ảnh' : 'thể loại nội dung'} mới
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên hiển thị:
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={modalType === 'style' ? 'Ví dụ: Retro 80s Synthwave' : 'Ví dụ: Trinh thám Noir'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Đoạn mô tả prompt (Fragment) chèn vào prompt Veo 3:
                </label>
                <textarea
                  value={customFragment}
                  onChange={(e) => setCustomFragment(e.target.value)}
                  placeholder="Ví dụ: neon lights, saturated magenta and cyan hues, retro CRT scanline texture, 1980s VHS tape aesthetic..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!customName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Lưu & Áp dụng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
