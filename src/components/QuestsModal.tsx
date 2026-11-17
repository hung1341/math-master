import { CheckCircle2, Coins, Gem, Sparkles, Swords } from 'lucide-react';
import { DIFFICULTIES } from '../constants/gameConfig';
import {
  getDailyQuestsForWave,
  getMonsterQuestsForWave,
  type MonsterQuest,
} from '../constants/quests';
import type { Difficulty, Grade, PlayerProfile } from '../types/game';
import { formatNumber, getTodayIso } from '../utils/storage';

interface QuestsModalProps {
  profile: PlayerProfile;
  onClaimQuest: (quest: MonsterQuest) => void;
  onFightForQuest: (difficulty?: Difficulty, grade?: Grade) => void;
}

export function QuestsModal({
  profile,
  onClaimQuest,
  onFightForQuest,
}: QuestsModalProps) {
  const today = getTodayIso();
  const isTodayDaily = profile.dailyQuestDate === today;
  const dailyWave = isTodayDaily ? Math.max(1, profile.dailyQuestWave || 1) : 1;
  const questWave = Math.max(1, profile.questWave || 1);

  const dailyQuests = getDailyQuestsForWave(dailyWave);
  const milestoneQuests = getMonsterQuestsForWave(questWave);

  const getProgress = (quest: MonsterQuest): number => {
    const raw = quest.isDaily
      ? isTodayDaily
        ? (profile.dailyQuestProgress[quest.id] ?? 0)
        : 0
      : (profile.questProgress[quest.id] ?? 0);
    return Math.min(quest.target, raw);
  };

  const isClaimed = (quest: MonsterQuest): boolean => {
    if (quest.isDaily) {
      return isTodayDaily && profile.dailyClaimedQuests.includes(quest.id);
    }
    return profile.claimedQuests.includes(quest.id);
  };

  const renderQuestCard = (quest: MonsterQuest) => {
    const progress = getProgress(quest);
    const claimed = isClaimed(quest);
    const readyToClaim = progress >= quest.target && !claimed;
    const pct = Math.round((progress / quest.target) * 100);

    return (
      <div
        key={quest.id}
        className={`rounded-xl border p-4 transition-colors ${
          claimed
            ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-600'
            : readyToClaim
              ? 'border-emerald-400 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-950/30'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70'
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className={`font-display text-sm font-extrabold ${
                  claimed ? 'text-white' : 'text-slate-900 dark:text-white'
                }`}
              >
                {quest.title}
              </h4>
              {quest.difficulty && (
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    claimed
                      ? 'bg-emerald-700/80 text-emerald-50'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Cấp: {quest.difficulty}
                </span>
              )}
              {quest.grade && (
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    claimed
                      ? 'bg-emerald-700/80 text-emerald-50'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}
                >
                  Lớp {quest.grade}
                </span>
              )}
              {quest.modeId === 'standard' && (
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    claimed
                      ? 'bg-emerald-700/80 text-emerald-50'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  }`}
                >
                  Thi thử chuẩn
                </span>
              )}
            </div>

            <p
              className={`mt-1 text-xs ${
                claimed ? 'text-emerald-50' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {quest.description}
            </p>

            {/* Progress Bar */}
            <div className="mt-2.5 flex items-center gap-2.5">
              <div
                className={`h-2 flex-1 overflow-hidden rounded-full ${
                  claimed ? 'bg-emerald-800/60' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all ${
                    claimed
                      ? 'bg-white'
                      : readyToClaim
                        ? 'bg-emerald-500'
                        : 'bg-blue-600 dark:bg-blue-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className={`font-math text-xs font-bold tabular-nums ${
                  claimed ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {progress}/{quest.target}
              </span>
            </div>

            {/* Reward Breakdown */}
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs font-semibold tabular-nums">
              <span
                className={`inline-flex items-center gap-1 ${
                  claimed ? 'text-emerald-50' : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                +{formatNumber(quest.rewardMoney)} xu
              </span>
              <span
                className={`inline-flex items-center gap-1 ${
                  claimed ? 'text-emerald-50' : 'text-blue-700 dark:text-blue-400'
                }`}
              >
                <Gem className="h-3.5 w-3.5" aria-hidden="true" />
                +{formatNumber(quest.rewardDiamonds)} kim cương
              </span>
              <span
                className={`inline-flex items-center gap-1 ${
                  claimed ? 'text-emerald-50' : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                +{formatNumber(quest.rewardXp)} XP
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {claimed ? (
              <span className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-emerald-300/80 bg-emerald-700/75 px-3.5 py-2 text-xs font-bold text-white">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Đã nhận
              </span>
            ) : readyToClaim ? (
              <button
                type="button"
                onClick={() => onClaimQuest(quest)}
                className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 sm:w-auto"
              >
                Nhận thưởng
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onFightForQuest(
                    quest.difficulty ??
                      (quest.minDifficultyMultiplier
                        ? (DIFFICULTIES.find(
                            (d) => d.multiplier === quest.minDifficultyMultiplier
                          )?.id ?? 'Khó')
                        : undefined),
                    quest.grade
                  )
                }
                className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 sm:w-auto dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950"
              >
                <Swords className="h-3.5 w-3.5" aria-hidden="true" />
                Đi đánh
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
        Đạt từ <strong>40% số câu đúng trở lên</strong> để tính là đánh bại quái vật. Khi hoàn thành & nhận hết toàn bộ nhiệm vụ của một đợt, hệ thống sẽ <strong>tự động cập nhật đợt nhiệm vụ mới</strong> với phần thưởng lớn hơn!
      </div>

      <div>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Nhiệm vụ Hằng ngày · Đợt {dailyWave}
          </h3>
          <span className="text-xs font-medium text-slate-500 tabular-nums dark:text-slate-400">
            Đã nhận: {isTodayDaily ? profile.dailyClaimedQuests.length : 0}/{dailyQuests.length}
          </span>
        </div>
        <div className="space-y-2.5">
          {dailyQuests.map(renderQuestCard)}
        </div>
      </div>

      <div>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Nhiệm vụ Săn Quái Vật · Đợt {questWave}
          </h3>
          <span className="text-xs font-medium text-slate-500 tabular-nums dark:text-slate-400">
            Đã nhận: {profile.claimedQuests.length}/{milestoneQuests.length}
          </span>
        </div>
        <div className="space-y-2.5">
          {milestoneQuests.map(renderQuestCard)}
        </div>
      </div>
    </div>
  );
}
