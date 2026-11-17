import {
  Clock,
  Delete,
  Flame,
  Lightbulb,
  LogOut,
  Send,
  Settings,
  Swords,
  Wind,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BOSS_SKILLS, DAILY_HINT_LIMIT, getDifficultyConfig } from '../constants/gameConfig';
import type {
  AnswerRecord,
  BattleSkillId,
  CharacterActionType,
  Difficulty,
  Grade,
  Question,
} from '../types/game';
import type { SoundEffect } from '../utils/sound';
import { formatDuration, formatNumber } from '../utils/storage';

interface QuizPlayProps {
  grade: Grade;
  difficulty: Difficulty;
  questions: Question[];
  totalSeconds: number;
  playerMoney: number;
  dailyHintCount: number;
  nextHintPrice: number;
  onBuyHint: () => { ok: boolean; error?: string };
  onCompleteQuiz: (records: AnswerRecord[], timeSpentSeconds: number) => void;
  onLeaveQuiz: () => void;
  onOpenSettings: () => void;
  onTriggerAction: (type: CharacterActionType, missed?: boolean) => void;
  onPlaySound: (effect: SoundEffect) => void;
  onFlyingChange: (flying: boolean) => void;
}

interface SkillOption {
  id: BattleSkillId;
  hotkey: '1' | '2' | '3' | '4';
  name: string;
  effectText: string;
  damage: number;
  accentClass: string;
}

const BATTLE_SKILLS: SkillOption[] = [
  {
    id: 'bomb',
    hotkey: '1',
    name: 'Chiêu ném bom',
    effectText: 'Nổ lớn · Sát thương x1,6',
    damage: 160,
    accentClass:
      'border-orange-300 bg-orange-50 text-orange-950 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-100 dark:hover:bg-orange-900/70',
  },
  {
    id: 'laser',
    hotkey: '2',
    name: 'Chiêu bắn tia laze',
    effectText: 'Xuyên giáp x1,3 · +4 giây',
    damage: 130,
    accentClass:
      'border-cyan-300 bg-cyan-50 text-cyan-950 hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-100 dark:hover:bg-cyan-900/70',
  },
  {
    id: 'fly',
    hotkey: '3',
    name: 'Chiêu bay',
    effectText: 'Sát thương x1,0 · Né đòn địch',
    damage: 100,
    accentClass:
      'border-emerald-300 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100 dark:hover:bg-emerald-900/70',
  },
  {
    id: 'blink',
    hotkey: '4',
    name: 'Chiêu tốc biến',
    effectText: 'Áp sát · Chém bạo kích x1,5',
    damage: 150,
    accentClass:
      'border-violet-300 bg-violet-50 text-violet-950 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-100 dark:hover:bg-violet-900/70',
  },
];

