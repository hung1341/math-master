import { DIFFICULTIES } from './gameConfig';
import type { Difficulty, Grade, QuizModeId } from '../types/game';

export interface MonsterQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  isDaily: boolean;
  difficulty?: Difficulty;
  minDifficultyMultiplier?: number;
  grade?: Grade;
  modeId?: QuizModeId;
  minPercentage?: number;
  requireExcellent?: boolean;
  rewardMoney: number;
  rewardDiamonds: number;
  rewardXp: number;
}

function scaleReward(base: number, wave: number, stepRate = 0.5): number {
  return Math.round(base * (1 + (wave - 1) * stepRate));
}

export function getDailyQuestsForWave(wave: number): MonsterQuest[] {
  const safeWave = Math.max(1, wave);

  if (safeWave === 1) {
    return [
      {
        id: 'daily_w1_any',
        title: 'Khởi động Đấu trường',
        description: 'Đánh bại 2 con quái vật bất kỳ trong hôm nay (đạt ≥ 40%).',
        target: 2,
        isDaily: true,
        rewardMoney: 150,
        rewardDiamonds: 2,
        rewardXp: 120,
      },
      {
        id: 'daily_w1_hard_plus',
        title: 'Thử thách Cao cấp',
        description: 'Đánh bại 1 con quái vật từ cấp Khó trở lên trong hôm nay.',
        target: 1,
        isDaily: true,
        minDifficultyMultiplier: 3,
        rewardMoney: 250,
        rewardDiamonds: 4,
        rewardXp: 220,
      },
      {
        id: 'daily_w1_excellent',
        title: 'Đòn Đánh Chí Mạng',
        description: 'Đạt hạng XUẤT SẮC (≥ 90%) trước 1 con quái vật hôm nay.',
        target: 1,
        isDaily: true,
        requireExcellent: true,
        rewardMoney: 220,
        rewardDiamonds: 3,
        rewardXp: 200,
      },
    ];
  }

  const anyTarget = 2 + safeWave;
  const dailyDiffStages: { label: Difficulty; mult: number }[] = [
    { label: 'Rất khó', mult: 4 },
    { label: 'Không thể', mult: 5 },
    { label: 'Không thể vượt qua', mult: 6 },
    { label: 'Thảm họa', mult: 7 },
    { label: 'Ác mộng', mult: 8 },
    { label: 'Địa ngục', mult: 9 },
    { label: 'Bất khả thi', mult: 10 },
    { label: 'Thần thánh', mult: 11 },
    { label: 'Vượt giới hạn', mult: 12 },
    { label: 'Vô tận', mult: 13 },
  ];
  const stage = dailyDiffStages[Math.min(dailyDiffStages.length - 1, safeWave - 2)];
  const minDiffLabel = stage.label;
  const minDiffMult = stage.mult;
  const gradeCycle: Grade = safeWave % 2 === 0 ? 4 : 3;

  return [
    {
      id: `daily_w${safeWave}_any`,
      title: `Cơn Lốc Săn Quái (Đợt ${safeWave})`,
      description: `Đánh bại ${anyTarget} con quái vật bất kỳ trong hôm nay.`,
      target: anyTarget,
      isDaily: true,
      rewardMoney: scaleReward(180, safeWave, 0.45),
      rewardDiamonds: scaleReward(3, safeWave, 0.5),
      rewardXp: scaleReward(150, safeWave, 0.45),
    },
    {
      id: `daily_w${safeWave}_boss`,
      title: `Khiêu chiến ${minDiffLabel}`,
      description: `Đánh bại ${Math.min(2, safeWave - 1)} con quái vật từ cấp ${minDiffLabel} trở lên hôm nay.`,
      target: Math.min(2, safeWave - 1),
      isDaily: true,
      minDifficultyMultiplier: minDiffMult,
      rewardMoney: scaleReward(320, safeWave, 0.55),
      rewardDiamonds: scaleReward(5, safeWave, 0.6),
      rewardXp: scaleReward(280, safeWave, 0.55),
    },
    {
      id: `daily_w${safeWave}_grade`,
      title: `Tinh thông Lớp ${gradeCycle}`,
      description: `Đánh bại 2 con quái vật ở Lớp ${gradeCycle} với xếp loại GIỎI (≥ 60%) trở lên.`,
      target: 2,
      isDaily: true,
      grade: gradeCycle,
      minPercentage: 60,
      rewardMoney: scaleReward(260, safeWave, 0.5),
      rewardDiamonds: scaleReward(4, safeWave, 0.5),
      rewardXp: scaleReward(240, safeWave, 0.5),
    },
  ];
}

