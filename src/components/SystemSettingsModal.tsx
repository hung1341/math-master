import {
  Camera,
  Monitor,
  Plus,
  Snowflake,
  Trash2,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useState } from 'react';
import type {
  CameraPreset,
  GraphicsQuality,
  PlayerProfile,
} from '../types/game';
import { GameModalShell } from './GameModalShell';

interface SystemSettingsModalProps {
  profile: PlayerProfile;
  playerNames: string[];
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  graphicsQuality: GraphicsQuality;
  cameraPreset: CameraPreset;
  onChangeTheme: (theme: 'light' | 'dark') => void;
  onToggleSound: () => void;
  onChangeGraphics: (quality: GraphicsQuality) => void;
  onChangeCamera: (preset: CameraPreset) => void;
  onToggleAutoFreeze: () => void;
  onSwitchPlayer: (name: string) => void;
  onCreatePlayer: (name: string) => { ok: boolean; error?: string };
  onResetProfile: () => void;
  onDeleteProfile: () => void;
  onClose: () => void;
}

export function SystemSettingsModal({
  profile,
  playerNames,
  theme,
  soundEnabled,
  graphicsQuality,
  cameraPreset,
  onChangeTheme,
  onToggleSound,
  onChangeGraphics,
  onChangeCamera,
  onToggleAutoFreeze,
  onSwitchPlayer,
  onCreatePlayer,
  onResetProfile,
  onDeleteProfile,
  onClose,
}: SystemSettingsModalProps) {
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onCreatePlayer(newName.trim());
    if (!res.ok) {
      setNameError(res.error ?? 'Không thể tạo hồ sơ.');
      return;
    }
    setNewName('');
    setNameError('');
  };

  return (
    <GameModalShell
      title="Cài đặt hệ thống"
      subtitle="Điều chỉnh âm thanh, đồ họa 3D, góc quay và hồ sơ người chơi"
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span>Âm thanh trò chơi</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Hiệu ứng âm thanh (SFX)
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Phát âm thanh khi trả lời đúng/sai, mua gợi ý và nhận thưởng
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={onToggleSound}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                soundEnabled
                  ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                  : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Đang bật
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                  Đang tắt
                </>
              )}
            </button>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-5 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span>Đồ họa 3D & Thời gian đấu trường</span>
          </div>

          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Chất lượng hiển thị 3D
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Mức Cao bật đổ bóng mềm và độ phân giải tối đa
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => onChangeGraphics('high')}
                  className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    graphicsQuality === 'high'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Cao
                </button>
                <button
                  type="button"
                  onClick={() => onChangeGraphics('low')}
                  className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    graphicsQuality === 'low'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Tiết kiệm
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Bầu trời & Giao diện
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Chuyển đổi bối cảnh đấu trường Ban ngày (Sáng) hoặc Ban đêm (Tối)
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => onChangeTheme('light')}
                  className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    theme === 'light'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Ban ngày
                </button>
                <button
                  type="button"
                  onClick={() => onChangeTheme('dark')}
                  className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    theme === 'dark'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Ban đêm
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Góc quay Camera 3D
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Kéo chuột trực tiếp trên màn hình để xoay tự do bất kỳ lúc nào
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                {(
                  [
                    { id: 'auto', label: 'Tự động' },
                    { id: 'overview', label: 'Toàn cảnh' },
                    { id: 'duel', label: 'Cận chiến' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeCamera(opt.id)}
                    className={`min-h-9 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      cameraPreset === opt.id
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-5 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span>Hồ sơ lưu điểm & Chuỗi ngày</span>
          </div>

          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
              <label
                htmlFor="settings-player-select"
                className="text-sm font-semibold text-slate-900 dark:text-white"
              >
                Hồ sơ đang chơi
              </label>
              <select
                id="settings-player-select"
                value={profile.name}
                onChange={(e) => onSwitchPlayer(e.target.value)}
                className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {playerNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <form
              onSubmit={handleCreate}
              className="flex flex-wrap items-center gap-2.5 rounded-lg border border-slate-200 p-3.5 dark:border-slate-800"
            >
              <label htmlFor="settings-new-player" className="sr-only">
                Tên hồ sơ mới
              </label>
              <input
                id="settings-new-player"
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNameError('');
                }}
                placeholder="Nhập tên nhân vật mới..."
                maxLength={24}
                className="min-h-10 flex-1 min-w-[180px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="submit"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Tạo hồ sơ
              </button>
              {nameError && (
                <p role="alert" className="w-full text-xs font-medium text-rose-600 dark:text-rose-400">
                  {nameError}
                </p>
              )}
            </form>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
              <div className="flex items-start gap-2.5">
                <Snowflake className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Đóng băng chuỗi ngày (Auto-Freeze)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Tự động dùng 1 kim cương mỗi ngày bỏ lỡ để giữ chuỗi đăng nhập
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile.autoFreeze}
                onClick={onToggleAutoFreeze}
                className={`min-h-10 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  profile.autoFreeze
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {profile.autoFreeze ? 'Đang bật' : 'Đang tắt'}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-rose-300 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40 whitespace-nowrap"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Đặt lại điểm số hồ sơ này
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                    Xóa toàn bộ điểm của {profile.name}?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetProfile();
                      setConfirmReset(false);
                    }}
                    className="min-h-9 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    Xác nhận
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="min-h-9 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    Hủy
                  </button>
                </div>
              )}

              {playerNames.length > 1 && !confirmReset && (
                <button
                  type="button"
                  onClick={onDeleteProfile}
                  className="min-h-10 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap"
                >
                  Xóa hồ sơ {profile.name}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </GameModalShell>
  );
}
