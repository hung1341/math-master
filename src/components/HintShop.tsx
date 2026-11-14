import { Lightbulb } from 'lucide-react';
import { DAILY_HINT_LIMIT, HINT_PRICES } from '../constants/gameConfig';
import type { PlayerProfile } from '../types/game';
import { formatNumber, getNextHintPrice, getTodayIso } from '../utils/storage';

interface HintShopProps {
  profile: PlayerProfile;
}

export function HintShop({ profile }: HintShopProps) {
  const today = getTodayIso();
  const usedToday = profile.hintDate === today ? profile.hintCount : 0;
  const nextPrice = getNextHintPrice(profile);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-amber-500" aria-hidden="true" />
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Số dư xu hiện tại
            </div>
            <div className="font-math text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
              {formatNumber(profile.money)} xu
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right tabular-nums">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            Hôm nay đã dùng: {usedToday}/{DAILY_HINT_LIMIT} lần
          </div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {usedToday >= DAILY_HINT_LIMIT
              ? 'Đã hết lượt gợi ý hôm nay'
              : `Giá lần tiếp theo: ${formatNumber(nextPrice)} xu`}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
          Bảng giá gợi ý trong trận đấu
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Gợi ý được kích hoạt trực tiếp trong lúc đấu để hiện hướng dẫn từng bước và đáp án.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {HINT_PRICES.map((price, idx) => {
            const order = idx + 1;
            const used = order <= usedToday;
            const isNext = order === usedToday + 1 && usedToday < DAILY_HINT_LIMIT;

            return (
              <div
                key={order}
                className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 tabular-nums ${
                  isNext
                    ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40'
                    : used
                      ? 'border-slate-200 bg-slate-100/70 opacity-65 dark:border-slate-800 dark:bg-slate-800/40'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Lần {order}
                  {isNext && (
                    <span className="ml-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                      (Tiếp theo)
                    </span>
                  )}
                  {used && (
                    <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      (Đã dùng)
                    </span>
                  )}
                </div>

                <div className="font-math text-sm font-bold text-amber-700 dark:text-amber-400">
                  {formatNumber(price)} xu
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