export function getMonsterQuestsForWave(wave: number): MonsterQuest[] {
  const safeWave = Math.max(1, wave);
  const bump = safeWave - 1;

  const gradeCycle: Grade =
    safeWave % 3 === 1 ? 4 : safeWave % 3 === 2 ? 3 : 2;

  const masteryQuest: MonsterQuest =
    safeWave % 3 === 1
      ? {
          id: `hunt_w${safeWave}_excellent`,
          title: safeWave === 1 ? 'Tuyệt kỹ Hoàn hảo' : `Bậc thầy Hoàn hảo (Đợt ${safeWave})`,
          description: `Đạt hạng XUẤT SẮC (≥ 90%) trước ${2 + safeWave} con quái vật.`,
          target: 2 + safeWave,
          isDaily: false,
          requireExcellent: true,
          rewardMoney: scaleReward(450, safeWave),
          rewardDiamonds: scaleReward(7, safeWave),
          rewardXp: scaleReward(400, safeWave),
        }
      : safeWave % 3 === 2
        ? {
            id: `hunt_w${safeWave}_standard`,
            title: `Chinh phục Thi thử chuẩn (Đợt ${safeWave})`,
            description: `Đánh bại ${2 + bump} con quái vật ở chế độ Thi thử chuẩn (20 câu).`,
            target: 2 + bump,
            isDaily: false,
            modeId: 'standard',
            rewardMoney: scaleReward(520, safeWave),
            rewardDiamonds: scaleReward(8, safeWave),
            rewardXp: scaleReward(460, safeWave),
          }
        : {
            id: `hunt_w${safeWave}_good`,
            title: `Phong độ Đỉnh cao (Đợt ${safeWave})`,
            description: `Đánh bại ${3 + bump} con quái vật với xếp loại GIỎI (≥ 60%) trở lên.`,
            target: 3 + bump,
            isDaily: false,
            minPercentage: 60,
            rewardMoney: scaleReward(550, safeWave),
            rewardDiamonds: scaleReward(9, safeWave),
            rewardXp: scaleReward(480, safeWave),
          };

  return [
    {
      id: `hunt_w${safeWave}_easy`,
      title: safeWave === 1 ? 'Thợ săn Tập sự' : `Thợ săn Tập sự (Đợt ${safeWave})`,
      description: `Đánh bại ${2 + bump} con quái vật cấp Dễ.`,
      target: 2 + bump,
      isDaily: false,
      difficulty: 'Dễ',
      rewardMoney: scaleReward(120, safeWave),
      rewardDiamonds: scaleReward(2, safeWave),
      rewardXp: scaleReward(100, safeWave),
    },
    {
      id: `hunt_w${safeWave}_normal`,
      title: safeWave === 1 ? 'Chiến binh Can đảm' : `Chiến binh Can đảm (Đợt ${safeWave})`,
      description: `Đánh bại ${2 + bump} con quái vật cấp Bình thường.`,
      target: 2 + bump,
      isDaily: false,
      difficulty: 'Bình thường',
      rewardMoney: scaleReward(200, safeWave),
      rewardDiamonds: scaleReward(3, safeWave),
      rewardXp: scaleReward(180, safeWave),
    },
    {
      id: `hunt_w${safeWave}_hard`,
      title: safeWave === 1 ? 'Thợ săn Khắc tinh' : `Thợ săn Khắc tinh (Đợt ${safeWave})`,
      description: `Đánh bại ${2 + bump} con quái vật cấp Khó.`,
      target: 2 + bump,
      isDaily: false,
      difficulty: 'Khó',
      rewardMoney: scaleReward(350, safeWave),
      rewardDiamonds: scaleReward(5, safeWave),
      rewardXp: scaleReward(300, safeWave),
    },
    {
      id: `hunt_w${safeWave}_veryhard`,
      title: safeWave === 1 ? 'Kẻ Phá Giáp' : `Kẻ Phá Giáp (Đợt ${safeWave})`,
      description: `Đánh bại ${2 + bump} con quái vật cấp Rất khó.`,
      target: 2 + bump,
      isDaily: false,
      difficulty: 'Rất khó',
      rewardMoney: scaleReward(600, safeWave),
      rewardDiamonds: scaleReward(8, safeWave),
      rewardXp: scaleReward(500, safeWave),
    },
    {
      id: `hunt_w${safeWave}_impossible`,
      title: safeWave === 1 ? 'Chinh phục Bất khả' : `Chinh phục Bất khả (Đợt ${safeWave})`,
      description: `Đánh bại ${2 + bump} con quái vật cấp Không thể.`,
      target: 2 + bump,
      isDaily: false,
      difficulty: 'Không thể',
      rewardMoney: scaleReward(1000, safeWave),
      rewardDiamonds: scaleReward(15, safeWave),
      rewardXp: scaleReward(900, safeWave),
    },
    {
      id: `hunt_w${safeWave}_unpassable`,
      title: safeWave === 1 ? 'Vượt qua Giới hạn' : `Vượt qua Giới hạn (Đợt ${safeWave})`,
      description: `Đánh bại ${1 + bump} con quái vật cấp Không thể vượt qua.`,
      target: 1 + bump,
      isDaily: false,
      difficulty: 'Không thể vượt qua',
      rewardMoney: scaleReward(1200, safeWave),
      rewardDiamonds: scaleReward(20, safeWave),
      rewardXp: scaleReward(1200, safeWave),
    },
    {
      id: `hunt_w${safeWave}_disaster`,
      title: safeWave === 1 ? 'Kẻ Sống Sót Thảm họa' : `Kẻ Sống Sót Thảm họa (Đợt ${safeWave})`,
      description: `Đánh bại ${1 + bump} con quái vật cấp Thảm họa.`,
      target: 1 + bump,
      isDaily: false,
      difficulty: 'Thảm họa',
      rewardMoney: scaleReward(2500, safeWave),
      rewardDiamonds: scaleReward(40, safeWave),
      rewardXp: scaleReward(2500, safeWave),
    },
    {
      id: `hunt_w${safeWave}_nightmare`,
      title: safeWave === 1 ? 'Đoạn Tuyệt Ác mộng' : `Đoạn Tuyệt Ác mộng (Đợt ${safeWave})`,
      description: `Đánh bại ${1 + bump} con quái vật cấp Ác mộng.`,
      target: 1 + bump,
      isDaily: false,
      difficulty: 'Ác mộng',
      rewardMoney: scaleReward(3500, safeWave),
      rewardDiamonds: scaleReward(55, safeWave),
      rewardXp: scaleReward(3500, safeWave),
    },
    {
      id: `hunt_w${safeWave}_hell`,
      title: safeWave === 1 ? 'Chinh Phục Địa ngục' : `Chinh Phục Địa ngục (Đợt ${safeWave})`,
      description: `Đánh bại ${1 + bump} con quái vật cấp Địa ngục.`,
      target: 1 + bump,
      isDaily: false,
      difficulty: 'Địa ngục',
      rewardMoney: scaleReward(5000, safeWave),
      rewardDiamonds: scaleReward(80, safeWave),
      rewardXp: scaleReward(5000, safeWave),
    },
    {
      id: `hunt_w${safeWave}_unthinkable`,
      title: safeWave === 1 ? 'Phá Vỡ Bất khả thi' : `Phá Vỡ Bất khả thi (Đợt ${safeWave})`,
      description: `Đánh bại ${1 + bump} con quái vật cấp Bất khả thi.`,
      target: 1 + bump,
      isDaily: false,
      difficulty: 'Bất khả thi',
      rewardMoney: scaleReward(7500, safeWave),
      rewardDiamonds: scaleReward(120, safeWave),
      rewardXp: scaleReward(7500, safeWave),
    },
    {
      id: `hunt_w${safeWave}_divine`,
      title: safeWave === 1 ? 'Sức Mạnh Thần thánh' : `Sức Mạnh Thần thánh (Đợt ${safeWave})`,
      description: `Đánh bại ${1 + bump} con quái vật cấp Thần thánh.`,
      target: 1 + bump,
      isDaily: false,
      difficulty: 'Thần thánh',
      rewardMoney: scaleReward(10500, safeWave),
      rewardDiamonds: scaleReward(170, safeWave),
      rewardXp: scaleReward(10500, safeWave),
    },
    {
      id: `hunt_w${safeWave}_limitbreak`,
      title: safeWave === 1 ? 'Đột Phá Vượt giới hạn' : `Đột Phá Vượt giới hạn (Đợt ${safeWave})`,
      description: `Đánh bại ${1 + bump} con quái vật cấp Vượt giới hạn.`,
      target: 1 + bump,
      isDaily: false,
      difficulty: 'Vượt giới hạn',
      rewardMoney: scaleReward(15000, safeWave),
      rewardDiamonds: scaleReward(240, safeWave),
      rewardXp: scaleReward(15000, safeWave),
    },
    {
      id: `hunt_w${safeWave}_endless`,
      title: safeWave === 1 ? 'Đấng Tối Cao Vô tận' : `Đấng Tối Cao Vô tận (Đợt ${safeWave})`,
      description: `Đánh bại ${1 + bump} con quái vật cấp Vô tận.`,
      target: 1 + bump,
      isDaily: false,
      difficulty: 'Vô tận',
      rewardMoney: scaleReward(25000, safeWave),
      rewardDiamonds: scaleReward(400, safeWave),
      rewardXp: scaleReward(25000, safeWave),
    },
    {
      id: `hunt_w${safeWave}_grade`,
      title:
        safeWave === 1
          ? 'Học giả Toán Lớp 4'
          : `Học giả Toán Lớp ${gradeCycle} (Đợt ${safeWave})`,
      description: `Đánh bại ${3 + bump} con quái vật ở thử thách Lớp ${gradeCycle}.`,
      target: 3 + bump,
      isDaily: false,
      grade: gradeCycle,
      rewardMoney: scaleReward(450, safeWave),
      rewardDiamonds: scaleReward(6, safeWave),
      rewardXp: scaleReward(350, safeWave),
    },
    masteryQuest,
  ];
}

export function doesVictoryMatchQuest(
  quest: MonsterQuest,
  grade: Grade,
  difficulty: Difficulty,
  percentage: number,
  modeId?: QuizModeId
): boolean {
  if (percentage < 40) return false;
  if (quest.difficulty && quest.difficulty !== difficulty) return false;
  if (quest.minDifficultyMultiplier) {
    const mult = DIFFICULTIES.find((d) => d.id === difficulty)?.multiplier ?? 1;
    if (mult < quest.minDifficultyMultiplier) return false;
  }
  if (quest.grade && quest.grade !== grade) return false;
  if (quest.modeId && modeId && quest.modeId !== modeId) return false;
  if (quest.minPercentage && percentage < quest.minPercentage) return false;
  if (quest.requireExcellent && percentage < 90) return false;
  return true;
}
