import { DIFFICULTIES } from '../constants/gameConfig';
import type { PlayerProfile } from '../types/game';
import { formatNumber } from '../utils/storage';

interface StatsViewProps {
  profile: PlayerProfile;
}

export function StatsView({ profile }: StatsViewProps) {
  const accuracy =
    profile.totalQuestions > 0
      ? ((profile.totalCorrect / profile.totalQuestions) * 100).toFixed(1)
      : '0.0';

  const bestOverallScore =
    profile.history.length > 0
      ? Math.max(...profile.history.map((h) => h.score)).toFixed(1)
      : '—';

  const xpIntoLevel = profile.xp % 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Cấp độ nhân vật',
            value: `Cấp ${profile.level}`,
            sub: `${xpIntoLevel}/100 XP tới cấp kế`,
          },
          {
            label: 'Tổng kinh nghiệm',
            value: `${formatNumber(profile.xp)} XP`,
            sub: `Chuỗi ${profile.streak} ngày`,
          },
          {
            label: 'Số trận đã đấu',
            value: `${profile.totalGames}`,
            sub: `Điểm cao nhất: ${bestOverallScore}/10`,
          },
          {
            label: 'Độ chính xác',
            value: `${accuracy}%`,
            sub: `${profile.totalCorrect}/${profile.totalQuestions} câu đúng`,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 tabular-nums dark:border-slate-800 dark:bg-slate-800/40"
          >
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {metric.label}
            </div>
            <div className="mt-1 font-display text-xl font-extrabold text-slate-900 dark:text-white">
              {metric.value}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {metric.sub}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Thành tích theo từng cấp độ Thủ vệ
        </h3>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2.5 pr-4">Cấp độ</th>
                <th className="py-2.5 px-4 text-right">Số trận</th>
                <th className="py-2.5 px-4 text-right">Điểm TB</th>
                <th className="py-2.5 pl-4 text-right">Cao nhất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 tabular-nums dark:divide-slate-800">
              {DIFFICULTIES.map((diff) => {
                const rows = profile.history.filter((h) => h.difficulty === diff.id);
                const avg =
                  rows.length > 0
                    ? (rows.reduce((sum, r) => sum + r.score, 0) / rows.length).toFixed(1)
                    : '—';
                const best =
                  rows.length > 0
                    ? Math.max(...rows.map((r) => r.score)).toFixed(1)
                    : '—';

                return (
                  <tr key={diff.id}>
                    <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">
                      {diff.id}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                      {rows.length}
                    </td>
                    <td className="py-3 px-4 text-right font-math text-slate-700 dark:text-slate-300">
                      {avg === '—' ? '—' : `${avg}/10`}
                    </td>
                    <td className="py-3 pl-4 text-right font-math font-bold text-emerald-700 dark:text-emerald-400">
                      {best === '—' ? '—' : `${best}/10`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