export function QuizPlay({
  grade,
  difficulty,
  questions,
  totalSeconds,
  playerMoney,
  dailyHintCount,
  nextHintPrice,
  onBuyHint,
  onCompleteQuiz,
  onLeaveQuiz,
  onOpenSettings,
  onTriggerAction,
  onPlaySound,
  onFlyingChange,
}: QuizPlayProps) {
  const maxGuardianHp = Math.max(100, questions.length * 100);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [guardianHp, setGuardianHp] = useState(maxGuardianHp);
  const [isFlying, setIsFlying] = useState(false);
  const [awaitingSkill, setAwaitingSkill] = useState(false);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [confirmHintOpen, setConfirmHintOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);

  const bossWeapon = getDifficultyConfig(difficulty).bossWeapon;
  const inputRef = useRef<HTMLInputElement>(null);
  const recordsRef = useRef<AnswerRecord[]>([]);
  const remainingRef = useRef(totalSeconds);
  const finishedRef = useRef(false);
  const awaitingSkillRef = useRef(false);
  const feedbackRef = useRef(false);
  const bossEnragedRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);
  const enrageTimerRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const correctSoFar = records.filter((r) => r.isCorrect).length;
  const guardianHpPercent = Math.max(0, Math.round((guardianHp / maxGuardianHp) * 100));

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  useEffect(() => {
    remainingRef.current = remainingSeconds;
  }, [remainingSeconds]);

  useEffect(() => {
    awaitingSkillRef.current = awaitingSkill;
  }, [awaitingSkill]);

  useEffect(() => {
    feedbackRef.current = Boolean(feedback);
  }, [feedback]);

  useEffect(() => {
    if (!awaitingSkill && !feedback) {
      inputRef.current?.focus();
    }
  }, [currentIndex, awaitingSkill, feedback]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
      if (enrageTimerRef.current !== null) {
        window.clearTimeout(enrageTimerRef.current);
      }
      onFlyingChange(false);
    };
  }, [onFlyingChange]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (awaitingSkillRef.current || feedbackRef.current) {
        return;
      }
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          if (!finishedRef.current) {
            finishedRef.current = true;
            const answeredIds = new Set(recordsRef.current.map((r) => r.questionId));
            const finalRecords = [...recordsRef.current];
            for (const q of questions) {
              if (!answeredIds.has(q.id)) {
                finalRecords.push({
                  questionId: q.id,
                  expression: q.expression,
                  prompt: q.prompt,
                  correctAnswer: q.answer,
                  userAnswer: null,
                  isCorrect: false,
                  usedHint: false,
                  explanation: q.explanation,
                });
              }
            }
            onFlyingChange(false);
            onCompleteQuiz(finalRecords, totalSeconds);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [onCompleteQuiz, onFlyingChange, questions, totalSeconds]);

  const scheduleAdvance = useCallback(
    (finalRecords: AnswerRecord[], delayMs: number) => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
      advanceTimerRef.current = window.setTimeout(() => {
        if (finishedRef.current) return;
        if (currentIndex + 1 >= questions.length) {
          finishedRef.current = true;
          onFlyingChange(false);
          const spent = Math.max(1, totalSeconds - remainingRef.current);
          onCompleteQuiz(finalRecords, spent);
        } else {
          setCurrentIndex((i) => i + 1);
          setInputValue('');
          setHintRevealed(false);
          setFeedback(null);
          setAwaitingSkill(false);
        }
      }, delayMs);
    },
    [currentIndex, onCompleteQuiz, onFlyingChange, questions.length, totalSeconds]
  );

  const handleSelectSkill = useCallback(
    (skillId: BattleSkillId) => {
      if (!awaitingSkill || feedback || finishedRef.current) return;
      const skill = BATTLE_SKILLS.find((s) => s.id === skillId) ?? BATTLE_SKILLS[0];

      const updatedRecords = recordsRef.current.map((rec, idx) =>
        idx === recordsRef.current.length - 1 ? { ...rec, skillUsed: skillId } : rec
      );
      setRecords(updatedRecords);
      recordsRef.current = updatedRecords;

      const nextGuardianHp = Math.max(0, guardianHp - skill.damage);
      setGuardianHp(nextGuardianHp);

      if (skillId === 'laser') {
        setRemainingSeconds((prev) => prev + 4);
      } else if (skillId === 'fly') {
        setIsFlying(true);
        onFlyingChange(true);
      }

      onPlaySound(skillId);
      onTriggerAction(skillId);
      setAwaitingSkill(false);

      const messageBySkill: Record<BattleSkillId, string> = {
        bomb: 'Ném Bom trúng đích! Thủ vệ chịu sát thương nổ cực đại!',
        laser: 'Bắn Tia Laze xuyên giáp! Thủ vệ mất máu lớn · +4 giây thời gian!',
        fly: 'Chiêu Bay kích hoạt! Bay lơ lửng tránh đòn và tung xung kích vào Thủ vệ!',
        blink: 'Tốc biến đến trước mặt Thủ vệ và tung nhát chém bạo kích cực mạnh!',
      };

      setFeedback({
        isCorrect: true,
        message: messageBySkill[skillId],
      });

      const shouldEnrage =
        nextGuardianHp > 0 &&
        nextGuardianHp <= maxGuardianHp * 0.5 &&
        !bossEnragedRef.current;

      if (shouldEnrage) {
        bossEnragedRef.current = true;
        const enrageSkill = currentIndex % 2 === 0 ? BOSS_SKILLS[2] : BOSS_SKILLS[3];
        const heroDodgedInAir = isFlying || skillId === 'fly';
        if (enrageTimerRef.current !== null) {
          window.clearTimeout(enrageTimerRef.current);
        }
        enrageTimerRef.current = window.setTimeout(() => {
          if (finishedRef.current) return;
          onPlaySound(enrageSkill.id);
          onTriggerAction(enrageSkill.id, true);
          setFeedback({
            isCorrect: true,
            message: `Thủ vệ cuồng nộ vung ${bossWeapon} tung ${enrageSkill.name}! Bạn ${
              heroDodgedInAir ? 'bay né' : 'vung Thanh Đao đỡ đòn'
            } thành công!`,
          });
          scheduleAdvance(updatedRecords, 980);
        }, 720);
        return;
      }

      scheduleAdvance(updatedRecords, 920);
    },
    [
      awaitingSkill,
      bossWeapon,
      currentIndex,
      feedback,
      guardianHp,
      isFlying,
      maxGuardianHp,
      onFlyingChange,
      onPlaySound,
      onTriggerAction,
      scheduleAdvance,
    ]
  );

  // Hotkeys 1, 2, 3, 4 when choosing a battle skill after answering correctly
  useEffect(() => {
    if (!awaitingSkill || feedback) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') {
        e.preventDefault();
        handleSelectSkill('bomb');
      } else if (e.key === '2') {
        e.preventDefault();
        handleSelectSkill('laser');
      } else if (e.key === '3') {
        e.preventDefault();
        handleSelectSkill('fly');
      } else if (e.key === '4') {
        e.preventDefault();
        handleSelectSkill('blink');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [awaitingSkill, feedback, handleSelectSkill]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (feedback || awaitingSkill || finishedRef.current) return;

    const trimmed = inputValue.trim();
    if (!trimmed) {
      setErrorMsg('Bạn chưa nhập đáp án.');
      inputRef.current?.focus();
      return;
    }

    if (!/^-?\d+$/.test(trimmed)) {
      setErrorMsg('Vui lòng chỉ nhập số nguyên.');
      inputRef.current?.focus();
      return;
    }

    const parsed = Number.parseInt(trimmed, 10);
    const isCorrect = parsed === currentQuestion.answer;

    const newRecord: AnswerRecord = {
      questionId: currentQuestion.id,
      expression: currentQuestion.expression,
      prompt: currentQuestion.prompt,
      correctAnswer: currentQuestion.answer,
      userAnswer: parsed,
      isCorrect,
      usedHint: hintRevealed,
      explanation: currentQuestion.explanation,
    };

    const nextRecords = [...records, newRecord];
    setRecords(nextRecords);
    recordsRef.current = nextRecords;
    setErrorMsg('');

    if (isCorrect) {
      onPlaySound('correct');
      setAwaitingSkill(true);
      return;
    }

    const bossSkill = BOSS_SKILLS[currentIndex % BOSS_SKILLS.length];

    if (isFlying) {
      setIsFlying(false);
      onFlyingChange(false);
      onPlaySound('dodge');
      onTriggerAction(bossSkill.id, true);
      setFeedback({
        isCorrect: false,
        message: `Thủ vệ vung ${bossWeapon} tung ${bossSkill.name} nhưng bạn bay né thành công! (Đáp án đúng là ${currentQuestion.answer})`,
      });
    } else {
      onPlaySound(bossSkill.id);
      onTriggerAction(bossSkill.id, false);
      if (bossSkill.timePenaltySeconds > 0) {
        setRemainingSeconds((prev) =>
          prev > 8 ? Math.max(5, prev - bossSkill.timePenaltySeconds) : prev
        );
      }
      const penaltyNote =
        bossSkill.timePenaltySeconds > 0 ? ` (-${bossSkill.timePenaltySeconds}s)` : '';
      setFeedback({
        isCorrect: false,
        message: `Chưa đúng — Đáp án đúng là ${currentQuestion.answer}. Thủ vệ vung ${bossWeapon} tung ${bossSkill.name}${penaltyNote}!`,
      });
    }

    scheduleAdvance(nextRecords, 960);
  };

  const handleConfirmHint = () => {
    const res = onBuyHint();
    setConfirmHintOpen(false);
    if (!res.ok) {
      setErrorMsg(res.error ?? 'Không thể mua gợi ý.');
      return;
    }
    onPlaySound('hint');
    onTriggerAction('hint');
    setHintRevealed(true);
    setErrorMsg('');
    inputRef.current?.focus();
  };

  const appendDigit = (digit: string) => {
    if (feedback || awaitingSkill) return;
    setErrorMsg('');
    if (inputValue.length < 10) {
      setInputValue((prev) => prev + digit);
    }
    inputRef.current?.focus();
  };

  const backspaceDigit = () => {
    if (feedback || awaitingSkill) return;
    setErrorMsg('');
    setInputValue((prev) => prev.slice(0, -1));
    inputRef.current?.focus();
  };

  const isLowTime = remainingSeconds <= 120;
  const isCriticalTime = remainingSeconds <= 30;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-5">
      {/* Top Duel HUD */}
      <div className="pointer-events-auto mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white/92 px-4 py-3 shadow-lg dark:border-slate-700/90 dark:bg-slate-900/90">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 tabular-nums dark:text-slate-400">
            <span className="text-slate-900 dark:text-white">Lớp {grade}</span>
            <span aria-hidden="true">·</span>
            <span>{difficulty}</span>
            <span aria-hidden="true">·</span>
            <span>
              Câu {currentIndex + 1}/{questions.length}
            </span>
            <span aria-hidden="true">·</span>
            <span>Đúng {correctSoFar}</span>
            {isFlying && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 dark:text-emerald-300">
                  Đang bay (Né 1 đòn)
                </span>
              </>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="h-2 w-36 overflow-hidden rounded-full bg-slate-200 sm:w-48 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
                style={{ width: `${guardianHpPercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600 tabular-nums dark:text-slate-300">
              Thủ vệ ({bossWeapon}): {guardianHpPercent}% HP · Tiến độ {progressPercent}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            aria-live="polite"
            className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-math text-sm font-bold tabular-nums ${
              isCriticalTime
                ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                : isLowTime
                  ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                  : 'border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
            }`}
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{formatDuration(remainingSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Mở cài đặt hệ thống"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setConfirmLeaveOpen(true)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/50 whitespace-nowrap"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Rời trận
          </button>
        </div>
      </div>

      {/* Bottom-Center Spell Casting / Skill Choice Bar */}
      <div className="pointer-events-auto mx-auto w-full max-w-3xl rounded-xl border border-slate-200/90 bg-white/94 p-4 shadow-2xl sm:p-5 dark:border-slate-700/90 dark:bg-slate-900/92">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {currentQuestion.topic
                ? `Chuyên đề: ${currentQuestion.topic}`
                : 'Giải phép tính để chọn chiêu thức tấn công'}
            </div>
            {currentQuestion.prompt ? (
              <div className="mt-1 font-display text-lg font-bold leading-snug text-slate-900 sm:text-xl dark:text-white">
                {currentQuestion.prompt}
              </div>
            ) : (
              <div className="mt-0.5 font-math text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {currentQuestion.expression} = ?
              </div>
            )}
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500 tabular-nums dark:text-slate-400">
            <div>Xu hiện có: {formatNumber(playerMoney)} xu</div>
            <div>
              Gợi ý hôm nay: {dailyHintCount}/{DAILY_HINT_LIMIT}
            </div>
          </div>
        </div>

        {hintRevealed && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
            <strong>Gợi ý:</strong> {currentQuestion.explanation}
          </div>
        )}

        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-3 rounded-lg border px-3.5 py-2 text-sm font-semibold ${
              feedback.isCorrect
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {errorMsg && (
          <p role="alert" className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {errorMsg}
          </p>
        )}

        {awaitingSkill ? (
          <div className="mt-3.5">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <span>Trả lời chính xác! Chọn chiêu để đánh Thủ vệ:</span>
              <span className="hidden text-slate-500 sm:inline dark:text-slate-400">
                Nhấn phím 1, 2, 3 hoặc 4
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {BATTLE_SKILLS.map((skill) => {
                const Icon =
                  skill.id === 'bomb'
                    ? Flame
                    : skill.id === 'laser'
                      ? Zap
                      : skill.id === 'fly'
                        ? Wind
                        : Swords;
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleSelectSkill(skill.id)}
                    className={`flex min-h-14 items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-transform active:scale-[0.99] ${skill.accentClass}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/80 font-math text-sm font-bold shadow-xs dark:bg-slate-900/70">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">
                        {skill.hotkey}. {skill.name}
                      </div>
                      <div className="truncate text-xs opacity-85">
                        {skill.effectText}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <label htmlFor="quiz-answer-input" className="sr-only">
                Nhập đáp án số nguyên
              </label>
              <input
                ref={inputRef}
                id="quiz-answer-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                disabled={Boolean(feedback)}
                value={inputValue}
                onChange={(e) => {
                  setErrorMsg('');
                  setInputValue(e.target.value);
                }}
                placeholder={
                  currentQuestion.unit
                    ? `Nhập đáp án (${currentQuestion.unit})...`
                    : 'Nhập đáp án...'
                }
                className="min-h-11 flex-1 rounded-lg border-2 border-slate-300 bg-slate-50 px-4 py-2 font-math text-xl font-bold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={hintRevealed || Boolean(feedback)}
                  onClick={() => {
                    if (dailyHintCount >= DAILY_HINT_LIMIT) {
                      setErrorMsg(`Bạn đã dùng hết ${DAILY_HINT_LIMIT} lượt gợi ý hôm nay.`);
                      return;
                    }
                    if (playerMoney < nextHintPrice) {
                      setErrorMsg(`Không đủ xu (cần ${formatNumber(nextHintPrice)} xu).`);
                      return;
                    }
                    setConfirmHintOpen(true);
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200 whitespace-nowrap"
                >
                  <Lightbulb className="h-4 w-4" aria-hidden="true" />
                  {hintRevealed ? 'Đã gợi ý' : `Gợi ý (${formatNumber(nextHintPrice)})`}
                </button>

                <button
                  type="submit"
                  disabled={Boolean(feedback)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 sm:flex-none dark:bg-blue-500 dark:hover:bg-blue-600 whitespace-nowrap"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Trả lời
                </button>
              </div>
            </form>

            {/* Compact mobile touch keypad */}
            <div className="mt-2.5 grid grid-cols-6 gap-1.5 sm:hidden">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'].map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={Boolean(feedback)}
                  onClick={() => appendDigit(key)}
                  className="min-h-10 rounded-md border border-slate-200 bg-slate-50 font-math text-sm font-bold text-slate-900 active:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {key}
                </button>
              ))}
              <button
                type="button"
                disabled={Boolean(feedback)}
                onClick={backspaceDigit}
                aria-label="Xóa một ký tự"
                className="flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-slate-700 active:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Delete className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </div>

      {confirmHintOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-hint-title"
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4"
        >
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <h3 id="confirm-hint-title" className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Xác nhận mua gợi ý
            </h3>
            <p className="mt-2 text-sm text-slate-600 tabular-nums dark:text-slate-300">
              Dùng <strong>{formatNumber(nextHintPrice)} xu</strong> để mở hướng dẫn giải cho câu hỏi này?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmHintOpen(false)}
                className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmHint}
                className="min-h-10 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Mua gợi ý
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmLeaveOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-leave-title"
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4"
        >
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <h3 id="confirm-leave-title" className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Rời khỏi trận đấu?
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Kết quả hiện tại sẽ không được lưu và bạn sẽ không nhận thưởng.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmLeaveOpen(false)}
                className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Tiếp tục
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmLeaveOpen(false);
                  onFlyingChange(false);
                  onLeaveQuiz();
                }}
                className="min-h-10 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Rời trận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
