import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Dice5,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AppSettings, Character } from '../types';

interface CharacterSheetCardProps {
  characters: Character[];
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onAddCharacter: (character: Character) => void;
  onUpdateCharacter: (character: Character) => void;
  onDeleteCharacter: (id: string) => void;
}

export const CharacterSheetCard: React.FC<CharacterSheetCardProps> = ({
  characters,
  settings,
  onSettingsChange,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [voice, setVoice] = useState('');
  const [showAllToggles, setShowAllToggles] = useState(true);

  const openAddModal = () => {
    setEditingChar(null);
    setName('');
    setDescription('');
    setVoice('');
    setModalOpen(true);
  };

  const openEditModal = (char: Character) => {
    setEditingChar(char);
    setName(char.name);
    setDescription(char.description);
    setVoice(char.voice || '');
    setModalOpen(true);
  };

  const handleSaveCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingChar) {
      onUpdateCharacter({
        ...editingChar,
        name: name.trim(),
        description: description.trim(),
        voice: voice.trim() || undefined,
      });
    } else {
      onAddCharacter({
        id: `char-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        voice: voice.trim() || undefined,
      });
    }
    setModalOpen(false);
  };

  const generateRandomSeed = () => {
    const random = Math.floor(10000 + Math.random() * 900000);
    onSettingsChange({ ...settings, seed: random });
  };

  const toggles = [
    {
      key: 'syncCharacters' as const,
      label: 'Đồng bộ các nhân vật',
      value: settings.syncCharacters,
    },
    {
      key: 'alwaysCallByName' as const,
      label: 'Đặt tên cho nhân vật và luôn gọi bằng tên đó',
      value: settings.alwaysCallByName,
    },
    {
      key: 'immutableCharacterDetails' as const,
      label: 'Viết Character Sheet mô tả các chi tiết không thay đổi',
      value: settings.immutableCharacterDetails,
    },
    {
      key: 'copyFullCharacterSheet' as const,
      label: 'Sao chép toàn bộ Character Sheet vào đầu mỗi prompt mới',
      value: settings.copyFullCharacterSheet,
    },
    {
      key: 'useEmotionsAndExpressions' as const,
      label: 'Sử dụng các từ khóa mô tả cảm xúc và biểu cảm khuôn mặt',
      value: settings.useEmotionsAndExpressions,
    },
    {
      key: 'useCameraAndFraming' as const,
      label: 'Sử dụng các từ khóa mô tả góc máy và bố cục khung hình',
      value: settings.useCameraAndFraming,
    },
    {
      key: 'useLightingColor' as const,
      label: 'Sử dụng các từ khóa mô tả ánh sáng và màu sắc',
      value: settings.useLightingColor,
    },
    {
      key: 'syncOnlyPresentCharacters' as const,
      label: 'Chỉ sao chép Character Sheet xuất hiện trong phân cảnh',
      value: settings.syncOnlyPresentCharacters,
    },
    {
      key: 'useSeed' as const,
      label: 'Thêm Seed random, nhưng cố định số đó vào mọi prompt',
      value: settings.useSeed,
    },
    {
      key: 'includeVoiceLanguage' as const,
      label: 'Thêm ngôn ngữ của voice nhân vật cố định theo ngôn ngữ đã chọn',
      value: settings.includeVoiceLanguage,
    },
    {
      key: 'matchDurationPrompts' as const,
      label: 'Tính toán và tạo số lượng prompt đúng với số phút',
      value: settings.matchDurationPrompts,
    },
    {
      key: 'storyContinuityGoal' as const,
      label: 'Tạo các prompt có thể tạo thành một câu chuyện liên mạch',
      value: settings.storyContinuityGoal,
    },
    {
      key: 'individualCharacterSheets' as const,
      label: 'Nếu có nhiều nhân vật hãy viết Character Sheet cho từng nhân vật',
      value: settings.individualCharacterSheets,
    },
    {
      key: 'continuity' as const,
      label: 'Liên kết các cảnh cuối của prompt trước với cảnh đầu của prompt sau',
      value: settings.continuity,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Nhân vật & Tính nhất quán
            </h2>
            <p className="text-xs text-slate-500">
              Định hình ngoại hình cố định để Veo 3 luôn giữ nhân vật đồng bộ qua các cảnh
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm nhân vật</span>
        </button>
      </div>

      {/* Characters List */}
      <div className="space-y-2.5">
        {characters.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
            Chưa có nhân vật nào được tạo. Bấm "+ Thêm nhân vật" để khai báo tên và ngoại hình cố định.
          </div>
        ) : (
          characters.map((char) => (
            <div
              key={char.id}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-violet-800 bg-violet-100/80 px-2 py-0.5 rounded-md">
                    {char.name}
                  </span>
                  {char.voice && (
                    <span className="text-2xs text-slate-500 italic truncate max-w-[200px]">
                      {char.voice}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {char.description}
                </p>
              </div>

              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => openEditModal(char)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
                  title="Sửa nhân vật"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCharacter(char.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Xoá nhân vật"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Consistency Toggles (Styled as vibrant chips matching user screenshots) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            QUY TẮC ĐỒNG BỘ & TÍNH NHẤT QUÁN
          </span>
          <button
            type="button"
            onClick={() => setShowAllToggles(!showAllToggles)}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5 cursor-pointer"
          >
            <span>{showAllToggles ? 'Thu gọn' : 'Mở rộng'}</span>
            {showAllToggles ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showAllToggles && (
          <div className="flex flex-col gap-1.5">
            {/* Language Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-0.5">
              <button
                type="button"
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    promptLanguage: 'en',
                  })
                }
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  settings.promptLanguage === 'en'
                    ? 'bg-violet-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <span>English prompts language</span>
                {settings.promptLanguage === 'en' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-violet-200" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    promptLanguage: 'vi',
                  })
                }
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  settings.promptLanguage === 'vi'
                    ? 'bg-violet-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <span>Ngôn ngữ prompt tiếng việt</span>
                {settings.promptLanguage === 'vi' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-violet-200" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
              </button>
            </div>

            {toggles.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    [item.key]: !item.value,
                  })
                }
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  item.value
                    ? 'bg-violet-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <span>{item.label}</span>
                {item.value ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-violet-200" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Seed Control */}
      {settings.useSeed && (
        <div className="p-3 rounded-xl bg-violet-50/50 border border-violet-200 flex items-center justify-between gap-3">
          <div>
            <label className="block text-2xs font-bold uppercase text-violet-900">
              Số Seed cố định:
            </label>
            <p className="text-2xs text-violet-600">
              Cố định seed giúp các prompt có phong cách khuôn mặt và bối cảnh nhất quán.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={settings.seed}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  seed: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-24 px-2.5 py-1 text-xs font-mono font-bold bg-white border border-violet-300 rounded-lg text-slate-900"
            />
            <button
              type="button"
              onClick={generateRandomSeed}
              title="Tạo seed ngẫu nhiên mới"
              className="p-1.5 rounded-lg bg-white border border-violet-300 text-violet-700 hover:bg-violet-100 cursor-pointer"
            >
              <Dice5 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* THÊM VÀO ĐẦU PROMPT (Prefix cố định) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          THÊM VÀO ĐẦU PROMPT (PREFIX CỐ ĐỊNH):
        </label>
        <textarea
          value={settings.fixedPrefix}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              fixedPrefix: e.target.value,
            })
          }
          placeholder="Ví dụ: Simple 2D digital cartoon style, oversized round heads and compact bodies, studio lighting..."
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
        />
        <p className="text-2xs text-slate-400 mt-1">
          Đoạn mô tả này sẽ tự động được chèn vào trước tất cả các video prompt Veo 3.
        </p>
      </div>

      {/* Character Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingChar ? 'Chỉnh sửa nhân vật' : 'Thêm nhân vật mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCharacter} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên nhân vật (đúng như trong truyện):
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Minh, Mai, Đại úy Elena..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả ngoại hình cố định (tuổi, trang phục, đặc điểm nhận diện):
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Nam 32 tuổi, thám tử tư. Tóc hơi rối, ánh mắt sắc sảo, có vết sẹo nhỏ ở đuôi mày trái. Mặc áo măng tô màu be sờn vai, bên trong là áo sơ mi trắng mở cúc..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chất giọng / Ngôn ngữ (tuỳ chọn):
                </label>
                <input
                  type="text"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  placeholder="Ví dụ: Giọng nam trầm, điềm tĩnh, tiếng Việt"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Lưu nhân vật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
