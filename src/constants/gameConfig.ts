import type { Difficulty, Grade, QuizModeId, RankLabel } from '../types/game';

export const GRADES: Grade[] = [2, 3, 4];

export interface DifficultyConfig {
  id: Difficulty;
  multiplier: number;
  summary: string;
  rewardBonusLabel: string;
  xpMultiplier: number;
  timeScale: number;
  excellentMoney: number;
  excellentDiamonds: number;
  bossWeapon: string;
  victoryMessage: string;
  defeatMessage: string;
}

export interface BossSkillConfig {
  id: 'boss_meteor' | 'boss_laser' | 'boss_thunder' | 'boss_slash';
  name: string;
  description: string;
  timePenaltySeconds: number;
}

export const BOSS_SKILLS: BossSkillConfig[] = [
  {
    id: 'boss_meteor',
    name: 'Thiên Thạch Hủy Diệt',
    description: 'Triệu hồi thiên thạch lửa giáng xuống gây choáng (-2 giây).',
    timePenaltySeconds: 2,
  },
  {
    id: 'boss_laser',
    name: 'Tia Laze Hắc Ám',
    description: 'Bắn tia năng lượng đỏ rực xuyên thẳng đấu trường.',
    timePenaltySeconds: 0,
  },
  {
    id: 'boss_thunder',
    name: 'Sấm Sét Phán Quyết',
    description: 'Gọi cột sét giáng từ bầu trời làm rối loạn thời gian (-2 giây).',
    timePenaltySeconds: 2,
  },
  {
    id: 'boss_slash',
    name: 'Trảm Kích Vũ Khí',
    description: 'Vung vũ khí chém ra sóng năng lượng cực mạnh.',
    timePenaltySeconds: 0,
  },
];

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'Dễ',
    multiplier: 1,
    summary: 'Số nhỏ dễ nhẩm, phù hợp cho các bạn mới bắt đầu làm quen.',
    rewardBonusLabel: 'Thưởng chuẩn',
    xpMultiplier: 1,
    timeScale: 1,
    excellentMoney: 100,
    excellentDiamonds: 3,
    bossWeapon: 'Kiếm Ánh Sáng Lục Bảo',
    victoryMessage: 'Phong độ tuyệt vời! Bạn đã làm chủ hoàn toàn cấp độ này.',
    defeatMessage: 'Đừng nản lòng! Hãy thử lại hoặc dùng chế độ Luyện tập nhanh.',
  },
  {
    id: 'Bình thường',
    multiplier: 2,
    summary: 'Cộng trừ có nhớ và bảng nhân chia cơ bản.',
    rewardBonusLabel: '+20% XP',
    xpMultiplier: 1.2,
    timeScale: 1,
    excellentMoney: 100,
    excellentDiamonds: 3,
    bossWeapon: 'Kiếm Băng Phát Sáng',
    victoryMessage: 'Phong độ tuyệt vời! Bạn đã làm chủ hoàn toàn cấp độ này.',
    defeatMessage: 'Đừng nản lòng! Hãy thử cấp độ Dễ hơn hoặc dùng Luyện tập nhanh.',
  },
  {
    id: 'Khó',
    multiplier: 3,
    summary: 'Phạm vi số lớn hơn, kết hợp cả 4 phép tính cộng, trừ, nhân, chia.',
    rewardBonusLabel: '+50% XP',
    xpMultiplier: 1.5,
    timeScale: 1,
    excellentMoney: 120,
    excellentDiamonds: 4,
    bossWeapon: 'Kiếm Lửa Hoàng Kim',
    victoryMessage: 'Rất bản lĩnh! Bạn đã vượt qua thử thách cấp Khó.',
    defeatMessage: 'Cố thêm chút nữa! Ôn lại kiến thức trong sổ tay rồi tái đấu nhé.',
  },
  {
    id: 'Rất khó',
    multiplier: 4,
    summary: 'Thử thách tính nhanh với số nhiều chữ số và phép chia hết.',
    rewardBonusLabel: '+100% XP',
    xpMultiplier: 2,
    timeScale: 1,
    excellentMoney: 150,
    excellentDiamonds: 4,
    bossWeapon: 'Kiếm Huyết Quang',
    victoryMessage: 'Xuất sắc! Bạn đã khuất phục Thủ vệ cấp Rất khó.',
    defeatMessage: 'Cấp Rất khó đòi hỏi tính toán cẩn thận — hãy thử lại nhé!',
  },
  {
    id: 'Không thể',
    multiplier: 5,
    summary: 'Thử thách cực hạn với biểu thức nhiều bước, số lớn và phép tính tổng hợp.',
    rewardBonusLabel: '+200% XP',
    xpMultiplier: 3,
    timeScale: 1,
    excellentMoney: 200,
    excellentDiamonds: 5,
    bossWeapon: 'Huyết Kiếm Bóng Đêm',
    victoryMessage: 'Huyền thoại! Bạn đã chinh phục thành công cấp độ Không thể!',
    defeatMessage: 'Hãy giữ bình tĩnh khi tính biểu thức nhiều bước và thử lại nhé!',
  },
  {
    id: 'Không thể vượt qua',
    multiplier: 6,
    summary: 'Biểu thức nhiều tầng ngoặc, số cực lớn và thời gian làm bài giảm một nửa.',
    rewardBonusLabel: '+400% XP · Tốc độ ×2',
    xpMultiplier: 5,
    timeScale: 0.5,
    excellentMoney: 500,
    excellentDiamonds: 10,
    bossWeapon: 'Ma Kiếm Hư Không',
    victoryMessage: 'BẤT KHẢ CHIẾN BẠI! Bạn đã phá đảo cấp độ Không thể vượt qua!',
    defeatMessage: 'Đúng như tên gọi — cấp độ Không thể vượt qua vô cùng khắc nghiệt! Hãy thử lại!',
  },
  {
    id: 'Thảm họa',
    multiplier: 7,
    summary: 'Cực hạn tuyệt đối: ngoặc kép đa tầng, số siêu lớn và thời gian chỉ còn 1/3.',
    rewardBonusLabel: '+700% XP · Tốc độ ×3',
    xpMultiplier: 8,
    timeScale: 1 / 3,
    excellentMoney: 1000,
    excellentDiamonds: 20,
    bossWeapon: 'Kiếm Dung Nham Rực Cháy',
    victoryMessage: 'KỲ TÍCH THẾ KỶ! Bạn đã sống sót và chinh phục cấp độ Thảm họa!',
    defeatMessage: 'Thảm họa Toán học quá khốc liệt! Hãy rèn tốc độ tính nhẩm rồi tái đấu!',
  },
  {
    id: 'Ác mộng',
    multiplier: 8,
    summary: 'Cơn ác mộng tính nhẩm: biểu thức 4 cụm phép tính liên hoàn, thời gian siêu ngắn.',
    rewardBonusLabel: '+1.100% XP · 30% giờ',
    xpMultiplier: 12,
    timeScale: 0.3,
    excellentMoney: 1500,
    excellentDiamonds: 30,
    bossWeapon: 'Hắc Kiếm Ác Mộng',
    victoryMessage: 'BẠN ĐÃ ĐÁNH TAN CƠN ÁC MỘNG! Phản xạ toán học đáng kinh ngạc!',
    defeatMessage: 'Cơn Ác mộng quá đáng sợ! Hãy tận dụng Tia Laze để cộng thêm thời gian!',
  },
  {
    id: 'Địa ngục',
    multiplier: 9,
    summary: 'Hỏa ngục phép tính với tích lớn, phép chia phức hợp và chỉ 1/4 thời gian.',
    rewardBonusLabel: '+1.500% XP · Tốc độ ×4',
    xpMultiplier: 16,
    timeScale: 0.25,
    excellentMoney: 2200,
    excellentDiamonds: 45,
    bossWeapon: 'Hỏa Kiếm Địa Ngục',
    victoryMessage: 'CHÚA TỂ HỎA NGỤC! Bạn đã bước qua Địa ngục Toán học đầy vinh quang!',
    defeatMessage: 'Ngọn lửa Địa ngục quá dữ dội! Hãy rèn luyện thêm rồi quay lại phục thù!',
  },
  {
    id: 'Bất khả thi',
    multiplier: 10,
    summary: 'Độ khó vượt ngoài tưởng tượng với ngoặc lồng ghép và áp lực từng giây.',
    rewardBonusLabel: '+2.100% XP · 22% giờ',
    xpMultiplier: 22,
    timeScale: 0.22,
    excellentMoney: 3200,
    excellentDiamonds: 65,
    bossWeapon: 'Thiên Kiếm Băng Giá',
    victoryMessage: 'KHÔNG TƯỞNG! Bạn đã biến điều Bất khả thi thành hiện thực!',
    defeatMessage: 'Cấp độ Bất khả thi xứng danh thử thách tối thượng — đừng bỏ cuộc!',
  },
  {
    id: 'Thần thánh',
    multiplier: 11,
    summary: 'Thử thách đẳng cấp thần thoại dành cho những bộ óc tính nhẩm siêu việt.',
    rewardBonusLabel: '+2.900% XP · Tốc độ ×5',
    xpMultiplier: 30,
    timeScale: 0.2,
    excellentMoney: 4500,
    excellentDiamonds: 90,
    bossWeapon: 'Thánh Kiếm Ánh Sáng',
    victoryMessage: 'TRÍ TUỆ THẦN THÁNH! Thủ vệ ánh sáng đã cúi đầu trước bạn!',
    defeatMessage: 'Sức mạnh Thần thánh quá áp đảo! Hãy nâng cao độ chuẩn xác từng câu!',
  },
  {
    id: 'Vượt giới hạn',
    multiplier: 12,
    summary: 'Phá vỡ mọi giới hạn con người: số siêu lớn, chuỗi phép tính dày đặc.',
    rewardBonusLabel: '+3.900% XP · 18% giờ',
    xpMultiplier: 40,
    timeScale: 0.18,
    excellentMoney: 6500,
    excellentDiamonds: 130,
    bossWeapon: 'Lôi Kiếm Cực Quang',
    victoryMessage: 'ĐỘT PHÁ GIỚI HẠN! Bạn đã vượt xa ngưỡng cao thủ thông thường!',
    defeatMessage: 'Bạn đã chạm gần tới đỉnh cao Vượt giới hạn — hãy thử sức lại ngay!',
  },
  {
    id: 'Vô tận',
    multiplier: 13,
    summary: 'Đỉnh cao tối hậu của Đấu trường 3D: tốc độ ánh sáng, biểu thức vũ trụ và phần thưởng khổng lồ.',
    rewardBonusLabel: '+5.400% XP · 15% giờ',
    xpMultiplier: 55,
    timeScale: 0.15,
    excellentMoney: 10000,
    excellentDiamonds: 200,
    bossWeapon: 'Thần Kiếm Vũ Trụ',
    victoryMessage: 'HUYỀN THOẠI VÔ TẬN! Bạn chính là Đấng Tối Cao của Toán học 3D!',
    defeatMessage: 'Cấp độ Vô tận không khoan nhượng — chỉ những bậc thầy chân chính mới chinh phục được!',
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

export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
  return DIFFICULTIES.find((d) => d.id === difficulty) ?? DIFFICULTIES[0];
}

