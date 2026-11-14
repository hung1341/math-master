import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DailyRewards } from './components/DailyRewards';
import { GameModalShell } from './components/GameModalShell';
import { HintShop } from './components/HintShop';
import { HistoryView } from './components/HistoryView';
import { LobbyHud } from './components/LobbyHud';
import { QuizPlay } from './components/QuizPlay';
import { QuizResult } from './components/QuizResult';
import { StatsView } from './components/StatsView';
import { SystemSettingsModal } from './components/SystemSettingsModal';
import { ThreeArena } from './components/ThreeArena';
import {
  DAILY_HINT_LIMIT,
  DAILY_REWARDS,
  QUIZ_MODES,
  evaluateQuizRank,
} from './constants/gameConfig';
import type {
  ActiveModal,
  AnswerRecord,
  AppStorage,
  CameraPreset,
  CharacterActionEvent,
  CharacterActionType,
  Difficulty,
  GamePhase,
  Grade,
  GraphicsQuality,
  Question,
  QuizHistoryItem,
  QuizModeId,
} from './types/game';
import { generateQuestionSet } from './utils/mathGenerator';
import { playSound } from './utils/sound';
import {
  computeLevel,
  createNewProfile,
  getNextHintPrice,
  getTodayIso,
  loadAppStorage,
  saveAppStorage,
} from './utils/storage';

