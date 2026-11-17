import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DailyRewards } from './components/DailyRewards';
import { GameModalShell } from './components/GameModalShell';
import { HintShop } from './components/HintShop';
import { HistoryView } from './components/HistoryView';
import { KnowledgeHandbook } from './components/KnowledgeHandbook';
import { LobbyHud } from './components/LobbyHud';
import { QuestsModal } from './components/QuestsModal';
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
  formatTimeLimitLabel,
  getQuizDurationSeconds,
} from './constants/gameConfig';
import {
  doesVictoryMatchQuest,
  getDailyQuestsForWave,
  getMonsterQuestsForWave,
  type MonsterQuest,
} from './constants/quests';
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
import { playSound, setAmbientSound, setMusicMode } from './utils/sound';
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
  const [isHeroFlying, setIsHeroFlying] = useState(false);

  const activeProfile = storage.players[storage.activePlayer];
  const playerNames = Object.keys(storage.players);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', storage.theme === 'dark');
  }, [storage.theme]);

  useEffect(() => {
    saveAppStorage(storage);
  }, [storage]);

  useEffect(() => {
    setAmbientSound(gamePhase === 'IDLE' && storage.soundEnabled);
    setMusicMode(
      !storage.soundEnabled ? 'off' : gamePhase === 'PLAYING' ? 'battle' : 'lobby'
    );
    return () => {
      setAmbientSound(false);
      setMusicMode('off');
    };
  }, [gamePhase, storage.soundEnabled]);

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

  const triggerCharacterAction = useCallback((type: CharacterActionType, missed?: boolean) => {
    setActionEvent({ id: Date.now() + Math.random(), type, missed });
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
      setActiveTotalSeconds(getQuizDurationSeconds(difficulty, modeId));
      setLastResult(null);
      setLastRecords([]);
      setLeveledUpTo(null);
      setIsHeroFlying(false);
      setActiveModal('none');
      setGamePhase('PLAYING');
      playSound('whistle', storage.soundEnabled);
      triggerCharacterAction('idle');
    },
    [storage.soundEnabled, triggerCharacterAction]
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
        const todayStr = getTodayIso();
        const questWave = Math.max(1, prof.questWave || 1);
        const dailyQuestWave =
          prof.dailyQuestDate === todayStr ? Math.max(1, prof.dailyQuestWave || 1) : 1;

        const nextQuestProgress = { ...(prof.questProgress ?? {}) };
        const nextDailyProgress =
          prof.dailyQuestDate === todayStr ? { ...(prof.dailyQuestProgress ?? {}) } : {};
        const nextDailyClaimed =
          prof.dailyQuestDate === todayStr ? [...(prof.dailyClaimedQuests ?? [])] : [];

        if (percentage >= 40) {
          for (const quest of getMonsterQuestsForWave(questWave)) {
            if (
              doesVictoryMatchQuest(
                quest,
                selectedGrade,
                selectedDifficulty,
                percentage,
                selectedMode
              )
            ) {
              const cur = nextQuestProgress[quest.id] ?? 0;
              if (cur < quest.target) {
                nextQuestProgress[quest.id] = cur + 1;
              }
            }
          }
          for (const quest of getDailyQuestsForWave(dailyQuestWave)) {
            if (
              doesVictoryMatchQuest(
                quest,
                selectedGrade,
                selectedDifficulty,
                percentage,
                selectedMode
              )
            ) {
              const cur = nextDailyProgress[quest.id] ?? 0;
              if (cur < quest.target) {
                nextDailyProgress[quest.id] = cur + 1;
              }
            }
          }
        }

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
              questWave,
              questProgress: nextQuestProgress,
              dailyQuestDate: todayStr,
              dailyQuestWave,
              dailyQuestProgress: nextDailyProgress,
              dailyClaimedQuests: nextDailyClaimed,
            },
          },
        };
      });

      playSound('finish', storage.soundEnabled);
      setIsHeroFlying(false);
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
    setIsHeroFlying(false);
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

  const handleClaimQuest = (quest: MonsterQuest) => {
    const todayStr = getTodayIso();
    const isToday = activeProfile.dailyQuestDate === todayStr;
    const progress = quest.isDaily
      ? isToday
        ? (activeProfile.dailyQuestProgress[quest.id] ?? 0)
        : 0
      : (activeProfile.questProgress[quest.id] ?? 0);
    const alreadyClaimed = quest.isDaily
      ? isToday && activeProfile.dailyClaimedQuests.includes(quest.id)
      : activeProfile.claimedQuests.includes(quest.id);

    if (progress < quest.target || alreadyClaimed) return;

    const oldLevel = activeProfile.level;
    const newLevel = computeLevel(activeProfile.xp + quest.rewardXp);
    const currentMilestoneWave = Math.max(1, activeProfile.questWave || 1);
    const currentDailyWave = isToday ? Math.max(1, activeProfile.dailyQuestWave || 1) : 1;

    let unlockedWaveNotice = '';
    if (quest.isDaily) {
      const dailyQuests = getDailyQuestsForWave(currentDailyWave);
      const nextClaimedIds = [
        ...(isToday ? activeProfile.dailyClaimedQuests : []),
        quest.id,
      ];
      if (dailyQuests.every((q) => nextClaimedIds.includes(q.id))) {
        unlockedWaveNotice = ` · Đã mở khóa Nhiệm vụ Ngày Đợt ${currentDailyWave + 1}!`;
      }
    } else {
      const milestoneQuests = getMonsterQuestsForWave(currentMilestoneWave);
      const nextClaimedIds = [...activeProfile.claimedQuests, quest.id];
      if (milestoneQuests.every((q) => nextClaimedIds.includes(q.id))) {
        unlockedWaveNotice = ` · Đã mở khóa Săn Quái Đợt ${currentMilestoneWave + 1}!`;
      }
    }

    setStorage((prev) => {
      const prof = prev.players[prev.activePlayer];
      const nextXp = prof.xp + quest.rewardXp;
      let nextQuestWave = Math.max(1, prof.questWave || 1);
      let nextQuestProgress = { ...prof.questProgress };
      let nextClaimed = [...prof.claimedQuests];

      const isSameDay = prof.dailyQuestDate === todayStr;
      let nextDailyWave = isSameDay ? Math.max(1, prof.dailyQuestWave || 1) : 1;
      let nextDailyProgress = isSameDay ? { ...prof.dailyQuestProgress } : {};
      let nextDailyClaimed = isSameDay ? [...prof.dailyClaimedQuests] : [];

      if (quest.isDaily) {
        if (!nextDailyClaimed.includes(quest.id)) nextDailyClaimed.push(quest.id);
        const dailyQuests = getDailyQuestsForWave(nextDailyWave);
        if (dailyQuests.every((q) => nextDailyClaimed.includes(q.id))) {
          nextDailyWave += 1;
          nextDailyProgress = {};
          nextDailyClaimed = [];
        }
      } else {
        if (!nextClaimed.includes(quest.id)) nextClaimed.push(quest.id);
        const milestoneQuests = getMonsterQuestsForWave(nextQuestWave);
        if (milestoneQuests.every((q) => nextClaimed.includes(q.id))) {
          nextQuestWave += 1;
          nextQuestProgress = {};
          nextClaimed = [];
        }
      }

      return {
        ...prev,
        players: {
          ...prev.players,
          [prev.activePlayer]: {
            ...prof,
            money: prof.money + quest.rewardMoney,
            diamonds: prof.diamonds + quest.rewardDiamonds,
            xp: nextXp,
            level: computeLevel(nextXp),
            questWave: nextQuestWave,
            questProgress: nextQuestProgress,
            claimedQuests: nextClaimed,
            dailyQuestDate: todayStr,
            dailyQuestWave: nextDailyWave,
            dailyQuestProgress: nextDailyProgress,
            dailyClaimedQuests: nextDailyClaimed,
          },
        },
      };
    });

    playSound('reward', storage.soundEnabled);
    triggerCharacterAction('victory');
    const levelText = newLevel > oldLevel ? ` · Lên Cấp ${newLevel}!` : '';
    setToastMessage(
      `Hoàn thành "${quest.title}": +${quest.rewardMoney.toLocaleString('vi-VN')} xu, +${quest.rewardDiamonds} kim cương, +${quest.rewardXp.toLocaleString('vi-VN')} XP${levelText}${unlockedWaveNotice}`
    );
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

  const activeDailyQuests = getDailyQuestsForWave(
    activeProfile.dailyQuestDate === today ? Math.max(1, activeProfile.dailyQuestWave || 1) : 1
  );
  const activeMilestoneQuests = getMonsterQuestsForWave(Math.max(1, activeProfile.questWave || 1));

  const claimableQuestCount = [...activeDailyQuests, ...activeMilestoneQuests].filter((q) => {
    if (q.isDaily) {
      if (activeProfile.dailyQuestDate !== today) return false;
      const prog = activeProfile.dailyQuestProgress[q.id] ?? 0;
      return prog >= q.target && !activeProfile.dailyClaimedQuests.includes(q.id);
    }
    const prog = activeProfile.questProgress[q.id] ?? 0;
    return prog >= q.target && !activeProfile.claimedQuests.includes(q.id);
  }).length;

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
        isHeroFlying={gamePhase === 'PLAYING' && isHeroFlying}
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
          claimableQuestCount={claimableQuestCount}
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
          onFlyingChange={setIsHeroFlying}
        />
      )}

      {gamePhase === 'RESULT' && lastResult && (
        <QuizResult
          result={lastResult}
          records={lastRecords}
          leveledUpTo={leveledUpTo}
          claimableQuestCount={claimableQuestCount}
          onPlayAgain={() =>
            handleStartQuiz(selectedGrade, selectedDifficulty, selectedMode)
          }
          onGoHome={() => {
            setGamePhase('IDLE');
            triggerCharacterAction('idle');
          }}
          onOpenQuests={() => {
            setGamePhase('IDLE');
            triggerCharacterAction('idle');
            setActiveModal('quests');
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

      {activeModal === 'guide' && (
        <GameModalShell
          title="Sổ tay Kiến thức Toán 2, 3 & 4"
          subtitle="Tổng hợp kiến thức trọng tâm Học kì 1 & Học kì 2 cho cả ba khối lớp"
          onClose={() => setActiveModal('none')}
          maxWidthClass="max-w-4xl"
        >
          <KnowledgeHandbook
            initialGrade={selectedGrade}
            onStartPractice={(gradeToPlay) => {
              setSelectedGrade(gradeToPlay);
              setActiveModal('pledge');
            }}
          />
        </GameModalShell>
      )}

      {activeModal === 'quests' && (
        <GameModalShell
          title="Nhiệm vụ Đánh Quái Vật"
          subtitle="Đánh bại quái vật theo cấp độ để nhận thêm xu, kim cương và kinh nghiệm"
          onClose={() => setActiveModal('none')}
          maxWidthClass="max-w-3xl"
        >
          <QuestsModal
            profile={activeProfile}
            onClaimQuest={handleClaimQuest}
            onFightForQuest={(diff, grade) => {
              if (diff) setSelectedDifficulty(diff);
              if (grade) setSelectedGrade(grade);
              setActiveModal('pledge');
            }}
          />
        </GameModalShell>
      )}

      {activeModal === 'pledge' && (
        <GameModalShell
          title="Cam kết trước trận đấu"
          subtitle={`Lớp ${selectedGrade} · ${selectedDifficulty} · ${activeModeConfig.questionCount} câu / ${formatTimeLimitLabel(
            getQuizDurationSeconds(selectedDifficulty, selectedMode)
          )}`}
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
