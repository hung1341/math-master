import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GRADE_2_KNOWLEDGE } from '../data/grade2Knowledge';
import { GRADE_3_KNOWLEDGE } from '../data/grade3Knowledge';
import { GRADE_4_KNOWLEDGE, type KnowledgeCategory } from '../data/grade4Knowledge';
import type { Grade } from '../types/game';

interface KnowledgeHandbookProps {
  initialGrade?: Grade;
  onStartPractice?: (grade: Grade) => void;
}

export function KnowledgeHandbook({
  initialGrade = 2,
  onStartPractice,
}: KnowledgeHandbookProps) {
  const [handbookGrade, setHandbookGrade] = useState<Grade>(initialGrade);
  const [activeTab, setActiveTab] = useState<KnowledgeCategory['id']>('numbers');
  const [query, setQuery] = useState('');

  const categories =
    handbookGrade === 2
      ? GRADE_2_KNOWLEDGE
      : handbookGrade === 3
        ? GRADE_3_KNOWLEDGE
        : GRADE_4_KNOWLEDGE;

  const trimmedQuery = query.trim().toLowerCase();

  const visibleSections = useMemo(() => {
    if (!trimmedQuery) {
      return categories.find((c) => c.id === activeTab)?.sections ?? [];
    }

    return categories.flatMap((cat) => cat.sections).filter((sec) => {
      const haystacks = [
        sec.title,
        ...sec.bullets,
        ...(sec.formulas?.map((f) => `${f.label ?? ''} ${f.formula}`) ?? []),
        ...(sec.example ? [sec.example.title, ...sec.example.lines] : []),
      ];
      return haystacks.some((text) => text.toLowerCase().includes(trimmedQuery));
    });
  }, [activeTab, categories, trimmedQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Grade Switcher */}
        <div className="inline-flex shrink-0 rounded-lg bg-violet-100/80 p-1 dark:bg-violet-950/50">
          {([2, 3, 4] as const).map((g) => {
            const active = handbookGrade === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setHandbookGrade(g);
                  setActiveTab('numbers');
                }}
                className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-violet-600 text-white shadow-xs dark:bg-violet-500'
                    : 'text-violet-800 hover:text-violet-950 dark:text-violet-300 dark:hover:text-white'
                }`}
              >
                Lớp {g}
              </button>
            );
          })}
        </div>

        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-violet-500 dark:text-violet-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              handbookGrade === 2
                ? 'Tìm kiến thức Lớp 2 (đường gấp khúc, số hạng, đề-xi-mét...)'
                : handbookGrade === 3
                  ? 'Tìm kiến thức Lớp 3 (La Mã, chu vi, diện tích, tìm x...)'
                  : 'Tìm kiến thức Lớp 4 (trung bình cộng, tỉ lệ bản đồ, chia hết...)'
            }
            className="min-h-10 w-full rounded-lg border border-violet-300 bg-white pr-3 pl-9 text-sm text-slate-900 focus:border-violet-600 focus:outline-none dark:border-violet-800/80 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-violet-500"
          />
        </div>

        {onStartPractice && (
          <button
            type="button"
            onClick={() => onStartPractice(handbookGrade)}
            className="min-h-10 shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 whitespace-nowrap"
          >
            Luyện Toán Lớp {handbookGrade} ngay
          </button>
        )}
      </div>

      {!trimmedQuery && (
        <div className="flex flex-wrap gap-1.5 rounded-lg bg-violet-100/70 p-1 dark:bg-violet-950/40">
          {categories.map((cat) => {
            const active = cat.id === activeTab;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`min-h-9 flex-1 rounded-md px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-white text-violet-700 shadow-xs dark:bg-slate-900 dark:text-violet-300'
                    : 'text-violet-800 hover:text-violet-950 dark:text-violet-300 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {visibleSections.length === 0 ? (
        <div className="rounded-lg border border-violet-200 p-6 text-center text-sm text-slate-500 dark:border-violet-900/60 dark:text-slate-400">
          Không tìm thấy nội dung khớp với từ khóa &ldquo;{query}&rdquo; trong Toán Lớp {handbookGrade}.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleSections.map((section) => (
            <section
              key={section.id}
              className="rounded-xl border border-violet-200 bg-violet-50/45 p-4 dark:border-violet-900/60 dark:bg-violet-950/25"
            >
              <h3 className="font-display text-sm font-extrabold text-violet-950 sm:text-base dark:text-violet-100">
                {section.title}
              </h3>

              {section.formulas && section.formulas.length > 0 && (
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {section.formulas.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-violet-300 bg-violet-100/75 px-3 py-2 dark:border-violet-800/80 dark:bg-violet-950/60"
                    >
                      {item.label && (
                        <div className="text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                          {item.label}
                        </div>
                      )}
                      <div className="font-math text-xs font-bold text-violet-950 sm:text-sm dark:text-violet-100">
                        {item.formula}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.bullets.length > 0 && (
                <ul className="mt-2.5 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-700 sm:text-sm dark:text-slate-300">
                  {section.bullets.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              )}

              {section.example && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {section.example.title}
                  </div>
                  <div className="mt-1 space-y-0.5 font-math text-xs text-emerald-900 dark:text-emerald-200">
                    {section.example.lines.map((ex, i) => (
                      <div key={i}>{ex}</div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
