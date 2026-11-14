import { Award, CheckCircle2, Home, RotateCcw, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { AnswerRecord, QuizHistoryItem } from '../types/game';
import { formatDuration, formatNumber } from '../utils/storage';

interface QuizResultProps {
  result: QuizHistoryItem;
  records: AnswerRecord[];
  leveledUpTo: number | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function QuizResult({
  result,
  records,
  leveledUpTo,
  onPlayAgain,
  onGoHome,
}: QuizResultProps) {
  const [showReview, setShowReview] = useState(false);
  const [filter, setFilter] = useState<'all' | 'wrong'>('all');

  const filteredRecords =
    filter === 'wrong' ? records.filter((r) => !r.isCorrect) : records;

  const rankColorClass =
    result.rank === 'XUẤT SẮC'
      ? 'text-emerald-700 dark:text-emerald-400'
      : result.rank === 'GIỎI'
        ? 'text-blue-700 dark:text-blue-400'
        : result.rank === 'ĐẠT'
          ? 'text-amber-700 dark:text-amber-400'
          : 'text-rose-700 dark:text-rose-400';

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center p-4">
      <div className="pointer-events-auto flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-2xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="overflow-y-auto p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Lớp {result.grade} · {result.difficulty} · {result.modeLabel}
              </div>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
                Tổng kết trận đấu
              </h1>
              <div className={`mt-1.5 font-display text-xl font-extrabold ${rankColorClass}`}>
                Xếp loại: {result.rank}
              </div>
              {leveledUpTo !== null && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 dark:text-amber-400">
                  <Award className="h-4 w-4" aria-hidden="true" />
                  Thăng cấp! Nhân vật đã đạt Cấp {leveledUpTo}
                </p>
              )}
            </div>

            <div className="text-left sm:text-right tabular-nums">
              <div className="font-math text-4xl font-bold text-slate-900 dark:text-white">
                {result.score.toFixed(1)}/10
              </div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {result.correct}/{result.total} câu đúng ({result.percentage.toFixed(1)}%)
              </div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Thời gian: {formatDuration(result.timeSpentSeconds)}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-slate-200 pt-5 dark:border-slate-800">
            <div className="rounded-lg bg-slate-50 p-3 tabular-nums dark:bg-slate-800/70">
              <div className="text-xs text-slate-500 dark:text-slate-400">Xu thưởng</div>
              <div className="mt-0.5 font-math text-base font-bold text-amber-700 dark:text-amber-400">
                +{formatNumber(result.earnedMoney)}
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 tabular-nums dark:bg-slate-800/70">
              <div className="text-xs text-slate-500 dark:text-slate-400">Kim cương</div>
              <div className="mt-0.5 font-math text-base font-bold text-blue-700 dark:text-blue-400">
                +{formatNumber(result.earnedDiamonds)}
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 tabular-nums dark:bg-slate-800/70">
              <div className="text-xs text-slate-500 dark:text-slate-400">Kinh nghiệm</div>
              <div className="mt-0.5 font-math text-base font-bold text-emerald-700 dark:text-emerald-400">
                +{formatNumber(result.earnedXp)} XP
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onPlayAgain}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 whitespace-nowrap"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Đấu lại
              </button>
              <button
                type="button"
                onClick={onGoHome}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Về sảnh chính
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowReview((v) => !v)}
              className="min-h-10 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400 whitespace-nowrap"
            >
              {showReview ? 'Ẩn chi tiết đáp án' : 'Xem lại đáp án'}
            </button>
          </div>

          {showReview && (
            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Chi tiết từng câu
                </span>
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                      filter === 'all'
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Tất cả ({records.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('wrong')}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                      filter === 'wrong'
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Câu sai ({records.filter((r) => !r.isCorrect).length})
                  </button>
                </div>
              </div>

              <div className="max-h-64 divide-y divide-slate-200 overflow-y-auto pr-1 dark:divide-slate-800">
                {filteredRecords.length === 0 ? (
                  <p className="py-4 text-sm text-slate-500 dark:text-slate-400">
                    Không có câu nào sai!
                  </p>
                ) : (
                  filteredRecords.map((item) => (
                    <div key={item.questionId} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                      <div className="flex items-start gap-2">
                        {item.isCorrect ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        ) : (
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                        )}
                        <div>
                          <div className="font-math font-bold text-slate-900 dark:text-white">
                            Câu {item.questionId}: {item.expression} = {item.correctAnswer}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.explanation}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs tabular-nums shrink-0">
                        <span
                          className={
                            item.isCorrect
                              ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                              : 'font-semibold text-rose-700 dark:text-rose-400'
                          }
                        >
                          {item.userAnswer !== null ? `Trả lời: ${item.userAnswer}` : 'Bỏ trống'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
