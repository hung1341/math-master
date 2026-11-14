import { useMemo, useState } from 'react';
import { DIFFICULTIES, GRADES } from '../constants/gameConfig';
import type { Difficulty, Grade, PlayerProfile } from '../types/game';
import { formatDuration } from '../utils/storage';

interface HistoryViewProps {
  profile: PlayerProfile;
}

export function HistoryView({ profile }: HistoryViewProps) {
  const [gradeFilter, setGradeFilter] = useState<'all' | Grade>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | Difficulty>('all');

  const filteredHistory = useMemo(() => {
    return [...profile.history]
      .reverse()
      .filter((item) => {
        if (gradeFilter !== 'all' && item.grade !== gradeFilter) return false;
        if (difficultyFilter !== 'all' && item.difficulty !== difficultyFilter) return false;
        return true;
      });
  }, [profile.history, gradeFilter, difficultyFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-600 tabular-nums dark:text-slate-300">
          Tổng số trận đã hoàn thành: <strong>{profile.history.length}</strong>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label htmlFor="history-grade-filter" className="sr-only">
            Lọc theo lớp
          </label>
          <select
            id="history-grade-filter"
            value={gradeFilter}
            onChange={(e) =>
              setGradeFilter(
                e.target.value === 'all' ? 'all' : (Number(e.target.value) as Grade)
              )
            }
            className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="all">Tất cả khối lớp</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                Lớp {g}
              </option>
            ))}
          </select>

          <label htmlFor="history-diff-filter" className="sr-only">
            Lọc theo độ khó
          </label>
          <select
            id="history-diff-filter"
            value={difficultyFilter}
            onChange={(e) =>
              setDifficultyFilter(
                e.target.value === 'all' ? 'all' : (e.target.value as Difficulty)
              )
            }
            className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="all">Tất cả độ khó</option>
            {DIFFICULTIES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="rounded-lg border border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {profile.history.length === 0
            ? 'Chưa có trận đấu nào được lưu. Hãy bắt đầu chiến đấu để ghi nhận điểm số!'
            : 'Không có trận đấu nào khớp với bộ lọc.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="px-3.5 py-3 whitespace-nowrap">#</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Thời gian</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Cấp độ</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Đúng</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Thời lượng</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Điểm</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Xếp loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 tabular-nums dark:divide-slate-800">
              {filteredHistory.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                  <td className="px-3.5 py-3 text-slate-500 dark:text-slate-400">{idx + 1}</td>
                  <td className="px-3.5 py-3 text-slate-700 whitespace-nowrap dark:text-slate-300">
                    {item.date}
                  </td>
                  <td className="px-3.5 py-3 font-medium text-slate-900 whitespace-nowrap dark:text-white">
                    Lớp {item.grade} · {item.difficulty}
                  </td>
                  <td className="px-3.5 py-3 text-right text-slate-800 whitespace-nowrap dark:text-slate-200">
                    {item.correct}/{item.total}
                  </td>
                  <td className="px-3.5 py-3 text-right text-slate-600 whitespace-nowrap dark:text-slate-400">
                    {formatDuration(item.timeSpentSeconds)}
                  </td>
                  <td className="px-3.5 py-3 text-right font-math font-bold text-slate-900 whitespace-nowrap dark:text-white">
                    {item.score.toFixed(1)}/10
                  </td>
                  <td className="px-3.5 py-3 font-semibold whitespace-nowrap">
                    <span
                      className={
                        item.rank === 'XUẤT SẮC'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : item.rank === 'GIỎI'
                            ? 'text-blue-700 dark:text-blue-400'
                            : item.rank === 'ĐẠT'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-rose-700 dark:text-rose-400'
                      }
                    >
                      {item.rank}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