function formatVietnameseNow(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export default function App() {
  const [storage, setStorage] = useState<AppStorage>(() => loadAppStorage());
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [gamePhase, setGamePhase] = useState<GamePhase>('IDLE');

  const [selectedGrade, setSelectedGrade] = useState<Grade>(2);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Dễ');
  const [selectedMode, setSelectedMode] = useState<QuizModeId>('quick');

  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeTotalSeconds, setActiveTotalSeconds] = useState(8 * 60);

  const [lastResult, setLastResult] = useState<QuizHistoryItem | null>(null);
  const [lastRecords, setLastRecords] = useState<AnswerRecord[]>([]);
  const [leveledUpTo, setLeveledUpTo] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionEvent, setActionEvent] = useState<CharacterActionEvent | null>(null);

  const activeProfile = storage.players[storage.activePlayer];
  const playerNames = Object.keys(storage.players);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', storage.theme === 'dark');
  }, [storage.theme]);

  useEffect(() => {
    saveAppStorage(storage);
  }, [storage]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // Esc key toggles System Settings popup like a standard desktop game
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal === 'none') {
        setActiveModal('settings');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeModal]);

  const triggerCharacterAction = useCallback((type: CharacterActionType) => {
    setActionEvent({ id: Date.now() + Math.random(), type });
  }, []);

  const handleChangeTheme = (theme: 'light' | 'dark') => {
    setStorage((prev) => ({ ...prev, theme }));
  };

  const handleToggleSound = () => {
    setStorage((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleChangeGraphics = (graphicsQuality: GraphicsQuality) => {
    setStorage((prev) => ({ ...prev, graphicsQuality }));
  };

  const handleChangeCamera = (cameraPreset: CameraPreset) => {
    setStorage((prev) => ({ ...prev, cameraPreset }));
  };

  const handleSwitchPlayer = (name: string) => {
    if (!storage.players[name]) return;
    setStorage((prev) => ({ ...prev, activePlayer: name }));
    setGamePhase('IDLE');
  };

  const handleCreatePlayer = (name: string): { ok: boolean; error?: string } => {
    if (name.length < 2) {
      return { ok: false, error: 'Tên hồ sơ cần ít nhất 2 ký tự.' };
    }
    if (storage.players[name]) {
      return { ok: false, error: 'Tên hồ sơ này đã tồn tại.' };
    }
    const created = createNewProfile(name);
    setStorage((prev) => ({
      ...prev,
      activePlayer: name,
      players: {
        ...prev.players,
        [name]: created,
      },
    }));
    setToastMessage(`Đã tạo nhân vật "${name}".`);
    return { ok: true };
  };

  const handleStartQuiz = useCallback(
    (grade: Grade, difficulty: Difficulty, modeId: QuizModeId) => {
      const modeConfig = QUIZ_MODES.find((m) => m.id === modeId) ?? QUIZ_MODES[0];
      const generated = generateQuestionSet(modeConfig.questionCount, grade, difficulty);

      setSelectedGrade(grade);
      setSelectedDifficulty(difficulty);
      setSelectedMode(modeId);
      setActiveQuestions(generated);
      setActiveTotalSeconds(modeConfig.durationMinutes * 60);
      setLastResult(null);
      setLastRecords([]);
      setLeveledUpTo(null);
      setActiveModal('none');
      setGamePhase('PLAYING');
      triggerCharacterAction('idle');
    },
    [triggerCharacterAction]
  );

  const handleBuyHintInQuiz = useCallback((): { ok: boolean; error?: string } => {
    const today = getTodayIso();
    const current = storage.players[storage.activePlayer];
    const usedToday = current.hintDate === today ? current.hintCount : 0;

    if (usedToday >= DAILY_HINT_LIMIT) {
      return { ok: false, error: `Bạn đã dùng hết ${DAILY_HINT_LIMIT} lượt gợi ý hôm nay.` };
    }

    const price = getNextHintPrice(current);
    if (current.money < price) {
      return { ok: false, error: `Không đủ xu (cần ${price.toLocaleString('vi-VN')} xu).` };
    }

    setStorage((prev) => {
      const prof = prev.players[prev.activePlayer];
      const count = prof.hintDate === today ? prof.hintCount : 0;
      return {
        ...prev,
        players: {
          ...prev.players,
          [prev.activePlayer]: {
            ...prof,
            money: prof.money - price,
            hintDate: today,
            hintCount: count + 1,
          },
        },
      };
    });

    return { ok: true };
  }, [storage.activePlayer, storage.players]);

  const handleCompleteQuiz = useCallback(
    (records: AnswerRecord[], timeSpentSeconds: number) => {
      const total = records.length;
      const correct = records.filter((r) => r.isCorrect).length;
      const percentage = total > 0 ? (correct / total) * 100 : 0;
      const scoreOutOf10 = total > 0 ? Math.round((correct / total) * 100) / 10 : 0;
      const evalResult = evaluateQuizRank(percentage, selectedDifficulty);
      const modeConfig = QUIZ_MODES.find((m) => m.id === selectedMode) ?? QUIZ_MODES[0];

      const historyItem: QuizHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: formatVietnameseNow(),
        timestamp: Date.now(),
        grade: selectedGrade,
        difficulty: selectedDifficulty,
        modeId: selectedMode,
        modeLabel: modeConfig.label,
        correct,
        total,
        score: scoreOutOf10,
        percentage: Math.round(percentage * 10) / 10,
        rank: evalResult.rank,
        timeSpentSeconds,
        earnedMoney: evalResult.money,
        earnedDiamonds: evalResult.diamonds,
        earnedXp: evalResult.xp,
      };

      const oldLevel = activeProfile.level;
      const newXp = activeProfile.xp + evalResult.xp;
      const newLevel = computeLevel(newXp);

      setStorage((prev) => {
        const prof = prev.players[prev.activePlayer];
        return {
          ...prev,
          players: {
            ...prev.players,
            [prev.activePlayer]: {
              ...prof,
              money: prof.money + evalResult.money,
              diamonds: prof.diamonds + evalResult.diamonds,
              xp: prof.xp + evalResult.xp,
              level: computeLevel(prof.xp + evalResult.xp),
              totalGames: prof.totalGames + 1,
              totalCorrect: prof.totalCorrect + correct,
              totalQuestions: prof.totalQuestions + total,
              history: [...prof.history, historyItem],
            },
          },
        };
      });

      playSound('finish', storage.soundEnabled);
      triggerCharacterAction(percentage >= 40 ? 'victory' : 'idle');
      setLastResult(historyItem);
      setLastRecords(records);
      setLeveledUpTo(newLevel > oldLevel ? newLevel : null);
      setGamePhase('RESULT');
    },
    [
      activeProfile.level,
      activeProfile.xp,
      selectedDifficulty,
      selectedGrade,
      selectedMode,
      storage.soundEnabled,
      triggerCharacterAction,
    ]
  );

  const handleLeaveQuiz = useCallback(() => {
    setGamePhase('IDLE');
    triggerCharacterAction('idle');
  }, [triggerCharacterAction]);

  const handleClaimDaily = () => {
    const today = getTodayIso();
    if (activeProfile.claimedDate === today) return;

    const dayIndex = (Math.max(1, activeProfile.streak) - 1) % DAILY_REWARDS.length;
    const reward = DAILY_REWARDS[dayIndex];

    setStorage((prev) => {
      const prof = prev.players[prev.activePlayer];
      return {
        ...prev,
        players: {
          ...prev.players,
          [prev.activePlayer]: {
            ...prof,
            money: reward.kind === 'money' ? prof.money + reward.amount : prof.money,
            diamonds:
              reward.kind === 'diamond' ? prof.diamonds + reward.amount : prof.diamonds,
            claimedDate: today,
          },
        },
      };
    });

    playSound('reward', storage.soundEnabled);
    triggerCharacterAction('hint');
    setToastMessage(`Đã nhận quà Ngày ${dayIndex + 1}: +${reward.label}.`);
  };

  const handleToggleAutoFreeze = () => {
    setStorage((prev) => {
      const prof = prev.players[prev.activePlayer];
      return {
        ...prev,
        players: {
          ...prev.players,
          [prev.activePlayer]: {
            ...prof,
            autoFreeze: !prof.autoFreeze,
          },
        },
      };
    });
  };

  const handleResetProfile = () => {
    setStorage((prev) => ({
      ...prev,
      players: {
        ...prev.players,
        [prev.activePlayer]: createNewProfile(prev.activePlayer),
      },
    }));
    setToastMessage(`Đã đặt lại toàn bộ điểm số của "${storage.activePlayer}".`);
  };

  const handleDeleteProfile = () => {
    const remaining = playerNames.filter((n) => n !== storage.activePlayer);
    if (remaining.length === 0) return;

    setStorage((prev) => {
      const nextPlayers = { ...prev.players };
      delete nextPlayers[prev.activePlayer];
      return {
        ...prev,
        activePlayer: remaining[0],
        players: nextPlayers,
      };
    });
    setToastMessage(`Đã xóa hồ sơ "${storage.activePlayer}".`);
  };

  const today = getTodayIso();
  const dailyHintCount =
    activeProfile.hintDate === today ? activeProfile.hintCount : 0;
  const activeModeConfig =
    QUIZ_MODES.find((m) => m.id === selectedMode) ?? QUIZ_MODES[0];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Persistent 3D World Canvas */}
      <ThreeArena
        difficulty={selectedDifficulty}
        gamePhase={gamePhase}
        theme={storage.theme}
        graphicsQuality={storage.graphicsQuality}
        cameraPreset={storage.cameraPreset}
        actionEvent={actionEvent}
      />

      {/* Non-blocking Game Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed top-16 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-900 shadow-lg dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {toastMessage}
        </div>
      )}

      {/* Main Game State Machine HUD */}
      {gamePhase === 'IDLE' && (
        <LobbyHud
          profile={activeProfile}
          selectedGrade={selectedGrade}
          selectedDifficulty={selectedDifficulty}
          selectedMode={selectedMode}
          onChangeGrade={setSelectedGrade}
          onChangeDifficulty={setSelectedDifficulty}
          onChangeMode={setSelectedMode}
          onOpenModal={setActiveModal}
          onRequestStart={() => setActiveModal('pledge')}
        />
      )}

      {gamePhase === 'PLAYING' && (
        <QuizPlay
          grade={selectedGrade}
          difficulty={selectedDifficulty}
          questions={activeQuestions}
          totalSeconds={activeTotalSeconds}
          playerMoney={activeProfile.money}
          dailyHintCount={dailyHintCount}
          nextHintPrice={getNextHintPrice(activeProfile)}
          onBuyHint={handleBuyHintInQuiz}
          onCompleteQuiz={handleCompleteQuiz}
          onLeaveQuiz={handleLeaveQuiz}
          onOpenSettings={() => setActiveModal('settings')}
          onTriggerAction={triggerCharacterAction}
          onPlaySound={(effect) => playSound(effect, storage.soundEnabled)}
        />
      )}

      {gamePhase === 'RESULT' && lastResult && (
        <QuizResult
          result={lastResult}
          records={lastRecords}
          leveledUpTo={leveledUpTo}
          onPlayAgain={() =>
            handleStartQuiz(selectedGrade, selectedDifficulty, selectedMode)
          }
          onGoHome={() => {
            setGamePhase('IDLE');
            triggerCharacterAction('idle');
          }}
        />
      )}

      {/* Game Popups */}
      {activeModal === 'settings' && (
        <SystemSettingsModal
          profile={activeProfile}
          playerNames={playerNames}
          theme={storage.theme}
          soundEnabled={storage.soundEnabled}
          graphicsQuality={storage.graphicsQuality}
          cameraPreset={storage.cameraPreset}
          onChangeTheme={handleChangeTheme}
          onToggleSound={handleToggleSound}
          onChangeGraphics={handleChangeGraphics}
          onChangeCamera={handleChangeCamera}
          onToggleAutoFreeze={handleToggleAutoFreeze}
          onSwitchPlayer={handleSwitchPlayer}
          onCreatePlayer={handleCreatePlayer}
          onResetProfile={handleResetProfile}
          onDeleteProfile={handleDeleteProfile}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'daily' && (
        <GameModalShell
          title="Phần thưởng hằng ngày"
          subtitle="Điểm danh mỗi ngày để nhận xu và kim cương"
          onClose={() => setActiveModal('none')}
          maxWidthClass="max-w-2xl"
        >
          <DailyRewards profile={activeProfile} onClaimDaily={handleClaimDaily} />
        </GameModalShell>
      )}

      {activeModal === 'shop' && (
        <GameModalShell
          title="Cửa hàng gợi ý"
          subtitle="Bảng giá gợi ý hỗ trợ giải toán trong trận đấu"
          onClose={() => setActiveModal('none')}
          maxWidthClass="max-w-2xl"
        >
          <HintShop profile={activeProfile} />
        </GameModalShell>
      )}

      {activeModal === 'history' && (
        <GameModalShell
          title="Lịch sử làm bài"
          subtitle={`Nhật ký điểm số của ${activeProfile.name}`}
          onClose={() => setActiveModal('none')}
          maxWidthClass="max-w-4xl"
        >
          <HistoryView profile={activeProfile} />
        </GameModalShell>
      )}

      {activeModal === 'stats' && (
        <GameModalShell
          title="Thống kê nhân vật"
          subtitle={`Tổng hợp thành tích của ${activeProfile.name}`}
          onClose={() => setActiveModal('none')}
          maxWidthClass="max-w-3xl"
        >
          <StatsView profile={activeProfile} />
        </GameModalShell>
      )}

      {activeModal === 'pledge' && (
        <GameModalShell
          title="Cam kết trước trận đấu"
          subtitle={`Lớp ${selectedGrade} · ${selectedDifficulty} · ${activeModeConfig.questionCount} câu / ${activeModeConfig.durationMinutes} phút`}
          onClose={() => setActiveModal('none')}
          maxWidthClass="max-w-md"
        >
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Làm bài trung thực
              </span>
            </div>

            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>Không sử dụng tài liệu hoặc máy tính bỏ túi.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>Không nhờ người khác làm hộ hay tìm đáp án bên ngoài.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>Tự tin vượt qua Thủ vệ Toán học bằng năng lực của mình.</span>
              </li>
            </ul>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() =>
                  handleStartQuiz(selectedGrade, selectedDifficulty, selectedMode)
                }
                className="min-h-10 rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Đồng ý & Vào trận
              </button>
            </div>
          </div>
        </GameModalShell>
      )}
    </div>
  );
}
