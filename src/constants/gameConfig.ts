import type { Difficulty, Grade, QuizModeId, RankLabel } from '../types/game';

export const GRADES: Grade[] = [2, 3, 4];

export interface DifficultyConfig {
  id: Difficulty;
  multiplier: number;
  summary: string;
  rewardBonusLabel: string;
  xpMultiplier: number;
}

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'Dễ',
    multiplier: 1,
    summary: 'Số nhỏ dễ nhẩm, phù hợp cho các bạn mới bắt đầu làm quen.',
    rewardBonusLabel: 'Thưởng chuẩn',
    xpMultiplier: 1,
  },
  {
    id: 'Bình thường',
    multiplier: 2,
    summary: 'Cộng trừ có nhớ và bảng nhân chia cơ bản.',
    rewardBonusLabel: '+20% XP',
    xpMultiplier: 1.2,
  },
  {
    id: 'Khó',
    multiplier: 3,
    summary: 'Phạm vi số lớn hơn, kết hợp cả 4 phép tính cộng, trừ, nhân, chia.',
    rewardBonusLabel: '+50% XP',
    xpMultiplier: 1.5,
  },
  {
    id: 'Rất khó',
    multiplier: 4,
    summary: 'Thử thách tính nhanh với số nhiều chữ số và phép chia hết.',
    rewardBonusLabel: '+100% XP',
    xpMultiplier: 2,
  },
];

export interface QuizModeConfig {
  id: QuizModeId;
  label: string;
  questionCount: number;
  durationMinutes: number;
  description: string;
}

export const QUIZ_MODES: QuizModeConfig[] = [
  {
    id: 'quick',
    label: 'Luyện tập nhanh',
    questionCount: 10,
    durationMinutes: 8,
    description: '10 câu hỏi trong 8 phút để khởi động nhẹ nhàng.',
  },
  {
    id: 'standard',
    label: 'Thi thử chuẩn',
    questionCount: 20,
    durationMinutes: 15,
    description: '20 câu hỏi trong 15 phút rèn luyện toàn diện.',
  },
];

export const HINT_PRICES: number[] = [
  50, 100, 200, 400, 750,
  1200, 2000, 3500, 5000, 10000,
];

export const DAILY_HINT_LIMIT = 10;

export interface DailyRewardItem {
  day: number;
  kind: 'money' | 'diamond';
  amount: number;
  label: string;
}

export const DAILY_REWARDS: DailyRewardItem[] = [
  { day: 1, kind: 'money', amount: 50, label: '50 xu' },
  { day: 2, kind: 'money', amount: 100, label: '100 xu' },
  { day: 3, kind: 'diamond', amount: 1, label: '1 kim cương' },
  { day: 4, kind: 'money', amount: 200, label: '200 xu' },
  { day: 5, kind: 'money', amount: 250, label: '250 xu' },
  { day: 6, kind: 'diamond', amount: 2, label: '2 kim cương' },
  { day: 7, kind: 'money', amount: 400, label: '400 xu' },
];

export interface RankEvaluation {
  rank: RankLabel;
  money: number;
  diamonds: number;
  xp: number;
  tone: 'emerald' | 'blue' | 'amber' | 'rose';
  message: string;
}

export function evaluateQuizRank(percentage: number, difficulty: Difficulty): RankEvaluation {
  const diffConfig = DIFFICULTIES.find((d) => d.id === difficulty) ?? DIFFICULTIES[1];
  const mult = diffConfig.xpMultiplier;

  if (percentage >= 90) {
    return {
      rank: 'XUẤT SẮC',
      money: 100,
      diamonds: 3,
      xp: Math.round(100 * mult),
      tone: 'emerald',
      message: 'Phong độ tuyệt vời! Bạn đã làm chủ hoàn toàn cấp độ này.',
    };
  }
  if (percentage >= 60) {
    return {
      rank: 'GIỎI',
      money: 75,
      diamonds: 2,
      xp: Math.round(80 * mult),
      tone: 'blue',
      message: 'Kết quả rất tốt! Thêm một chút chính xác nữa sẽ đạt Xuất sắc.',
    };
  }
  if (percentage >= 40) {
    return {
      rank: 'ĐẠT',
      money: 50,
      diamonds: 1,
      xp: Math.round(45 * mult),
      tone: 'amber',
      message: 'Bạn đã vượt qua mức đạt. Hãy xem lại các câu sai để cải thiện điểm số.',
    };
  }
  return {
    rank: 'CẦN CỐ GẮNG HƠN',
    money: 10,
    diamonds: 0,
    xp: 0,
    tone: 'rose',
    message: 'Đừng nản lòng! Hãy thử cấp độ Dễ hơn hoặc dùng chế độ Luyện tập nhanh.',
  };
}
