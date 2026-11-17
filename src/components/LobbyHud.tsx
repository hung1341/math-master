import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Gift,
  Play,
  ScrollText,
  Settings,
  ShoppingBag,
  Swords,
} from 'lucide-react';
import { useState } from 'react';
import { DIFFICULTIES, GRADES, QUIZ_MODES, getDifficultyConfig } from '../constants/gameConfig';
import type {
  ActiveModal,
  Difficulty,
  Grade,
  PlayerProfile,
  QuizModeId,
} from '../types/game';
import { formatNumber, getTodayIso } from '../utils/storage';

interface LobbyHudProps {
  profile: PlayerProfile;
  selectedGrade: Grade;
  selectedDifficulty: Difficulty;
  selectedMode: QuizModeId;
  claimableQuestCount: number;
  onChangeGrade: (grade: Grade) => void;
  onChangeDifficulty: (difficulty: Difficulty) => void;
  onChangeMode: (mode: QuizModeId) => void;
  onOpenModal: (modal: ActiveModal) => void;
  onRequestStart: () => void;
}

export function LobbyHud({
  profile,
  selectedGrade,
  selectedDifficulty,
  selectedMode,
  claimableQuestCount,
  onChangeGrade,
  onChangeDifficulty,
  onChangeMode,
  onOpenModal,
  onRequestStart,
}: LobbyHudProps) {
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const today = getTodayIso();
  const unclaimedDaily = profile.claimedDate !== today;
  const xpProgress = profile.xp % 100;

  const bestForSelection = (() => {
    const matches = profile.history.filter(
      (h) => h.grade === selectedGrade && h.difficulty === selectedDifficulty
    );
    if (matches.length === 0) return null;
    return matches.reduce((best, cur) => (cur.score > best.score ? cur : best));
  })();

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-5">
      {/* Top Game HUD Row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Top-Left Player Card */}
        <div className="pointer-events-auto rounded-xl border border-slate-200/90 bg-white/92 px-4 py-3 shadow-lg dark:border-slate-700/90 dark:bg-slate-950/88">
          <div className="flex items-center gap-3">
            <div className="font-display text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              Toán Tiểu học 3D
            </div>
            <span className="text-xs text-slate-400" aria-hidden="true">
              ·
            </span>
            <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              {profile.name}
            </div>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-600 tabular-nums dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">
              Cấp {profile.level}
            </span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              {formatNumber(profile.money)} xu
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-blue-700 dark:text-blue-400">
              {formatNumber(profile.diamonds)} kim cương
            </span>
            <span aria-hidden="true">·</span>
            <span>Chuỗi {profile.streak} ngày</span>
          </div>
        </div>

        {/* Top-Right Game Menu & System Settings Popup Trigger */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenModal('quests')}
            className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold shadow-md transition-colors whitespace-nowrap ${
              claimableQuestCount > 0
                ? 'border-red-400 bg-red-600 text-white ring-2 ring-amber-300/80 hover:bg-red-700 dark:border-red-400 dark:bg-red-600 dark:hover:bg-red-500'
                : 'border-red-600 bg-red-600 text-white hover:bg-red-700 dark:border-red-500 dark:bg-red-600 dark:hover:bg-red-500'
            }`}
          >
            <Swords className="h-4 w-4 text-white" aria-hidden="true" />
            <span>
              {claimableQuestCount > 0 ? `Nhiệm vụ (${claimableQuestCount})` : 'Nhiệm vụ'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenModal('guide')}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-violet-600 bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-violet-700 dark:border-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500 whitespace-nowrap"
          >
            <BookOpen className="h-4 w-4 text-white" aria-hidden="true" />
            <span>Kiến thức Toán 2–4</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenModal('daily')}
            className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold shadow-md transition-colors whitespace-nowrap ${
              !unclaimedDaily
                ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 dark:border-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                : 'border-slate-200/90 bg-white/92 text-slate-800 hover:bg-white dark:border-slate-700/90 dark:bg-slate-950/88 dark:text-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Gift
              className={`h-4 w-4 ${
                !unclaimedDaily ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
              }`}
              aria-hidden="true"
            />
            <span>{unclaimedDaily ? 'Quà hôm nay' : 'Phần thưởng'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenModal('shop')}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-yellow-500 bg-yellow-400 px-3 py-2 text-xs font-semibold text-slate-950 shadow-md transition-colors hover:bg-yellow-300 dark:border-yellow-400 dark:bg-yellow-400 dark:text-slate-950 dark:hover:bg-yellow-300 whitespace-nowrap"
          >
            <ShoppingBag className="h-4 w-4 text-slate-950" aria-hidden="true" />
            <span>Cửa hàng</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenModal('history')}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-blue-600 dark:border-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 whitespace-nowrap"
          >
            <ScrollText className="h-4 w-4 text-white" aria-hidden="true" />
            <span>Lịch sử</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenModal('stats')}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-blue-950 bg-blue-900 px-3 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-blue-950 dark:border-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 whitespace-nowrap"
          >
            <BarChart3 className="h-4 w-4 text-white" aria-hidden="true" />
            <span>Thống kê</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenModal('settings')}
            aria-label="Mở cài đặt hệ thống"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-md transition-colors hover:bg-slate-100 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 whitespace-nowrap"
          >
            <Settings className="h-4 w-4 text-slate-900" aria-hidden="true" />
            <span>Cài đặt</span>
          </button>
        </div>
      </div>

      {/* Bottom-Center Collapsible Battle Setup Dock */}
      <div className="pointer-events-none mx-auto flex w-full max-w-4xl flex-col items-center">
        <button
          type="button"
          onClick={() => setDockCollapsed((c) => !c)}
          className="pointer-events-auto mb-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white/92 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-md transition-colors hover:bg-white dark:border-slate-700/90 dark:bg-slate-950/88 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              Mở bảng chọn cấp độ
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              Thu gọn bảng
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="pointer-events-auto w-full rounded-xl border border-slate-200/90 bg-white/94 p-4 shadow-2xl sm:p-5 dark:border-slate-700/90 dark:bg-slate-950/90">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
              {/* Grade & Mode */}
              <div className="space-y-3 md:col-span-5">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Khối lớp Tiểu học
                  </span>
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {GRADES.map((g) => {
                      const active = selectedGrade === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => onChangeGrade(g)}
                          className={`min-h-10 rounded-lg border px-2 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                            active
                              ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                          }`}
                        >
                          Lớp {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Chế độ thi
                  </span>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    {QUIZ_MODES.map((m) => {
                      const active = selectedMode === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => onChangeMode(m.id)}
                          className={`min-h-10 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors ${
                            active
                              ? 'border-blue-600 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-200'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="font-bold truncate">{m.label}</div>
                          <div className="text-[11px] opacity-80 tabular-nums">
                            {m.questionCount} câu · {m.durationMinutes}p
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Difficulty Levels (updates 3D Guardian live) */}
              <div className="md:col-span-4">
                <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Cấp độ Thủ vệ (Dễ → Vô tận)
                </span>
                <div className="mt-1.5 grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                  {DIFFICULTIES.map((diff) => {
                    const active = selectedDifficulty === diff.id;
                    const m = diff.multiplier;
                    const isEndless = diff.id === 'Vô tận';

                    let activeClasses =
                      'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500';
                    let idleClasses =
                      'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800';

                    if (m === 5) {
                      activeClasses = 'border-rose-600 bg-rose-600 text-white';
                      idleClasses =
                        'border-rose-300/90 bg-rose-50/80 text-rose-900 hover:bg-rose-100/80 dark:border-rose-900/80 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70';
                    } else if (m === 6) {
                      activeClasses = 'border-purple-600 bg-purple-600 text-white';
                      idleClasses =
                        'border-purple-300/90 bg-purple-50/80 text-purple-950 hover:bg-purple-100/80 dark:border-purple-900/80 dark:bg-purple-950/40 dark:text-purple-200 dark:hover:bg-purple-950/70';
                    } else if (m === 7) {
                      activeClasses =
                        'border-orange-600 bg-gradient-to-r from-red-600 to-orange-600 text-white';
                      idleClasses =
                        'border-orange-400/90 bg-gradient-to-r from-red-50 to-orange-50 text-orange-950 hover:from-red-100 hover:to-orange-100 dark:border-orange-800/80 dark:from-red-950/50 dark:to-orange-950/40 dark:text-orange-200';
                    } else if (m === 8) {
                      activeClasses = 'border-violet-700 bg-violet-700 text-white';
                      idleClasses =
                        'border-violet-300 bg-violet-50/80 text-violet-950 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/45 dark:text-violet-200 dark:hover:bg-violet-950/75';
                    } else if (m === 9) {
                      activeClasses = 'border-red-700 bg-red-700 text-white';
                      idleClasses =
                        'border-red-400 bg-red-50/85 text-red-950 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950/80';
                    } else if (m === 10) {
                      activeClasses = 'border-sky-700 bg-sky-700 text-white';
                      idleClasses =
                        'border-sky-400 bg-sky-50/85 text-sky-950 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200 dark:hover:bg-sky-950/80';
                    } else if (m === 11) {
                      activeClasses = 'border-amber-600 bg-amber-600 text-white';
                      idleClasses =
                        'border-amber-400 bg-amber-50/90 text-amber-950 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-950/80';
                    } else if (m === 12) {
                      activeClasses = 'border-teal-600 bg-teal-600 text-white';
                      idleClasses =
                        'border-teal-400 bg-teal-50/85 text-teal-950 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200 dark:hover:bg-teal-950/80';
                    } else if (m === 13) {
                      activeClasses =
                        'border-fuchsia-600 bg-gradient-to-r from-indigo-700 via-fuchsia-600 to-amber-500 text-white';
                      idleClasses =
                        'border-fuchsia-400 bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-amber-50 text-fuchsia-950 hover:from-indigo-100 hover:to-amber-100 dark:border-fuchsia-800 dark:from-indigo-950/60 dark:via-fuchsia-950/50 dark:to-amber-950/40 dark:text-fuchsia-200';
                    }

                    return (
                      <button
                        key={diff.id}
                        type="button"
                        onClick={() => onChangeDifficulty(diff.id)}
                        className={`min-h-10 rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${
                          isEndless ? 'col-span-2 flex items-center justify-between gap-2' : ''
                        } ${active ? activeClasses : idleClasses}`}
                      >
                        <div className="font-bold leading-tight">{diff.id}</div>
                        <div className="mt-0.5 text-[11px] leading-tight opacity-85">
                          {diff.rewardBonusLabel}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start CTA & Best Score */}
              <div className="flex flex-col justify-between gap-3 border-t border-slate-200 pt-3 md:col-span-3 md:border-t-0 md:border-l md:pt-0 md:pl-4 dark:border-slate-800">
                <div className="text-xs tabular-nums">
                  <div className="font-semibold text-slate-500 dark:text-slate-400">
                    Kỷ lục Lớp {selectedGrade} · {selectedDifficulty}
                  </div>
                  <div className="mt-0.5 font-math text-lg font-bold text-slate-900 dark:text-white">
                    {bestForSelection
                      ? `${bestForSelection.score.toFixed(1)}/10 · ${bestForSelection.rank}`
                      : 'Chưa có kỷ lục'}
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Vũ khí Thủ vệ:{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {getDifficultyConfig(selectedDifficulty).bossWeapon}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onRequestStart}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 whitespace-nowrap"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Vào đấu trường
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
