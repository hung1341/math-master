import { Check, Gift } from 'lucide-react';
import { DAILY_REWARDS } from '../constants/gameConfig';
import type { PlayerProfile } from '../types/game';
import { formatNumber, getTodayIso } from '../utils/storage';

interface DailyRewardsProps {
  profile: PlayerProfile;
  onClaimDaily: () => void;
}

export function DailyRewards({ profile, onClaimDaily }: DailyRewardsProps) {
  const today = getTodayIso();
  const alreadyClaimed = profile.claimedDate === today;
  const activeDayIndex = (Math.max(1, profile.streak) - 1) % 7;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Chuỗi đăng nhập hiện tại
          </div>
          <div className="mt-0.5 font-display text-2xl font-extrabold text-slate-900 tabular-nums dark:text-white">
            {profile.streak} ngày liên tiếp
          </div>
        </div>

        <button
          type="button"
          disabled={alreadyClaimed}
          onClick={onClaimDaily}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-400 whitespace-nowrap"
        >
          {alreadyClaimed ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Đã nhận thưởng hôm nay
            </>
          ) : (
            <>
              <Gift className="h-4 w-4" aria-hidden="true" />
              Nhận thưởng Ngày {activeDayIndex + 1}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DAILY_REWARDS.map((item, idx) => {
          const isCurrent = idx === activeDayIndex;
          const isPast = idx < activeDayIndex || (idx === activeDayIndex && alreadyClaimed);

          return (
            <div
              key={item.day}
              className={`flex flex-col justify-between rounded-lg border p-3.5 tabular-nums ${
                isCurrent && !alreadyClaimed
                  ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40'
                  : isPast
                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30'
                    : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40'
              }`}
            >
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Ngày {item.day}
              </div>
              <div className="mt-1.5 font-display text-sm font-bold text-slate-900 dark:text-white">
                {formatNumber(item.amount)} {item.kind === 'money' ? 'xu' : 'kim cương'}
              </div>
              <div className="mt-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                {isPast ? 'Đã nhận' : isCurrent ? 'Hôm nay' : 'Sắp tới'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