export function getQuizDurationSeconds(difficulty: Difficulty, modeId: QuizModeId): number {
  const mode = QUIZ_MODES.find((m) => m.id === modeId) ?? QUIZ_MODES[0];
  const diff = getDifficultyConfig(difficulty);
  return Math.max(45, Math.round(mode.durationMinutes * 60 * diff.timeScale));
}

export function formatTimeLimitLabel(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (secs === 0) return `${mins} phút`;
  if (mins === 0) return `${secs} giây`;
  return `${mins} phút ${secs} giây`;
}

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
  const diffConfig = getDifficultyConfig(difficulty);
  const mult = diffConfig.xpMultiplier;

  if (percentage >= 90) {
    return {
      rank: 'XUẤT SẮC',
      money: diffConfig.excellentMoney,
      diamonds: diffConfig.excellentDiamonds,
      xp: Math.round(100 * mult),
      tone: 'emerald',
      message: diffConfig.victoryMessage,
    };
  }
  if (percentage >= 60) {
    return {
      rank: 'GIỎI',
      money: Math.round(diffConfig.excellentMoney * 0.65),
      diamonds: Math.max(2, Math.round(diffConfig.excellentDiamonds * 0.6)),
      xp: Math.round(80 * mult),
      tone: 'blue',
      message: 'Kết quả rất tốt! Thêm một chút chính xác nữa sẽ đạt Xuất sắc.',
    };
  }
  if (percentage >= 40) {
    return {
      rank: 'ĐẠT',
      money: Math.round(diffConfig.excellentMoney * 0.35),
      diamonds: Math.max(1, Math.round(diffConfig.excellentDiamonds * 0.3)),
      xp: Math.round(45 * mult),
      tone: 'amber',
      message: 'Bạn đã vượt qua mức đạt. Hãy xem lại các câu sai để cải thiện điểm số.',
    };
  }
  return {
    rank: 'CẦN CỐ GẮNG HƠN',
    money: Math.max(10, Math.round(diffConfig.excellentMoney * 0.05)),
    diamonds: 0,
    xp: 0,
    tone: 'rose',
    message: diffConfig.defeatMessage,
  };
}
