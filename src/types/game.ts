export type Grade = 2 | 3 | 4;

export type Difficulty =
  | 'Dễ'
  | 'Bình thường'
  | 'Khó'
  | 'Rất khó'
  | 'Không thể'
  | 'Không thể vượt qua'
  | 'Thảm họa'
  | 'Ác mộng'
  | 'Địa ngục'
  | 'Bất khả thi'
  | 'Thần thánh'
  | 'Vượt giới hạn'
  | 'Vô tận';

export type QuizModeId = 'standard' | 'quick';

export type GraphicsQuality = 'high' | 'low';

export type CameraPreset = 'auto' | 'duel' | 'overview';

export type ActiveModal =
  | 'none'
  | 'settings'
  | 'daily'
  | 'shop'
  | 'history'
  | 'stats'
  | 'pledge'
  | 'guide'
  | 'quests';

export type GamePhase = 'IDLE' | 'PLAYING' | 'RESULT';

export type BattleSkillId = 'bomb' | 'laser' | 'fly' | 'blink';

export type BossSkillId =
  | 'boss_meteor'
  | 'boss_laser'
  | 'boss_thunder'
  | 'boss_slash';

export type CharacterActionType =
  | 'idle'
  | 'attack'
  | 'bomb'
  | 'laser'
  | 'fly'
  | 'blink'
  | 'dodge'
  | 'hit'
  | 'hint'
  | 'victory'
  | BossSkillId;

export interface CharacterActionEvent {
  id: number;
  type: CharacterActionType;
  missed?: boolean;
}

export type MathOperation = '+' | '-' | '×' | '÷';

export interface Question {
  id: number;
  expression: string;
  prompt?: string;
  topic?: string;
  unit?: string;
  answer: number;
  explanation: string;
  operation: MathOperation;
}

export interface AnswerRecord {
  questionId: number;
  expression: string;
  prompt?: string;
  correctAnswer: number;
  userAnswer: number | null;
  isCorrect: boolean;
  usedHint: boolean;
  skillUsed?: BattleSkillId;
  explanation: string;
}

export type RankLabel = 'XUẤT SẮC' | 'GIỎI' | 'ĐẠT' | 'CẦN CỐ GẮNG HƠN';

export interface QuizHistoryItem {
  id: string;
  date: string;
  timestamp: number;
  grade: Grade;
  difficulty: Difficulty;
  modeId: QuizModeId;
  modeLabel: string;
  correct: number;
  total: number;
  score: number;
  percentage: number;
  rank: RankLabel;
  timeSpentSeconds: number;
  earnedMoney: number;
  earnedDiamonds: number;
  earnedXp: number;
}

export interface PlayerProfile {
  name: string;
  money: number;
  diamonds: number;
  xp: number;
  level: number;
  streak: number;
  lastDate: string;
  claimedDate: string;
  hintDate: string;
  hintCount: number;
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  autoFreeze: boolean;
  history: QuizHistoryItem[];
  questWave: number;
  questProgress: Record<string, number>;
  claimedQuests: string[];
  dailyQuestDate: string;
  dailyQuestWave: number;
  dailyQuestProgress: Record<string, number>;
  dailyClaimedQuests: string[];
}

export interface AppStorage {
  activePlayer: string;
  players: Record<string, PlayerProfile>;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  graphicsQuality: GraphicsQuality;
  cameraPreset: CameraPreset;
}
