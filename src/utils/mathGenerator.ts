import { DIFFICULTIES } from '../constants/gameConfig';
import type { Difficulty, Grade, MathOperation, Question } from '../types/game';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function generateDisasterQuestion(id: number, grade: Grade, op: MathOperation): Question {
  if (grade === 2) {
    if (op === '+') {
      const a = randomInt(6, 9);
      const b = randomInt(5, 10);
      const c = randomInt(6, 9);
      const d = randomInt(5, 10);
      const e = randomInt(145, 480);
      const p1 = a * b;
      const p2 = c * d;
      return {
        id,
        operation: '+',
        expression: `${a} × ${b} + ${c} × ${d} + ${e}`,
        answer: p1 + p2 + e,
        explanation: `Tính hai phép nhân trước: ${a} × ${b} = ${p1}, ${c} × ${d} = ${p2}. Tổng: ${p1} + ${p2} + ${e} = ${p1 + p2 + e}.`,
      };
    }

    if (op === '-') {
      const a = randomInt(18, 45);
      const b = randomInt(16, 39);
      const c = randomInt(4, 9);
      const d = randomInt(125, 340);
      const bracket = (a + b) * c;
      const x = bracket + d + randomInt(85, 420);
      return {
        id,
        operation: '-',
        expression: `${x} - ((${a} + ${b}) × ${c} + ${d})`,
        answer: x - (bracket + d),
        explanation: `Tính ngoặc trong trước: ${a} + ${b} = ${a + b}, nhân ${c} được ${bracket}. Ngoặc lớn: ${bracket} + ${d} = ${bracket + d}. Cuối cùng ${x} - ${bracket + d} = ${x - (bracket + d)}.`,
      };
    }

    if (op === '×') {
      const a = randomInt(25, 68);
      const b = randomInt(18, 46);
      const c = randomInt(4, 9);
      const d = randomInt(12, 35);
      const e = randomInt(3, 8);
      const p1 = (a + b) * c;
      const p2 = d * e;
      return {
        id,
        operation: '×',
        expression: `(${a} + ${b}) × ${c} + ${d} × ${e}`,
        answer: p1 + p2,
        explanation: `(${a} + ${b}) × ${c} = ${a + b} × ${c} = ${p1}; ${d} × ${e} = ${p2}. Cộng lại: ${p1} + ${p2} = ${p1 + p2}.`,
      };
    }

    const divisor = randomChoice([4, 5, 6, 8, 9]);
    const quotient = randomInt(12, 24);
    const total = divisor * quotient;
    const a = randomInt(25, total - 25);
    const b = total - a;
    const m = randomInt(5, 9);
    const k = randomInt(45, 195);
    return {
      id,
      operation: '÷',
      expression: `(${a} + ${b}) ÷ ${divisor} × ${m} + ${k}`,
      answer: quotient * m + k,
      explanation: `Trong ngoặc: ${a} + ${b} = ${total}. Chia: ${total} ÷ ${divisor} = ${quotient}. Nhân: ${quotient} × ${m} = ${quotient * m}. Cộng ${k} = ${quotient * m + k}.`,
    };
  }

  if (grade === 3) {
    if (op === '+') {
      const a = randomInt(45, 95);
      const b = randomInt(12, 26);
      const c = randomInt(38, 85);
      const d = randomInt(11, 24);
      const divisor = randomInt(6, 12);
      const quotient = randomInt(18, 55);
      const dividend = divisor * quotient;
      const p1 = a * b;
      const p2 = c * d;
      return {
        id,
        operation: '+',
        expression: `${a} × ${b} + ${c} × ${d} + ${dividend} ÷ ${divisor}`,
        answer: p1 + p2 + quotient,
        explanation: `Nhân chia trước: ${a} × ${b} = ${p1}, ${c} × ${d} = ${p2}, ${dividend} ÷ ${divisor} = ${quotient}. Tổng = ${p1 + p2 + quotient}.`,
      };
    }

    if (op === '-') {
      const a = randomInt(48, 98);
      const b = randomInt(14, 28);
      const c = randomInt(18, 42);
      const d = randomInt(8, 16);
      const bracket = a * b - c * d;
      const x = bracket + randomInt(950, 5200);
      return {
        id,
        operation: '-',
        expression: `${x} - (${a} × ${b} - ${c} × ${d})`,
        answer: x - bracket,
        explanation: `Trong ngoặc: ${a} × ${b} = ${a * b}, ${c} × ${d} = ${c * d}, hiệu = ${bracket}. Cuối cùng ${x} - ${bracket} = ${x - bracket}.`,
      };
    }

    if (op === '×') {
      const a = randomInt(25, 65);
      const b = randomInt(18, 45);
      const c = randomInt(12, 28);
      const d = randomInt(9, 19);
      const sum = a + b;
      const diff = c + d;
      return {
        id,
        operation: '×',
        expression: `(${a} + ${b}) × (${c} + ${d})`,
        answer: sum * diff,
        explanation: `Tính hai ngoặc: ${a} + ${b} = ${sum} và ${c} + ${d} = ${diff}. Tích = ${sum} × ${diff} = ${sum * diff}.`,
      };
    }

    const divisor = randomInt(8, 16);
    const quotient = randomInt(24, 75);
    const total = divisor * quotient;
    const a = randomInt(12, 24);
    const maxB = Math.max(4, Math.floor((total - 30) / a));
    const b = randomInt(4, Math.min(20, maxB));
    const c = total - a * b;
    const k = randomInt(7, 15);
    const m = randomInt(120, 480);
    return {
      id,
      operation: '÷',
      expression: `(${a} × ${b} + ${c}) ÷ ${divisor} × ${k} + ${m}`,
      answer: quotient * k + m,
      explanation: `Trong ngoặc: ${a} × ${b} + ${c} = ${total}. Chia: ${total} ÷ ${divisor} = ${quotient}. Nhân: ${quotient} × ${k} = ${quotient * k}. Cộng ${m} = ${quotient * k + m}.`,
    };
  }

  // Lớp 4 - Thảm họa
  if (op === '+') {
    const a = randomInt(145, 340);
    const b = randomInt(24, 58);
    const c = randomInt(115, 280);
    const d = randomInt(18, 46);
    const divisor = randomInt(15, 35);
    const quotient = randomInt(32, 95);
    const dividend = divisor * quotient;
    const k = randomInt(12, 28);
    const p1 = a * b;
    const p2 = c * d;
    const p3 = quotient * k;
    return {
      id,
      operation: '+',
      expression: `${a} × ${b} + ${c} × ${d} + ${dividend} ÷ ${divisor} × ${k}`,
      answer: p1 + p2 + p3,
      explanation: `Tính các cụm nhân chia: ${a}×${b}=${p1}; ${c}×${d}=${p2}; ${dividend}÷${divisor}×${k}=${p3}. Cộng lại được ${p1 + p2 + p3}.`,
    };
  }

  if (op === '-') {
    const a = randomInt(180, 360);
    const b = randomInt(24, 52);
    const c = randomInt(95, 220);
    const d = randomInt(16, 38);
    const e = randomInt(25, 65);
    const f = randomInt(14, 28);
    const left = a * b + c * d;
    const right = e * f;
    return {
      id,
      operation: '-',
      expression: `(${a} × ${b} + ${c} × ${d}) - ${e} × ${f}`,
      answer: left - right,
      explanation: `Trong ngoặc: ${a}×${b} + ${c}×${d} = ${a * b} + ${c * d} = ${left}. Trừ đi ${e}×${f} = ${right} được ${left - right}.`,
    };
  }

  if (op === '×') {
    const a = randomInt(12, 26);
    const b = randomInt(14, 28);
    const c = randomInt(11, 22);
    const d = randomInt(120, 480);
    const p = a * b * c;
    return {
      id,
      operation: '×',
      expression: `${a} × ${b} × ${c} + ${d}`,
      answer: p + d,
      explanation: `Nhân liên tiếp: ${a} × ${b} = ${a * b}, ${a * b} × ${c} = ${p}. Cộng thêm ${d} được ${p + d}.`,
    };
  }

  const divisor = randomInt(16, 38);
  const quotient = randomInt(35, 98);
  const total = divisor * quotient;
  const a = randomInt(18, 36);
  const maxB = Math.max(4, Math.floor((total - 60) / a));
  const b = randomInt(4, Math.min(34, maxB));
  const c = total - a * b;
  const k = randomInt(12, 26);
  const m = randomInt(145, 650);
  return {
    id,
    operation: '÷',
    expression: `(${a} × ${b} + ${c}) ÷ ${divisor} × ${k} - ${m}`,
    answer: quotient * k - m,
    explanation: `Trong ngoặc: ${a}×${b}+${c} = ${total}. Chia ${divisor} = ${quotient}. Nhân ${k} = ${quotient * k}. Trừ ${m} = ${quotient * k - m}.`,
  };
}

function generateEndgameQuestion(
  id: number,
  grade: Grade,
  difficulty: number,
  op: MathOperation
): Question {
  const tier = Math.max(1, difficulty - 7); // 1: Ác mộng .. 6: Vô tận

  if (grade === 2) {
    if (op === '+') {
      const a = randomInt(5 + tier, 11 + tier * 2);
      const b = randomInt(6 + tier, 12 + tier);
      const c = randomInt(4 + tier, 10 + tier * 2);
      const d = randomInt(5, 9 + tier);
      const e = randomInt(120 + tier * 55, 240 + tier * 95);
      const f = randomInt(80 + tier * 35, 190 + tier * 65);
      const p1 = a * b;
      const p2 = c * d;
      const ans = p1 + p2 + e + f;
      return {
        id,
        operation: '+',
        expression: `(${a} × ${b} + ${c} × ${d}) + ${e} + ${f}`,
        answer: ans,
        explanation: `Trong ngoặc: ${a}×${b} + ${c}×${d} = ${p1} + ${p2} = ${p1 + p2}. Cộng ${e} + ${f} = ${ans}.`,
      };
    }

    if (op === '-') {
      const a = randomInt(8 + tier * 2, 16 + tier * 3);
      const b = randomInt(5 + tier, 10 + tier * 2);
      const c = randomInt(140 + tier * 50, 280 + tier * 90);
      const left = a * b + c;
      const d = randomInt(4, 8 + tier);
      const e = randomInt(3, 7 + tier);
      const f = randomInt(25, Math.max(35, Math.floor((left - d * e) / 2)));
      const right = d * e + f;
      return {
        id,
        operation: '-',
        expression: `(${a} × ${b} + ${c}) - (${d} × ${e} + ${f})`,
        answer: left - right,
        explanation: `Ngoặc 1: ${a}×${b}+${c} = ${left}. Ngoặc 2: ${d}×${e}+${f} = ${right}. Hiệu = ${left} - ${right} = ${left - right}.`,
      };
    }

    if (op === '×') {
      const a = randomInt(12 + tier * 4, 24 + tier * 7);
      const b = randomInt(8 + tier * 2, 18 + tier * 4);
      const c = randomInt(3 + Math.floor(tier / 2), 7 + tier);
      const d = randomInt(6 + tier, 14 + tier * 2);
      const e = randomInt(4, 8 + tier);
      const sum = a + b;
      const ans = sum * c + d * e;
      return {
        id,
        operation: '×',
        expression: `(${a} + ${b}) × ${c} + ${d} × ${e}`,
        answer: ans,
        explanation: `Trong ngoặc: ${a}+${b}=${sum}. Nhân ${c} được ${sum * c}. Cộng ${d}×${e}=${d * e} được ${ans}.`,
      };
    }

    const divisor = randomInt(3 + Math.floor(tier / 2), 6 + tier);
    const quotient = randomInt(12 + tier * 4, 24 + tier * 7);
    const total = divisor * quotient;
    const a = randomInt(4, 9);
    const maxB = Math.max(2, Math.floor((total - 10) / a));
    const b = randomInt(2, Math.min(12 + tier * 2, maxB));
    const c = total - a * b;
    const k = randomInt(2 + Math.floor(tier / 2), 5 + tier);
    const m = randomInt(40 + tier * 15, 110 + tier * 35);
    return {
      id,
      operation: '÷',
      expression: `(${a} × ${b} + ${c}) ÷ ${divisor} × ${k} + ${m}`,
      answer: quotient * k + m,
      explanation: `Trong ngoặc: ${a}×${b}+${c}=${total}. Chia ${divisor} = ${quotient}. Nhân ${k} = ${quotient * k}. Cộng ${m} = ${quotient * k + m}.`,
    };
  }

  if (grade === 3) {
    if (op === '+') {
      const a = randomInt(35 + tier * 14, 75 + tier * 25);
      const b = randomInt(6 + tier, 12 + tier * 2);
      const c = randomInt(25 + tier * 10, 60 + tier * 18);
      const d = randomInt(5 + tier, 11 + tier);
      const divisor = randomInt(5 + tier, 11 + tier * 2);
      const quotient = randomInt(18 + tier * 5, 36 + tier * 9);
      const dividend = divisor * quotient;
      const k = randomInt(3 + Math.floor(tier / 2), 7 + tier);
      const p1 = a * b;
      const p2 = c * d;
      const p3 = quotient * k;
      return {
        id,
        operation: '+',
        expression: `${a} × ${b} + ${c} × ${d} + ${dividend} ÷ ${divisor} × ${k}`,
        answer: p1 + p2 + p3,
        explanation: `Tính các cụm: ${a}×${b}=${p1}; ${c}×${d}=${p2}; ${dividend}÷${divisor}×${k}=${p3}. Tổng = ${p1 + p2 + p3}.`,
      };
    }

    if (op === '-') {
      const a = randomInt(55 + tier * 18, 110 + tier * 28);
      const b = randomInt(8 + tier, 14 + tier * 2);
      const c = randomInt(180 + tier * 60, 420 + tier * 110);
      const left = a * b + c;
      const e = randomInt(16 + tier * 4, 34 + tier * 8);
      const f = randomInt(4, 9 + tier);
      const maxG = Math.max(20, Math.floor((left - e * f) * 0.55));
      const g = randomInt(15, Math.max(25, Math.min(350 + tier * 60, maxG)));
      const right = e * f + g;
      return {
        id,
        operation: '-',
        expression: `(${a} × ${b} + ${c}) - (${e} × ${f} + ${g})`,
        answer: left - right,
        explanation: `Ngoặc 1: ${a}×${b}+${c}=${left}. Ngoặc 2: ${e}×${f}+${g}=${right}. Hiệu = ${left - right}.`,
      };
    }

    if (op === '×') {
      const a = randomInt(25 + tier * 8, 55 + tier * 14);
      const b = randomInt(18 + tier * 6, 42 + tier * 10);
      const c = randomInt(4 + Math.floor(tier / 2), 8 + tier);
      const d = randomInt(45 + tier * 15, Math.max(60, (a + b) * c - 40));
      const inner = (a + b) * c - d;
      const k = randomInt(3, 6 + tier);
      const m = randomInt(80 + tier * 25, 220 + tier * 55);
      return {
        id,
        operation: '×',
        expression: `((${a} + ${b}) × ${c} - ${d}) × ${k} + ${m}`,
        answer: inner * k + m,
        explanation: `Trong ngoặc: (${a}+${b})×${c} - ${d} = ${inner}. Nhân ${k} = ${inner * k}. Cộng ${m} = ${inner * k + m}.`,
      };
    }

    const divisor = randomInt(6 + tier, 13 + tier * 2);
    const quotient = randomInt(22 + tier * 6, 48 + tier * 10);
    const total = divisor * quotient;
    const a = randomInt(8, 18 + tier * 2);
    const maxB = Math.max(3, Math.floor((total - 25) / a));
    const b = randomInt(3, Math.min(18 + tier * 2, maxB));
    const c = total - a * b;
    const m = randomInt(15 + tier * 4, 45 + tier * 10);
    const k = randomInt(4, 8 + tier);
    const n = randomInt(30, Math.max(40, Math.floor(((quotient + m) * k) / 3)));
    return {
      id,
      operation: '÷',
      expression: `((${a} × ${b} + ${c}) ÷ ${divisor} + ${m}) × ${k} - ${n}`,
      answer: (quotient + m) * k - n,
      explanation: `(${a}×${b}+${c})=${total}; chia ${divisor}=${quotient}; cộng ${m}=${quotient + m}; nhân ${k}=${(quotient + m) * k}; trừ ${n}=${(quotient + m) * k - n}.`,
    };
  }

  // Lớp 4 - Ác mộng -> Vô tận (tier 1..6)
  if (op === '+') {
    const a = randomInt(160 + tier * 35, 320 + tier * 65);
    const b = randomInt(22 + tier * 3, 46 + tier * 6);
    const c = randomInt(120 + tier * 25, 260 + tier * 55);
    const d = randomInt(16 + tier * 2, 34 + tier * 5);
    const divisor = randomInt(16 + tier * 2, 34 + tier * 4);
    const quotient = randomInt(32 + tier * 8, 85 + tier * 14);
    const dividend = divisor * quotient;
    const k = randomInt(11 + tier, 24 + tier * 3);
    const m = randomInt(240 + tier * 90, 680 + tier * 180);
    const p1 = a * b;
    const p2 = c * d;
    const p3 = quotient * k;
    return {
      id,
      operation: '+',
      expression: `${a} × ${b} + ${c} × ${d} + ${dividend} ÷ ${divisor} × ${k} + ${m}`,
      answer: p1 + p2 + p3 + m,
      explanation: `Tính các cụm: ${a}×${b}=${p1}; ${c}×${d}=${p2}; ${dividend}÷${divisor}×${k}=${p3}. Cộng với ${m} được ${p1 + p2 + p3 + m}.`,
    };
  }

  if (op === '-') {
    const a = randomInt(190 + tier * 40, 360 + tier * 70);
    const b = randomInt(24 + tier * 3, 48 + tier * 5);
    const c = randomInt(110 + tier * 25, 230 + tier * 45);
    const d = randomInt(16 + tier * 2, 34 + tier * 4);
    const left = a * b + c * d;
    const e = randomInt(30 + tier * 6, 65 + tier * 12);
    const f = randomInt(14 + tier, 28 + tier * 3);
    const g = randomInt(120 + tier * 35, 360 + tier * 80);
    const rawRight = e * f + g;
    const right = rawRight < left ? rawRight : Math.floor(left * 0.6);
    const safeG = rawRight < left ? g : Math.max(40, right - e * f);
    const actualRight = e * f + safeG;
    return {
      id,
      operation: '-',
      expression: `(${a} × ${b} + ${c} × ${d}) - (${e} × ${f} + ${safeG})`,
      answer: left - actualRight,
      explanation: `Ngoặc 1: ${a}×${b} + ${c}×${d} = ${left}. Ngoặc 2: ${e}×${f} + ${safeG} = ${actualRight}. Hiệu = ${left - actualRight}.`,
    };
  }

  if (op === '×') {
    const a = randomInt(14 + tier * 3, 24 + tier * 5);
    const b = randomInt(12 + tier * 2, 20 + tier * 4);
    const c = randomInt(50 + tier * 25, 160 + tier * 55);
    const k = randomInt(6 + tier, 12 + tier * 2);
    const m = randomInt(150 + tier * 60, 480 + tier * 140);
    const inner = a * b + c;
    return {
      id,
      operation: '×',
      expression: `(${a} × ${b} + ${c}) × ${k} + ${m}`,
      answer: inner * k + m,
      explanation: `Trong ngoặc: ${a}×${b}+${c}=${inner}. Nhân ${k} = ${inner * k}. Cộng ${m} = ${inner * k + m}.`,
    };
  }

  const divisor = randomInt(16 + tier * 3, 36 + tier * 5);
  const quotient = randomInt(36 + tier * 8, 88 + tier * 14);
  const total = divisor * quotient;
  const a = randomInt(18 + tier * 2, 34 + tier * 4);
  const maxB = Math.max(4, Math.floor((total - 60) / a));
  const b = randomInt(4, Math.min(34 + tier * 3, maxB));
  const c = total - a * b;
  const k = randomInt(11 + tier, 24 + tier * 3);
  const d = randomInt(18 + tier * 3, 36 + tier * 5);
  const e = randomInt(11 + tier, 22 + tier * 2);
  const m = randomInt(120 + tier * 40, Math.max(180, Math.floor((quotient * k + d * e) * 0.35)));
  return {
    id,
    operation: '÷',
    expression: `(${a} × ${b} + ${c}) ÷ ${divisor} × ${k} + ${d} × ${e} - ${m}`,
    answer: quotient * k + d * e - m,
    explanation: `Trong ngoặc = ${total}; chia ${divisor} = ${quotient}; ×${k} = ${quotient * k}; cộng ${d}×${e}=${d * e}; trừ ${m} = ${quotient * k + d * e - m}.`,
  };
}

function generateUnpassableQuestion(id: number, grade: Grade, op: MathOperation): Question {
  if (grade === 2) {
    if (op === '+') {
      const a = randomInt(215, 480);
      const b = randomInt(185, 390);
      const c = randomInt(145, 320);
      const d = randomInt(115, 290);
      const s1 = a + b;
      const s2 = s1 + c;
      return {
        id,
        operation: '+',
        expression: `${a} + ${b} + ${c} + ${d}`,
        answer: s2 + d,
        explanation: `Cộng lần lượt: ${a} + ${b} = ${s1}, ${s1} + ${c} = ${s2}, ${s2} + ${d} = ${s2 + d}.`,
      };
    }

    if (op === '-') {
      const a = randomInt(6, 9);
      const b = randomInt(7, 10);
      const c = randomInt(125, 340);
      const sub = a * b + c;
      const x = sub + randomInt(145, 580);
      return {
        id,
        operation: '-',
        expression: `${x} - (${a} × ${b} + ${c})`,
        answer: x - sub,
        explanation: `Tính trong ngoặc trước: ${a} × ${b} = ${a * b}, ${a * b} + ${c} = ${sub}. Sau đó ${x} - ${sub} = ${x - sub}.`,
      };
    }

    if (op === '×') {
      const a = randomInt(18, 45);
      const b = randomInt(14, 38);
      const c = randomInt(3, 9);
      const d = randomInt(25, 110);
      const sum = a + b;
      const prod = sum * c;
      return {
        id,
        operation: '×',
        expression: `(${a} + ${b}) × ${c} - ${d}`,
        answer: prod - d,
        explanation: `Tính trong ngoặc: ${a} + ${b} = ${sum}. Nhân trước: ${sum} × ${c} = ${prod}. Trừ sau: ${prod} - ${d} = ${prod - d}.`,
      };
    }

    const divisor = randomChoice([3, 4, 5, 6, 8]);
    const quotient = randomInt(8, 18);
    const dividend = divisor * quotient;
    const mult = randomInt(4, 9);
    const c = randomInt(35, 145);
    const prod = quotient * mult;
    return {
      id,
      operation: '÷',
      expression: `${dividend} ÷ ${divisor} × ${mult} + ${c}`,
      answer: prod + c,
      explanation: `Nhân chia từ trái sang phải: ${dividend} ÷ ${divisor} = ${quotient}, ${quotient} × ${mult} = ${prod}. Cộng thêm ${c} được ${prod + c}.`,
    };
  }

  if (grade === 3) {
    if (op === '+') {
      const a = randomInt(28, 75);
      const b = randomInt(6, 12);
      const c = randomInt(24, 65);
      const d = randomInt(5, 11);
      const e = randomInt(240, 980);
      const p1 = a * b;
      const p2 = c * d;
      return {
        id,
        operation: '+',
        expression: `${a} × ${b} + ${c} × ${d} + ${e}`,
        answer: p1 + p2 + e,
        explanation: `Tính hai phép nhân trước: ${a} × ${b} = ${p1} và ${c} × ${d} = ${p2}. Cộng tất cả: ${p1} + ${p2} + ${e} = ${p1 + p2 + e}.`,
      };
    }

    if (op === '-') {
      const a = randomInt(45, 95);
      const b = randomInt(7, 15);
      const divisor = randomInt(6, 12);
      const quotient = randomInt(16, 48);
      const dividend = divisor * quotient;
      const bracket = a * b + quotient;
      const x = bracket + randomInt(650, 4200);
      return {
        id,
        operation: '-',
        expression: `${x} - (${a} × ${b} + ${dividend} ÷ ${divisor})`,
        answer: x - bracket,
        explanation: `Trong ngoặc: ${a} × ${b} = ${a * b} và ${dividend} ÷ ${divisor} = ${quotient}, tổng là ${bracket}. Lấy ${x} - ${bracket} = ${x - bracket}.`,
      };
    }

    if (op === '×') {
      const a = randomInt(14, 28);
      const b = randomInt(12, 24);
      const c = randomInt(6, 14);
      const p1 = a * b;
      return {
        id,
        operation: '×',
        expression: `${a} × ${b} × ${c}`,
        answer: p1 * c,
        explanation: `Nhân lần lượt: ${a} × ${b} = ${p1}, sau đó ${p1} × ${c} = ${p1 * c}.`,
      };
    }

    const divisor = randomInt(7, 15);
    const quotient = randomInt(22, 68);
    const total = divisor * quotient;
    const a = randomInt(80, total - 80);
    const b = total - a;
    const k = randomInt(6, 14);
    const m = randomInt(125, 480);
    return {
      id,
      operation: '÷',
      expression: `(${a} + ${b}) ÷ ${divisor} × ${k} + ${m}`,
      answer: quotient * k + m,
      explanation: `Trong ngoặc: ${a} + ${b} = ${total}. Chia trước: ${total} ÷ ${divisor} = ${quotient}. Nhân: ${quotient} × ${k} = ${quotient * k}. Cộng ${m} được ${quotient * k + m}.`,
    };
  }

  // Lớp 4 - Không thể vượt qua
  if (op === '+') {
    const a = randomInt(115, 260);
    const b = randomInt(14, 36);
    const c = randomInt(48, 95);
    const d = randomInt(16, 38);
    const divisor = randomInt(12, 28);
    const quotient = randomInt(25, 85);
    const dividend = divisor * quotient;
    const p1 = a * b;
    const p2 = c * d;
    return {
      id,
      operation: '+',
      expression: `${a} × ${b} + ${c} × ${d} + ${dividend} ÷ ${divisor}`,
      answer: p1 + p2 + quotient,
      explanation: `Tính nhân chia trước: ${a} × ${b} = ${p1}, ${c} × ${d} = ${p2}, ${dividend} ÷ ${divisor} = ${quotient}. Tổng: ${p1} + ${p2} + ${quotient} = ${p1 + p2 + quotient}.`,
    };
  }

  if (op === '-') {
    const a = randomInt(135, 280);
    const b = randomInt(18, 36);
    const c = randomInt(32, 75);
    const d = randomInt(12, 24);
    const bracket = a * b - c * d;
    const x = bracket + randomInt(2400, 18500);
    return {
      id,
      operation: '-',
      expression: `${x} - (${a} × ${b} - ${c} × ${d})`,
      answer: x - bracket,
      explanation: `Trong ngoặc: ${a} × ${b} = ${a * b}, ${c} × ${d} = ${c * d}, hiệu là ${bracket}. Sau đó ${x} - ${bracket} = ${x - bracket}.`,
    };
  }

  if (op === '×') {
    const b = randomInt(145, 390);
    const a = b + randomInt(125, 360);
    const c = randomInt(18, 48);
    const d = randomInt(14, 39);
    const diff = a - b;
    const sum = c + d;
    return {
      id,
      operation: '×',
      expression: `(${a} - ${b}) × (${c} + ${d})`,
      answer: diff * sum,
      explanation: `Tính hai ngoặc: ${a} - ${b} = ${diff} và ${c} + ${d} = ${sum}. Nhân lại: ${diff} × ${sum} = ${diff * sum}.`,
    };
  }

  const divisor = randomInt(14, 34);
  const quotient = randomInt(28, 92);
  const total = divisor * quotient;
  const a = randomInt(14, 28);
  const maxB = Math.max(4, Math.floor((total - 40) / a));
  const b = randomInt(4, Math.min(28, maxB));
  const c = total - a * b;
  const k = randomInt(5, 16);
  return {
    id,
    operation: '÷',
    expression: `(${a} × ${b} + ${c}) ÷ ${divisor} × ${k}`,
    answer: quotient * k,
    explanation: `Trong ngoặc: ${a} × ${b} + ${c} = ${a * b} + ${c} = ${total}. Chia: ${total} ÷ ${divisor} = ${quotient}. Nhân: ${quotient} × ${k} = ${quotient * k}.`,
  };
}

function generateImpossibleQuestion(id: number, grade: Grade, op: MathOperation): Question {
  if (grade === 2) {
    if (op === '+') {
      const a = randomInt(145, 420);
      const b = randomInt(135, 360);
      const c = randomInt(45, 215);
      const firstSum = a + b;
      return {
        id,
        operation: '+',
        expression: `${a} + ${b} + ${c}`,
        answer: firstSum + c,
        explanation: `Tính từ trái sang phải: ${a} + ${b} = ${firstSum}, sau đó ${firstSum} + ${c} = ${firstSum + c}.`,
      };
    }

    if (op === '-') {
      const x = randomInt(520, 999);
      const y = randomInt(145, Math.floor(x * 0.55));
      const z = randomInt(45, x - y - 15);
      const firstDiff = x - y;
      return {
        id,
        operation: '-',
        expression: `${x} - ${y} - ${z}`,
        answer: firstDiff - z,
        explanation: `Tính từ trái sang phải: ${x} - ${y} = ${firstDiff}, sau đó ${firstDiff} - ${z} = ${firstDiff - z}.`,
      };
    }

    if (op === '×') {
      const a = randomInt(3, 9);
      const b = randomInt(5, 10);
      const c = randomInt(18, 95);
      const prod = a * b;
      return {
        id,
        operation: '×',
        expression: `${a} × ${b} + ${c}`,
        answer: prod + c,
        explanation: `Thực hiện phép nhân trước: ${a} × ${b} = ${prod}, rồi cộng ${c} được ${prod + c}.`,
      };
    }

    const divisor = randomChoice([2, 3, 4, 5, 6, 8]);
    const quotient = randomInt(6, 15);
    const dividend = divisor * quotient;
    const c = randomInt(15, 75);
    return {
      id,
      operation: '÷',
      expression: `${dividend} ÷ ${divisor} + ${c}`,
      answer: quotient + c,
      explanation: `Thực hiện phép chia trước: ${dividend} ÷ ${divisor} = ${quotient}, rồi cộng ${c} được ${quotient + c}.`,
    };
  }

  if (grade === 3) {
    if (op === '+') {
      const a = randomInt(1250, 4600);
      const b = randomInt(1150, 3400);
      const c = randomInt(450, 1950);
      const firstSum = a + b;
      return {
        id,
        operation: '+',
        expression: `${a} + ${b} + ${c}`,
        answer: firstSum + c,
        explanation: `Tính từ trái sang phải: ${a} + ${b} = ${firstSum}, sau đó ${firstSum} + ${c} = ${firstSum + c}.`,
      };
    }

    if (op === '-') {
      const b = randomInt(15, 45);
      const c = randomInt(4, 9);
      const prod = b * c;
      const x = prod + randomInt(350, 2800);
      return {
        id,
        operation: '-',
        expression: `${x} - ${b} × ${c}`,
        answer: x - prod,
        explanation: `Thực hiện phép nhân trước: ${b} × ${c} = ${prod}, sau đó lấy ${x} - ${prod} = ${x - prod}.`,
      };
    }

    if (op === '×') {
      if (Math.random() < 0.5) {
        const a = randomInt(14, 38);
        const b = randomInt(12, 29);
        return {
          id,
          operation: '×',
          expression: `${a} × ${b}`,
          answer: a * b,
          explanation: `Đặt tính nhân hai chữ số: ${a} × ${b} = ${a * b}.`,
        };
      }
      const a = randomInt(25, 85);
      const b = randomInt(4, 9);
      const c = randomInt(65, 320);
      const prod = a * b;
      return {
        id,
        operation: '×',
        expression: `${a} × ${b} + ${c}`,
        answer: prod + c,
        explanation: `Thực hiện phép nhân trước: ${a} × ${b} = ${prod}, rồi cộng ${c} được ${prod + c}.`,
      };
    }

    const divisor = randomInt(6, 12);
    const quotient = randomInt(18, 75);
    const dividend = divisor * quotient;
    const mult = randomInt(2, 6);
    return {
      id,
      operation: '÷',
      expression: `${dividend} ÷ ${divisor} × ${mult}`,
      answer: quotient * mult,
      explanation: `Thực hiện từ trái sang phải: ${dividend} ÷ ${divisor} = ${quotient}, sau đó ${quotient} × ${mult} = ${quotient * mult}.`,
    };
  }

  // Lớp 4 - Không thể
  if (op === '+') {
    const a = randomInt(2500, 18000);
    const b = randomInt(24, 78);
    const c = randomInt(12, 34);
    const prod = b * c;
    return {
      id,
      operation: '+',
      expression: `${a} + ${b} × ${c}`,
      answer: a + prod,
      explanation: `Thực hiện phép nhân trước: ${b} × ${c} = ${prod}, rồi lấy ${a} + ${prod} = ${a + prod}.`,
    };
  }

  if (op === '-') {
    const b = randomInt(25, 75);
    const c = randomInt(12, 36);
    const prod = b * c;
    const x = prod + randomInt(850, 12500);
    return {
      id,
      operation: '-',
      expression: `${x} - ${b} × ${c}`,
      answer: x - prod,
      explanation: `Thực hiện phép nhân trước: ${b} × ${c} = ${prod}, sau đó lấy ${x} - ${prod} = ${x - prod}.`,
    };
  }

  if (op === '×') {
    if (Math.random() < 0.5) {
      const a = randomInt(112, 389);
      const b = randomInt(14, 48);
      return {
        id,
        operation: '×',
        expression: `${a} × ${b}`,
        answer: a * b,
        explanation: `Đặt tính rồi tính: ${a} × ${b} = ${a * b}.`,
      };
    }
    const a = randomInt(18, 48);
    const b = randomInt(12, 26);
    const c = randomInt(14, 38);
    const d = randomInt(11, 24);
    const p1 = a * b;
    const p2 = c * d;
    return {
      id,
      operation: '×',
      expression: `${a} × ${b} + ${c} × ${d}`,
      answer: p1 + p2,
      explanation: `Tính hai phép nhân trước: ${a} × ${b} = ${p1} và ${c} × ${d} = ${p2}, rồi cộng lại: ${p1} + ${p2} = ${p1 + p2}.`,
    };
  }

  const divisor = randomInt(12, 35);
  const quotient = randomInt(22, 95);
  const dividend = divisor * quotient;
  const k = randomInt(3, 12);
  return {
    id,
    operation: '÷',
    expression: `${dividend} ÷ ${divisor} × ${k}`,
    answer: quotient * k,
    explanation: `Thực hiện từ trái sang phải: ${dividend} ÷ ${divisor} = ${quotient}, sau đó ${quotient} × ${k} = ${quotient * k}.`,
  };
}

function generateGrade4CurriculumQuestion(id: number, difficulty: number): Question {
  const easyTopics = ['place_value', 'expr_letter', 'units_mass', 'units_time', 'divisible_2_5', 'average_basic'] as const;
  const midTopics = ['expr_letters_multi', 'quick_calc', 'divisible_3_9', 'sum_diff', 'fraction_of_num', 'seq_count', 'map_scale'] as const;
  const hardTopics = ['seq_sum', 'find_num_from_fraction', 'sum_ratio', 'diff_ratio', 'map_scale_reverse', 'divisible_3_9', 'quick_calc'] as const;

  const pool =
    difficulty <= 2
      ? [...easyTopics]
      : difficulty <= 4
        ? [...midTopics, ...easyTopics.slice(0, 3)]
        : [...hardTopics, ...midTopics.slice(0, 3)];

  const topic = randomChoice(pool);

  if (topic === 'place_value') {
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const picked: number[] = [];
    for (let i = 0; i < 6; i++) {
      const idx = randomInt(0, digits.length - 1);
      picked.push(digits[idx]);
      digits.splice(idx, 1);
    }
    const numberStr = `${picked[0]}${picked[1]}${picked[2]} ${picked[3]}${picked[4]}${picked[5]}`;
    const places = [
      { idx: 0, label: 'hàng trăm nghìn', mult: 100000 },
      { idx: 1, label: 'hàng chục nghìn', mult: 10000 },
      { idx: 2, label: 'hàng nghìn', mult: 1000 },
      { idx: 3, label: 'hàng trăm', mult: 100 },
      { idx: 4, label: 'hàng chục', mult: 10 },
    ];
    const chosen = randomChoice(places);
    const digit = picked[chosen.idx];
    const value = digit * chosen.mult;
    return {
      id,
      operation: '+',
      topic: 'Hàng và lớp',
      expression: `Giá trị chữ số ${digit} trong ${numberStr}`,
      prompt: `Trong số ${numberStr}, chữ số ${digit} có giá trị là bao nhiêu?`,
      answer: value,
      explanation: `Chữ số ${digit} đứng ở ${chosen.label} (thuộc ${chosen.idx < 3 ? 'lớp nghìn' : 'lớp đơn vị'}) nên có giá trị là ${value.toLocaleString('vi-VN')}.`,
    };
  }

  if (topic === 'expr_letter') {
    const a = randomInt(4, 25);
    const k = randomInt(2, 9);
    const c = randomInt(12, 85);
    const ans = c + k * a;
    return {
      id,
      operation: '+',
      topic: 'Biểu thức chứa chữ',
      expression: `${c} + ${k} × a (a = ${a})`,
      prompt: `Tính giá trị biểu thức ${c} + ${k} × a khi a = ${a}`,
      answer: ans,
      explanation: `Thay a = ${a}: ${c} + ${k} × ${a} = ${c} + ${k * a} = ${ans}.`,
    };
  }

  if (topic === 'expr_letters_multi') {
    const a = randomInt(12, 48);
    const b = randomInt(8, 36);
    const c = randomInt(3, 12);
    const ans = (a + b) * c;
    return {
      id,
      operation: '×',
      topic: 'Biểu thức chứa ba chữ',
      expression: `(a + b) × c (a=${a}, b=${b}, c=${c})`,
      prompt: `Tính giá trị biểu thức (a + b) × c với a = ${a}, b = ${b}, c = ${c}`,
      answer: ans,
      explanation: `Thay số vào biểu thức: (${a} + ${b}) × ${c} = ${a + b} × ${c} = ${ans}.`,
    };
  }

  if (topic === 'quick_calc') {
    if (Math.random() < 0.5) {
      const a = randomInt(14, 75);
      const b = randomInt(18, 82);
      const c = 100 - b;
      return {
        id,
        operation: '×',
        topic: 'Tính chất phân phối',
        expression: `${a} × ${b} + ${a} × ${c}`,
        prompt: `Tính nhanh: ${a} × ${b} + ${a} × ${c} = ?`,
        answer: a * 100,
        explanation: `Áp dụng tính chất phân phối: ${a} × (${b} + ${c}) = ${a} × 100 = ${a * 100}.`,
      };
    }
    const useEight = Math.random() < 0.5;
    const first = useEight ? 8 : 4;
    const third = useEight ? 125 : 25;
    const mid = randomInt(13, 89);
    const baseProd = first * third;
    return {
      id,
      operation: '×',
      topic: 'Tính chất kết hợp',
      expression: `${first} × ${mid} × ${third}`,
      prompt: `Tính nhanh: ${first} × ${mid} × ${third} = ?`,
      answer: mid * baseProd,
      explanation: `Nhóm (${first} × ${third}) × ${mid} = ${baseProd} × ${mid} = ${mid * baseProd}.`,
    };
  }

  if (topic === 'units_mass') {
    const mode = randomInt(0, 2);
    if (mode === 0) {
      const tan = randomInt(2, 12);
      const kg = randomInt(15, 450);
      const ans = tan * 1000 + kg;
      return {
        id,
        operation: '+',
        topic: 'Đơn vị đo khối lượng',
        expression: `${tan} tấn ${kg} kg = ? kg`,
        prompt: `Đổi đơn vị: ${tan} tấn ${kg} kg = ? kg`,
        unit: 'kg',
        answer: ans,
        explanation: `Vì 1 tấn = 1 000 kg nên ${tan} tấn ${kg} kg = ${tan * 1000} + ${kg} = ${ans} kg.`,
      };
    }
    if (mode === 1) {
      const ta = randomInt(3, 18);
      const yen = randomInt(2, 9);
      const ans = ta * 100 + yen * 10;
      return {
        id,
        operation: '+',
        topic: 'Đơn vị đo khối lượng',
        expression: `${ta} tạ ${yen} yến = ? kg`,
        prompt: `Đổi đơn vị: ${ta} tạ ${yen} yến = ? kg`,
        unit: 'kg',
        answer: ans,
        explanation: `1 tạ = 100 kg và 1 yến = 10 kg, nên ${ta} tạ ${yen} yến = ${ta * 100} + ${yen * 10} = ${ans} kg.`,
      };
    }
    const kg = randomInt(2, 15);
    const g = randomInt(25, 850);
    const ans = kg * 1000 + g;
    return {
      id,
      operation: '+',
      topic: 'Đơn vị đo khối lượng',
      expression: `${kg} kg ${g} g = ? g`,
      prompt: `Đổi đơn vị: ${kg} kg ${g} g = ? g`,
      unit: 'g',
      answer: ans,
      explanation: `1 kg = 1 000 g nên ${kg} kg ${g} g = ${kg * 1000} + ${g} = ${ans} g.`,
    };
  }

  if (topic === 'units_time') {
    if (Math.random() < 0.5) {
      const mins = randomInt(2, 15);
      const secs = randomInt(5, 55);
      const ans = mins * 60 + secs;
      return {
        id,
        operation: '+',
        topic: 'Đơn vị thời gian (Giây)',
        expression: `${mins} phút ${secs} giây = ? giây`,
        prompt: `Đổi đơn vị: ${mins} phút ${secs} giây = ? giây`,
        unit: 'giây',
        answer: ans,
        explanation: `1 phút = 60 giây, nên ${mins} phút ${secs} giây = ${mins * 60} + ${secs} = ${ans} giây.`,
      };
    }
    const century = randomInt(10, 21);
    const year = (century - 1) * 100 + randomInt(5, 95);
    return {
      id,
      operation: '÷',
      topic: 'Thế kỉ',
      expression: `Năm ${year} thuộc thế kỉ nào?`,
      prompt: `Năm ${year} thuộc thế kỉ thứ mấy? (nhập số tự nhiên)`,
      unit: 'thế kỉ',
      answer: century,
      explanation: `Từ năm ${(century - 1) * 100 + 1} đến năm ${century * 100} là thế kỉ ${century}.`,
    };
  }

  if (topic === 'divisible_2_5') {
    const prefix = randomInt(12, 98);
    return {
      id,
      operation: '÷',
      topic: 'Dấu hiệu chia hết',
      expression: `${prefix}x chia hết cho cả 2 và 5`,
      prompt: `Tìm chữ số x (0 → 9) để số ${prefix}x chia hết cho cả 2 và 5.`,
      answer: 0,
      explanation: `Số vừa chia hết cho 2 vừa chia hết cho 5 thì chữ số tận cùng phải là 0, nên x = 0.`,
    };
  }

  if (topic === 'divisible_3_9') {
    let a = randomInt(1, 8);
    let b = randomInt(1, 8);
    if ((a + b) % 9 === 0) {
      b = b < 8 ? b + 1 : b - 1;
    }
    const x = 9 - ((a + b) % 9);
    return {
      id,
      operation: '÷',
      topic: 'Dấu hiệu chia hết cho 9',
      expression: `${a}x${b} chia hết cho 9`,
      prompt: `Tìm chữ số x (0 → 9) để số ${a}x${b} chia hết cho 9.`,
      answer: x,
      explanation: `Tổng các chữ số là ${a} + x + ${b} = ${a + b} + x. Để chia hết cho 9 thì x = ${x} (tổng bằng ${a + b + x}).`,
    };
  }

  if (topic === 'average_basic') {
    const avg = randomInt(18, 95);
    const d1 = randomInt(2, 12);
    const d2 = randomInt(2, 10);
    const n1 = avg + d1;
    const n2 = avg + d2;
    const n3 = avg - d1 - d2;
    if (n3 > 0) {
      return {
        id,
        operation: '÷',
        topic: 'Trung bình cộng',
        expression: `TBC(${n1}, ${n2}, ${n3})`,
        prompt: `Tìm số trung bình cộng của ba số: ${n1}, ${n2} và ${n3}.`,
        answer: avg,
        explanation: `Tổng ba số là ${n1} + ${n2} + ${n3} = ${avg * 3}. Trung bình cộng là ${avg * 3} : 3 = ${avg}.`,
      };
    }
    const start = randomInt(2, 15) * 5;
    const end = start + 5 * randomInt(4, 16) * 2;
    const ans = (start + end) / 2;
    return {
      id,
      operation: '÷',
      topic: 'Trung bình cộng dãy cách đều',
      expression: `TBC dãy ${start}, ${start + 5}, ..., ${end}`,
      prompt: `Tìm trung bình cộng của dãy số cách đều: ${start}, ${start + 5}, ..., ${end}.`,
      answer: ans,
      explanation: `Với dãy cách đều, trung bình cộng = (Số đầu + Số cuối) : 2 = (${start} + ${end}) : 2 = ${ans}.`,
    };
  }

  if (topic === 'sum_diff') {
    const small = randomInt(15, 160);
    const diff = randomInt(8, 70);
    const big = small + diff;
    const sum = big + small;
    const askBig = Math.random() < 0.5;
    return {
      id,
      operation: askBig ? '+' : '-',
      topic: 'Tổng và Hiệu',
      expression: `Tổng = ${sum}, Hiệu = ${diff} (${askBig ? 'số lớn' : 'số bé'})`,
      prompt: `Tổng của hai số là ${sum}, hiệu của hai số là ${diff}. Tìm ${askBig ? 'số lớn' : 'số bé'}.`,
      answer: askBig ? big : small,
      explanation: askBig
        ? `Số lớn = (Tổng + Hiệu) : 2 = (${sum} + ${diff}) : 2 = ${big}.`
        : `Số bé = (Tổng - Hiệu) : 2 = (${sum} - ${diff}) : 2 = ${small}.`,
    };
  }

  if (topic === 'seq_count') {
    const start = randomInt(1, 15);
    const step = randomInt(2, 6);
    const count = randomInt(12, 38);
    const end = start + step * (count - 1);
    return {
      id,
      operation: '÷',
      topic: 'Dãy số cách đều',
      expression: `Số số hạng: ${start}, ${start + step}, ..., ${end}`,
      prompt: `Tìm số số hạng của dãy số cách đều: ${start}, ${start + step}, ${start + 2 * step}, ..., ${end}.`,
      unit: 'số hạng',
      answer: count,
      explanation: `Số số hạng = (${end} - ${start}) : ${step} + 1 = ${count} (số hạng).`,
    };
  }

  if (topic === 'seq_sum') {
    const start = randomInt(1, 10);
    const step = randomInt(2, 5);
    const count = randomInt(10, 28);
    const end = start + step * (count - 1);
    const sum = ((start + end) * count) / 2;
    return {
      id,
      operation: '×',
      topic: 'Tổng dãy số cách đều',
      expression: `${start} + ${start + step} + ... + ${end}`,
      prompt: `Tính tổng dãy số cách đều: ${start}, ${start + step}, ${start + 2 * step}, ..., ${end}.`,
      answer: sum,
      explanation: `Số số hạng là (${end} - ${start}) : ${step} + 1 = ${count}. Tổng = (${start} + ${end}) × ${count} : 2 = ${sum}.`,
    };
  }

  if (topic === 'fraction_of_num') {
    const den = randomChoice([3, 4, 5, 6, 7, 8, 9]);
    const num = randomInt(2, den - 1);
    const k = randomInt(5, 28);
    const total = den * k;
    const ans = num * k;
    return {
      id,
      operation: '×',
      topic: 'Phân số',
      expression: `${num}/${den} của ${total}`,
      prompt: `Tìm giá trị của ${num}/${den} số ${total}.`,
      answer: ans,
      explanation: `Lấy ${total} : ${den} × ${num} = ${k} × ${num} = ${ans}.`,
    };
  }

  if (topic === 'find_num_from_fraction') {
    const den = randomChoice([4, 5, 6, 7, 8, 9]);
    const num = randomInt(2, den - 1);
    const k = randomInt(4, 22);
    const partVal = num * k;
    const total = den * k;
    return {
      id,
      operation: '÷',
      topic: 'Phân số',
      expression: `${num}/${den} số đó là ${partVal}`,
      prompt: `Biết ${num}/${den} số học sinh của đội là ${partVal} bạn. Hỏi đội có tất cả bao nhiêu bạn?`,
      unit: 'bạn',
      answer: total,
      explanation: `Tổng số bạn của đội là ${partVal} : ${num} × ${den} = ${k} × ${den} = ${total} bạn.`,
    };
  }

  if (topic === 'sum_ratio') {
    const ratios: [number, number][] = [
      [2, 3],
      [3, 4],
      [3, 5],
      [2, 5],
      [4, 5],
      [3, 7],
    ];
    const [p1, p2] = randomChoice(ratios);
    const unitVal = randomInt(6, 26);
    const total = (p1 + p2) * unitVal;
    const askBig = Math.random() < 0.5;
    const ans = (askBig ? p2 : p1) * unitVal;
    return {
      id,
      operation: '÷',
      topic: 'Tìm hai số (Tổng – Tỉ)',
      expression: `Tổng=${total}, tỉ số ${p1}/${p2}`,
      prompt: `Tổng của hai số là ${total}, tỉ số của số bé và số lớn là ${p1}/${p2}. Tìm ${askBig ? 'số lớn' : 'số bé'}.`,
      answer: ans,
      explanation: `Tổng số phần: ${p1} + ${p2} = ${p1 + p2}. Giá trị 1 phần: ${total} : ${p1 + p2} = ${unitVal}. ${askBig ? 'Số lớn' : 'Số bé'} = ${unitVal} × ${askBig ? p2 : p1} = ${ans}.`,
    };
  }

  if (topic === 'diff_ratio') {
    const ratios: [number, number][] = [
      [2, 3],
      [3, 5],
      [2, 5],
      [3, 7],
      [4, 7],
    ];
    const [p1, p2] = randomChoice(ratios);
    const unitVal = randomInt(6, 24);
    const diff = (p2 - p1) * unitVal;
    const askBig = Math.random() < 0.5;
    const ans = (askBig ? p2 : p1) * unitVal;
    return {
      id,
      operation: '÷',
      topic: 'Tìm hai số (Hiệu – Tỉ)',
      expression: `Hiệu=${diff}, tỉ số ${p2}/${p1}`,
      prompt: `Hiệu của hai số là ${diff}, tỉ số giữa số lớn và số bé là ${p2}/${p1}. Tìm ${askBig ? 'số lớn' : 'số bé'}.`,
      answer: ans,
      explanation: `Hiệu số phần: ${p2} - ${p1} = ${p2 - p1}. Giá trị 1 phần: ${diff} : ${p2 - p1} = ${unitVal}. ${askBig ? 'Số lớn' : 'Số bé'} = ${unitVal} × ${askBig ? p2 : p1} = ${ans}.`,
    };
  }

  if (topic === 'map_scale') {
    const cm = randomInt(3, 28);
    const km = cm * 10;
    return {
      id,
      operation: '×',
      topic: 'Tỉ lệ bản đồ',
      expression: `Bản đồ 1:1.000.000, dài ${cm} cm → ? km`,
      prompt: `Trên bản đồ tỉ lệ 1 : 1 000 000, quãng đường đo được dài ${cm} cm. Độ dài thật là bao nhiêu km?`,
      unit: 'km',
      answer: km,
      explanation: `Độ dài thật = ${cm} × 1 000 000 = ${(cm * 1000000).toLocaleString('vi-VN')} cm = ${km} km.`,
    };
  }

  // map_scale_reverse
  const km = randomInt(12, 95);
  return {
    id,
    operation: '÷',
    topic: 'Tỉ lệ bản đồ',
    expression: `Thật ${km} km, tỉ lệ 1:1.000.000 → ? mm`,
    prompt: `Quãng đường thật dài ${km} km. Trên bản đồ tỉ lệ 1 : 1 000 000, quãng đường đó dài bao nhiêu mi-li-mét?`,
    unit: 'mm',
    answer: km,
    explanation: `Đổi ${km} km = ${(km * 1000000).toLocaleString('vi-VN')} mm. Chia cho 1 000 000 được ${km} mm.`,
  };
}

function generateGrade3CurriculumQuestion(id: number, difficulty: number): Question {
  const easyTopics = ['roman', 'rounding', 'find_x', 'units_g3', 'scale_compare', 'midpoint_circle'] as const;
  const midTopics = ['find_x', 'remainder', 'unit_method', 'rect_perimeter', 'rect_area', 'square_basic', 'units_g3'] as const;
  const hardTopics = ['remainder', 'unit_method', 'square_from_perimeter', 'rect_area', 'find_x_remainder', 'scale_compare'] as const;

  const pool =
    difficulty <= 2
      ? [...easyTopics]
      : difficulty <= 4
        ? [...midTopics, ...easyTopics.slice(0, 3)]
        : [...hardTopics, ...midTopics.slice(0, 3)];

  const topic = randomChoice(pool);

  if (topic === 'roman') {
    const numerals: [string, number][] = [
      ['IV', 4],
      ['VI', 6],
      ['VII', 7],
      ['VIII', 8],
      ['IX', 9],
      ['XI', 11],
      ['XII', 12],
      ['XIV', 14],
      ['XV', 15],
      ['XVI', 16],
      ['XVII', 17],
      ['XVIII', 18],
      ['XIX', 19],
      ['XX', 20],
    ];
    const [roman, val] = randomChoice(numerals);
    return {
      id,
      operation: '+',
      topic: 'Số La Mã',
      expression: `Số La Mã ${roman}`,
      prompt: `Chữ số La Mã ${roman} tương ứng với số tự nhiên nào?`,
      answer: val,
      explanation: `Với I = 1, V = 5, X = 10 thì ${roman} có giá trị là ${val}.`,
    };
  }

  if (topic === 'rounding') {
    const base = randomInt(12, 88) * 100;
    const tens = randomChoice([1, 2, 3, 4, 6, 7, 8, 9]);
    const ones = randomInt(1, 9);
    const num = base + tens * 10 + ones;
    const rounded = tens >= 5 ? base + 100 : base;
    return {
      id,
      operation: '+',
      topic: 'Làm tròn số',
      expression: `Làm tròn ${num} đến hàng trăm`,
      prompt: `Làm tròn số ${num.toLocaleString('vi-VN')} đến hàng trăm được số nào?`,
      answer: rounded,
      explanation: `Chữ số hàng chục là ${tens} (${tens >= 5 ? '≥ 5 nên làm tròn lên' : '< 5 nên giữ nguyên hàng trăm'}), kết quả là ${rounded.toLocaleString('vi-VN')}.`,
    };
  }

  if (topic === 'find_x') {
    const variant = randomInt(0, 2);
    if (variant === 0) {
      const x = randomInt(25, 250);
      const a = randomInt(35, 190);
      const sum = x + a;
      return {
        id,
        operation: '-',
        topic: 'Tìm thành phần chưa biết',
        expression: `x + ${a} = ${sum}`,
        prompt: `Tìm x biết: x + ${a} = ${sum}`,
        answer: x,
        explanation: `Muốn tìm số hạng chưa biết, lấy tổng trừ số hạng đã biết: x = ${sum} - ${a} = ${x}.`,
      };
    }
    if (variant === 1) {
      const b = randomInt(40, 220);
      const x = randomInt(25, 180);
      const a = b + x;
      return {
        id,
        operation: '-',
        topic: 'Tìm thành phần chưa biết',
        expression: `${a} - x = ${b}`,
        prompt: `Tìm x biết: ${a} - x = ${b}`,
        answer: x,
        explanation: `Muốn tìm số trừ, lấy số bị trừ trừ đi hiệu: x = ${a} - ${b} = ${x}.`,
      };
    }
    const k = randomInt(3, 9);
    const x = randomInt(12, 45);
    const prod = k * x;
    return {
      id,
      operation: '÷',
      topic: 'Tìm thành phần chưa biết',
      expression: `x × ${k} = ${prod}`,
      prompt: `Tìm x biết: x × ${k} = ${prod}`,
      answer: x,
      explanation: `Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số đã biết: x = ${prod} : ${k} = ${x}.`,
    };
  }

  if (topic === 'find_x_remainder') {
    const divisor = randomInt(4, 9);
    const quotient = randomInt(14, 48);
    const rem = randomInt(1, divisor - 1);
    const dividend = divisor * quotient + rem;
    return {
      id,
      operation: '×',
      topic: 'Tìm số bị chia (chia có dư)',
      expression: `x : ${divisor} = ${quotient} (dư ${rem})`,
      prompt: `Tìm số bị chia x biết: x : ${divisor} = ${quotient} (dư ${rem}).`,
      answer: dividend,
      explanation: `Số bị chia = Thương × Số chia + Số dư = ${quotient} × ${divisor} + ${rem} = ${quotient * divisor} + ${rem} = ${dividend}.`,
    };
  }

  if (topic === 'scale_compare') {
    if (Math.random() < 0.5) {
      const small = randomInt(4, 15);
      const times = randomInt(3, 12);
      const big = small * times;
      return {
        id,
        operation: '÷',
        topic: 'So sánh số lớn gấp mấy lần số bé',
        expression: `${big} gấp mấy lần ${small}?`,
        prompt: `Số lớn là ${big}, số bé là ${small}. Hỏi số lớn gấp mấy lần số bé?`,
        unit: 'lần',
        answer: times,
        explanation: `Lấy số lớn chia cho số bé: ${big} : ${small} = ${times} (lần).`,
      };
    }
    const a = randomInt(12, 45);
    const n = randomInt(3, 9);
    const add = randomInt(10, 65);
    const ans = a * n + add;
    return {
      id,
      operation: '×',
      topic: 'Gấp một số lên nhiều lần',
      expression: `Gấp ${a} lên ${n} lần rồi cộng ${add}`,
      prompt: `Gấp số ${a} lên ${n} lần rồi cộng thêm ${add} thì được kết quả bằng bao nhiêu?`,
      answer: ans,
      explanation: `Gấp ${a} lên ${n} lần được ${a} × ${n} = ${a * n}. Cộng thêm ${add} được ${ans}.`,
    };
  }

  if (topic === 'remainder') {
    if (Math.random() < 0.5) {
      const divisor = randomInt(4, 9);
      return {
        id,
        operation: '-',
        topic: 'Phép chia có dư',
        expression: `Số dư lớn nhất khi chia cho ${divisor}`,
        prompt: `Trong một phép chia cho ${divisor}, số dư lớn nhất có thể là bao nhiêu?`,
        answer: divisor - 1,
        explanation: `Số dư luôn bé hơn số chia nên số dư lớn nhất khi chia cho ${divisor} là ${divisor} - 1 = ${divisor - 1}.`,
      };
    }
    const divisor = randomInt(5, 9);
    const quotient = randomInt(12, 35);
    const rem = randomInt(1, divisor - 1);
    const ans = divisor * quotient + rem;
    return {
      id,
      operation: '×',
      topic: 'Phép chia có dư',
      expression: `SBC biết SC=${divisor}, T=${quotient}, dư ${rem}`,
      prompt: `Một phép chia có số chia là ${divisor}, thương là ${quotient} và số dư là ${rem}. Tìm số bị chia.`,
      answer: ans,
      explanation: `Số bị chia = ${quotient} × ${divisor} + ${rem} = ${quotient * divisor} + ${rem} = ${ans}.`,
    };
  }

  if (topic === 'unit_method') {
    const groups1 = randomInt(3, 8);
    const perGroup = randomInt(6, 24);
    const total1 = groups1 * perGroup;
    let groups2 = randomInt(4, 12);
    if (groups2 === groups1) groups2 += 2;
    const ans = perGroup * groups2;
    return {
      id,
      operation: '÷',
      topic: 'Bài toán rút về đơn vị',
      expression: `${groups1} hộp có ${total1} viên → ${groups2} hộp?`,
      prompt: `Có ${groups1} hộp kẹo như nhau đựng tất cả ${total1} viên kẹo. Hỏi ${groups2} hộp như thế có bao nhiêu viên kẹo?`,
      unit: 'viên',
      answer: ans,
      explanation: `1 hộp có: ${total1} : ${groups1} = ${perGroup} (viên). ${groups2} hộp có: ${perGroup} × ${groups2} = ${ans} (viên).`,
    };
  }

  if (topic === 'units_g3') {
    const mode = randomInt(0, 3);
    if (mode === 0) {
      const m = randomInt(2, 15);
      const cm = randomInt(5, 95);
      return {
        id,
        operation: '+',
        topic: 'Đơn vị đo độ dài',
        expression: `${m} m ${cm} cm = ? cm`,
        prompt: `Đổi đơn vị: ${m} m ${cm} cm = ? cm`,
        unit: 'cm',
        answer: m * 100 + cm,
        explanation: `1 m = 100 cm nên ${m} m ${cm} cm = ${m * 100} + ${cm} = ${m * 100 + cm} cm.`,
      };
    }
    if (mode === 1) {
      const km = randomInt(2, 9);
      const m = randomInt(35, 850);
      return {
        id,
        operation: '+',
        topic: 'Đơn vị đo độ dài',
        expression: `${km} km ${m} m = ? m`,
        prompt: `Đổi đơn vị: ${km} km ${m} m = ? m`,
        unit: 'm',
        answer: km * 1000 + m,
        explanation: `1 km = 1 000 m nên ${km} km ${m} m = ${km * 1000} + ${m} = ${km * 1000 + m} m.`,
      };
    }
    if (mode === 2) {
      const lit = randomInt(2, 9);
      const ml = randomInt(50, 750);
      return {
        id,
        operation: '+',
        topic: 'Đơn vị dung tích',
        expression: `${lit} lít ${ml} ml = ? ml`,
        prompt: `Đổi đơn vị: ${lit} lít ${ml} ml = ? ml`,
        unit: 'ml',
        answer: lit * 1000 + ml,
        explanation: `1 lít = 1 000 ml nên ${lit} lít ${ml} ml = ${lit * 1000} + ${ml} = ${lit * 1000 + ml} ml.`,
      };
    }
    const hrs = randomInt(2, 8);
    const mins = randomInt(10, 55);
    return {
      id,
      operation: '+',
      topic: 'Đơn vị thời gian',
      expression: `${hrs} giờ ${mins} phút = ? phút`,
      prompt: `Đổi đơn vị: ${hrs} giờ ${mins} phút = ? phút`,
      unit: 'phút',
      answer: hrs * 60 + mins,
      explanation: `1 giờ = 60 phút nên ${hrs} giờ ${mins} phút = ${hrs * 60} + ${mins} = ${hrs * 60 + mins} phút.`,
    };
  }

  if (topic === 'midpoint_circle') {
    if (Math.random() < 0.5) {
      const r = randomInt(4, 25);
      const d = r * 2;
      return {
        id,
        operation: '÷',
        topic: 'Hình tròn (Đường kính & Bán kính)',
        expression: `Đường kính ${d} cm → Bán kính?`,
        prompt: `Một hình tròn có đường kính dài ${d} cm. Hỏi bán kính hình tròn đó dài bao nhiêu cm?`,
        unit: 'cm',
        answer: r,
        explanation: `Bán kính bằng một nửa đường kính: ${d} : 2 = ${r} (cm).`,
      };
    }
    const half = randomInt(6, 35);
    const total = half * 2;
    return {
      id,
      operation: '÷',
      topic: 'Trung điểm đoạn thẳng',
      expression: `M là trung điểm AB = ${total} cm → AM?`,
      prompt: `Cho M là trung điểm của đoạn thẳng AB dài ${total} cm. Đoạn thẳng AM dài bao nhiêu cm?`,
      unit: 'cm',
      answer: half,
      explanation: `Vì M là trung điểm của AB nên AM = AB : 2 = ${total} : 2 = ${half} (cm).`,
    };
  }

  if (topic === 'rect_perimeter') {
    const wid = randomInt(4, 18);
    const len = wid + randomInt(3, 20);
    const perim = (len + wid) * 2;
    return {
      id,
      operation: '×',
      topic: 'Chu vi hình chữ nhật',
      expression: `HCN dài ${len} cm, rộng ${wid} cm → Chu vi?`,
      prompt: `Một hình chữ nhật có chiều dài ${len} cm và chiều rộng ${wid} cm. Tính chu vi hình chữ nhật đó (cm).`,
      unit: 'cm',
      answer: perim,
      explanation: `Chu vi HCN = (Dài + Rộng) × 2 = (${len} + ${wid}) × 2 = ${len + wid} × 2 = ${perim} (cm).`,
    };
  }

  if (topic === 'rect_area') {
    const wid = randomInt(4, 16);
    const len = wid + randomInt(3, 18);
    const area = len * wid;
    return {
      id,
      operation: '×',
      topic: 'Diện tích hình chữ nhật',
      expression: `HCN dài ${len} cm, rộng ${wid} cm → Diện tích?`,
      prompt: `Một hình chữ nhật có chiều dài ${len} cm và chiều rộng ${wid} cm. Tính diện tích hình chữ nhật đó (cm²).`,
      unit: 'cm²',
      answer: area,
      explanation: `Diện tích HCN = Dài × Rộng = ${len} × ${wid} = ${area} (cm²).`,
    };
  }

  if (topic === 'square_basic') {
    const side = randomInt(4, 19);
    const askArea = Math.random() < 0.5;
    const ans = askArea ? side * side : side * 4;
    return {
      id,
      operation: '×',
      topic: askArea ? 'Diện tích hình vuông' : 'Chu vi hình vuông',
      expression: `Hình vuông cạnh ${side} cm → ${askArea ? 'Diện tích' : 'Chu vi'}?`,
      prompt: `Một hình vuông có cạnh dài ${side} cm. Tính ${askArea ? 'diện tích (cm²)' : 'chu vi (cm)'} của hình vuông đó.`,
      unit: askArea ? 'cm²' : 'cm',
      answer: ans,
      explanation: askArea
        ? `Diện tích hình vuông = Cạnh × Cạnh = ${side} × ${side} = ${ans} (cm²).`
        : `Chu vi hình vuông = Cạnh × 4 = ${side} × 4 = ${ans} (cm).`,
    };
  }

  // square_from_perimeter
  const side = randomInt(5, 16);
  const perim = side * 4;
  const area = side * side;
  return {
    id,
    operation: '÷',
    topic: 'Chu vi & Diện tích hình vuông',
    expression: `Hình vuông chu vi ${perim} cm → Diện tích?`,
    prompt: `Một hình vuông có chu vi là ${perim} cm. Tính diện tích của hình vuông đó (cm²).`,
    unit: 'cm²',
    answer: area,
    explanation: `Cạnh hình vuông = ${perim} : 4 = ${side} (cm). Diện tích = ${side} × ${side} = ${area} (cm²).`,
  };
}

function generateGrade2CurriculumQuestion(id: number, difficulty: number): Question {
  const easyTopics = ['prev_next', 'place_compose', 'terms_sum_diff', 'more_less', 'units_g2'] as const;
  const midTopics = ['more_less', 'mul_div_word', 'units_g2', 'polyline', 'terms_sum_diff', 'place_compose'] as const;
  const hardTopics = ['polyline', 'mul_div_word', 'units_g2', 'more_less', 'prev_next'] as const;

  const pool =
    difficulty <= 2
      ? [...easyTopics]
      : difficulty <= 4
        ? [...midTopics, ...easyTopics.slice(0, 2)]
        : [...hardTopics, ...midTopics.slice(0, 2)];

  const topic = randomChoice(pool);

  if (topic === 'prev_next') {
    const isPrev = Math.random() < 0.5;
    const base =
      difficulty <= 2
        ? randomInt(15, 99)
        : randomChoice([100, 200, 300, 400, 500, 600, 700, 800, 900, randomInt(120, 998)]);
    const ans = isPrev ? base - 1 : base + 1;
    return {
      id,
      operation: isPrev ? '-' : '+',
      topic: 'Số liền trước, số liền sau',
      expression: `${isPrev ? 'Số liền trước' : 'Số liền sau'} của ${base}`,
      prompt: `Tìm ${isPrev ? 'số liền trước' : 'số liền sau'} của số ${base}.`,
      answer: ans,
      explanation: isPrev
        ? `Số liền trước kém số đã cho 1 đơn vị: ${base} - 1 = ${ans}.`
        : `Số liền sau hơn số đã cho 1 đơn vị: ${base} + 1 = ${ans}.`,
    };
  }

  if (topic === 'place_compose') {
    const h = randomInt(1, 9);
    const t = randomInt(0, 9);
    const o = randomInt(1, 9);
    const ans = h * 100 + t * 10 + o;
    return {
      id,
      operation: '+',
      topic: 'Cấu tạo số có 3 chữ số',
      expression: `${h} trăm, ${t} chục, ${o} đơn vị`,
      prompt: `Số gồm ${h} trăm, ${t} chục và ${o} đơn vị là số nào?`,
      answer: ans,
      explanation: `${h} trăm + ${t} chục + ${o} đơn vị = ${h * 100} + ${t * 10} + ${o} = ${ans}.`,
    };
  }

  if (topic === 'terms_sum_diff') {
    const variant = difficulty >= 2 ? randomInt(0, 2) : randomInt(0, 1);
    if (variant === 0) {
      const a = randomInt(12, 65);
      const b = randomInt(14, 58);
      return {
        id,
        operation: '+',
        topic: 'Thành phần phép cộng',
        expression: `Số hạng ${a} và ${b} → Tổng?`,
        prompt: `Tìm tổng của hai số hạng là ${a} và ${b}.`,
        answer: a + b,
        explanation: `Tổng = Số hạng + Số hạng = ${a} + ${b} = ${a + b}.`,
      };
    }
    if (variant === 1) {
      const b = randomInt(14, 48);
      const a = b + randomInt(12, 55);
      return {
        id,
        operation: '-',
        topic: 'Thành phần phép trừ',
        expression: `SBT = ${a}, ST = ${b} → Hiệu?`,
        prompt: `Biết số bị trừ là ${a} và số trừ là ${b}. Tìm hiệu.`,
        answer: a - b,
        explanation: `Hiệu = Số bị trừ - Số trừ = ${a} - ${b} = ${a - b}.`,
      };
    }
    const a = randomChoice([2, 3, 4, 5]);
    const b = randomInt(3, 10);
    return {
      id,
      operation: '×',
      topic: 'Thành phần phép nhân',
      expression: `Thừa số ${a} và ${b} → Tích?`,
      prompt: `Biết hai thừa số lần lượt là ${a} và ${b}. Tìm tích.`,
      answer: a * b,
      explanation: `Tích = Thừa số × Thừa số = ${a} × ${b} = ${a * b}.`,
    };
  }

  if (topic === 'more_less') {
    const isMore = Math.random() < 0.5;
    if (isMore) {
      const base = randomInt(14, 75);
      const delta = randomInt(6, 28);
      const ans = base + delta;
      return {
        id,
        operation: '+',
        topic: 'Bài toán nhiều hơn',
        expression: `An ${base} viên, Bình nhiều hơn ${delta} viên`,
        prompt: `An có ${base} viên bi, Bình có nhiều hơn An ${delta} viên bi. Hỏi Bình có bao nhiêu viên bi?`,
        unit: 'viên',
        answer: ans,
        explanation: `Số bi của Bình là: ${base} + ${delta} = ${ans} (viên).`,
      };
    }
    const base = randomInt(28, 95);
    const delta = randomInt(6, 24);
    const ans = base - delta;
    return {
      id,
      operation: '-',
      topic: 'Bài toán ít hơn',
      expression: `Lan ${base} nhãn, Mai ít hơn ${delta} nhãn`,
      prompt: `Lan có ${base} nhãn vở, Mai có ít hơn Lan ${delta} nhãn vở. Hỏi Mai có bao nhiêu nhãn vở?`,
      unit: 'nhãn',
      answer: ans,
      explanation: `Số nhãn vở của Mai là: ${base} - ${delta} = ${ans} (nhãn).`,
    };
  }

  if (topic === 'mul_div_word') {
    if (Math.random() < 0.5) {
      const perPlate = randomChoice([2, 3, 4, 5]);
      const plates = randomInt(3, 10);
      const ans = perPlate * plates;
      return {
        id,
        operation: '×',
        topic: 'Bảng nhân 2, 3, 4, 5',
        expression: `${plates} đĩa, mỗi đĩa ${perPlate} quả`,
        prompt: `Mỗi đĩa có ${perPlate} quả cam. Hỏi ${plates} đĩa như thế có tất cả bao nhiêu quả cam?`,
        unit: 'quả',
        answer: ans,
        explanation: `Số quả cam có là: ${perPlate} × ${plates} = ${ans} (quả).`,
      };
    }
    const bags = randomChoice([2, 3, 4, 5]);
    const perBag = randomInt(3, 10);
    const total = bags * perBag;
    return {
      id,
      operation: '÷',
      topic: 'Bảng chia 2, 3, 4, 5',
      expression: `${total} cái kẹo chia đều ${bags} túi`,
      prompt: `Chia đều ${total} cái kẹo vào ${bags} túi. Hỏi mỗi túi có bao nhiêu cái kẹo?`,
      unit: 'cái',
      answer: perBag,
      explanation: `Số cái kẹo mỗi túi có là: ${total} : ${bags} = ${perBag} (cái).`,
    };
  }

  if (topic === 'units_g2') {
    const mode = randomInt(0, 3);
    if (mode === 0) {
      const dm = randomInt(2, 9);
      const cm = randomInt(1, 9);
      return {
        id,
        operation: '+',
        topic: 'Đơn vị đo độ dài (dm, cm)',
        expression: `${dm} dm ${cm} cm = ? cm`,
        prompt: `Đổi đơn vị: ${dm} dm ${cm} cm = ? cm`,
        unit: 'cm',
        answer: dm * 10 + cm,
        explanation: `1 dm = 10 cm nên ${dm} dm ${cm} cm = ${dm * 10} + ${cm} = ${dm * 10 + cm} cm.`,
      };
    }
    if (mode === 1) {
      const m = randomInt(2, 9);
      const dm = randomInt(1, 9);
      return {
        id,
        operation: '+',
        topic: 'Đơn vị đo độ dài (m, dm)',
        expression: `${m} m ${dm} dm = ? dm`,
        prompt: `Đổi đơn vị: ${m} m ${dm} dm = ? dm`,
        unit: 'dm',
        answer: m * 10 + dm,
        explanation: `1 m = 10 dm nên ${m} m ${dm} dm = ${m * 10} + ${dm} = ${m * 10 + dm} dm.`,
      };
    }
    if (mode === 2) {
      const days = randomInt(2, 4);
      return {
        id,
        operation: '×',
        topic: 'Đơn vị thời gian (Ngày, Giờ)',
        expression: `${days} ngày = ? giờ`,
        prompt: `Đổi đơn vị: ${days} ngày có bao nhiêu giờ?`,
        unit: 'giờ',
        answer: days * 24,
        explanation: `1 ngày = 24 giờ nên ${days} ngày = 24 × ${days} = ${days * 24} giờ.`,
      };
    }
    const weeks = randomInt(2, 8);
    return {
      id,
      operation: '×',
      topic: 'Đơn vị thời gian (Tuần, Ngày)',
      expression: `${weeks} tuần lễ = ? ngày`,
      prompt: `Hỏi ${weeks} tuần lễ có tất cả bao nhiêu ngày?`,
      unit: 'ngày',
      answer: weeks * 7,
      explanation: `1 tuần lễ có 7 ngày nên ${weeks} tuần lễ = 7 × ${weeks} = ${weeks * 7} ngày.`,
    };
  }

  // polyline
  const a = randomInt(8, 28);
  const b = randomInt(9, 32);
  const c = randomInt(10, 35);
  if (difficulty >= 5) {
    const d = randomInt(12, 34);
    const total = a + b + c + d;
    return {
      id,
      operation: '+',
      topic: 'Độ dài đường gấp khúc',
      expression: `Đường gấp khúc dài ${a}cm, ${b}cm, ${c}cm, ${d}cm`,
      prompt: `Đường gấp khúc ABCDE gồm 4 đoạn thẳng có độ dài lần lượt là ${a} cm, ${b} cm, ${c} cm và ${d} cm. Tính độ dài đường gấp khúc đó (cm).`,
      unit: 'cm',
      answer: total,
      explanation: `Độ dài đường gấp khúc bằng tổng 4 đoạn: ${a} + ${b} + ${c} + ${d} = ${total} (cm).`,
    };
  }
  const total = a + b + c;
  return {
    id,
    operation: '+',
    topic: 'Độ dài đường gấp khúc',
    expression: `Đường gấp khúc ABCD: ${a}cm, ${b}cm, ${c}cm`,
    prompt: `Đường gấp khúc ABCD gồm 3 đoạn thẳng có độ dài lần lượt là ${a} cm, ${b} cm và ${c} cm. Tính độ dài đường gấp khúc ABCD (cm).`,
    unit: 'cm',
    answer: total,
    explanation: `Độ dài đường gấp khúc = ${a} + ${b} + ${c} = ${total} (cm).`,
  };
}

export function generateQuestion(id: number, grade: Grade, level: Difficulty): Question {
  const diffObj = DIFFICULTIES.find((d) => d.id === level) ?? DIFFICULTIES[0];
  const difficulty = diffObj.multiplier;

  // Lớp 2, Lớp 3 và Lớp 4 kết hợp câu hỏi kiến thức chuyên đề
  const curriculumChance = difficulty >= 8 ? 0.3 : difficulty >= 2 ? 0.5 : 0.45;
  if (grade === 2 && Math.random() < curriculumChance) {
    return generateGrade2CurriculumQuestion(id, difficulty);
  }
  if (grade === 3 && Math.random() < curriculumChance) {
    return generateGrade3CurriculumQuestion(id, difficulty);
  }
  if (grade === 4 && Math.random() < curriculumChance) {
    return generateGrade4CurriculumQuestion(id, difficulty);
  }

  // Chọn phép toán phù hợp với từng lớp và độ khó cho học sinh mới bắt đầu
  let operations: MathOperation[] = ['+', '-'];
  if (grade === 2) {
    if (difficulty === 1) {
      operations = ['+', '-'];
    } else if (difficulty === 2) {
      operations = ['+', '-', '×'];
    } else {
      operations = ['+', '-', '×', '÷'];
    }
  } else {
    if (difficulty === 1) {
      operations = ['+', '-', '×'];
    } else {
      operations = ['+', '-', '×', '÷'];
    }
  }

  const op = randomChoice(operations);

  if (difficulty >= 8) {
    return generateEndgameQuestion(id, grade, difficulty, op);
  }

  if (difficulty >= 7) {
    return generateDisasterQuestion(id, grade, op);
  }

  if (difficulty >= 6) {
    return generateUnpassableQuestion(id, grade, op);
  }

  if (difficulty >= 5) {
    return generateImpossibleQuestion(id, grade, op);
  }

  // Giới hạn phạm vi số cho phép cộng / trừ theo chương trình lớp 2, 3, 4
  const addSubLimitByGrade: Record<Grade, number[]> = {
    2: [20, 50, 100, 300],
    3: [100, 300, 1000, 3000],
    4: [200, 1000, 5000, 10000],
  };
  const limit = addSubLimitByGrade[grade][difficulty - 1];

  if (op === '+') {
    const a = randomInt(1, Math.max(5, Math.floor(limit * 0.6)));
    const maxB = Math.max(1, limit - a);
    const b = randomInt(1, maxB);
    return {
      id,
      operation: '+',
      expression: `${a} + ${b}`,
      answer: a + b,
      explanation: `Cộng hai số: ${a} + ${b} = ${a + b}.`,
    };
  }

  if (op === '-') {
    const x = randomInt(2, limit);
    const y = randomInt(1, x);
    return {
      id,
      operation: '-',
      expression: `${x} - ${y}`,
      answer: x - y,
      explanation: `Lấy số lớn trừ số bé: ${x} - ${y} = ${x - y}.`,
    };
  }

  if (op === '×') {
    if (grade === 2) {
      const a = randomChoice([2, 3, 4, 5]);
      const b = randomInt(1, difficulty >= 3 ? 10 : 5);
      return {
        id,
        operation: '×',
        expression: `${a} × ${b}`,
        answer: a * b,
        explanation: `Nhẩm bảng nhân ${a}: ${a} × ${b} = ${a * b}.`,
      };
    }

    if (grade === 3) {
      const a = difficulty <= 2 ? randomInt(2, 9) : randomInt(11, 45);
      const b = randomInt(2, 9);
      return {
        id,
        operation: '×',
        expression: `${a} × ${b}`,
        answer: a * b,
        explanation: `Nhân ${a} với ${b}: ${a} × ${b} = ${a * b}.`,
      };
    }

    // Lớp 4
    const a = difficulty === 1 ? randomInt(2, 9) : difficulty <= 3 ? randomInt(12, 60) : randomInt(15, 99);
    const b = difficulty <= 2 ? randomInt(2, 9) : randomInt(4, 15);
    return {
      id,
      operation: '×',
      expression: `${a} × ${b}`,
      answer: a * b,
      explanation: `Đặt tính rồi tính: ${a} × ${b} = ${a * b}.`,
    };
  }

  // Phép chia hết (÷)
  if (grade === 2) {
    const divisor = randomChoice([2, 3, 4, 5]);
    const quotient = randomInt(1, difficulty >= 4 ? 10 : 6);
    const dividend = divisor * quotient;
    return {
      id,
      operation: '÷',
      expression: `${dividend} ÷ ${divisor}`,
      answer: quotient,
      explanation: `Nhẩm bảng chia ${divisor}: vì ${divisor} × ${quotient} = ${dividend} nên ${dividend} ÷ ${divisor} = ${quotient}.`,
    };
  }

  if (grade === 3) {
    const divisor = randomInt(2, 9);
    const quotient = difficulty <= 2 ? randomInt(2, 10) : randomInt(6, 25);
    const dividend = divisor * quotient;
    return {
      id,
      operation: '÷',
      expression: `${dividend} ÷ ${divisor}`,
      answer: quotient,
      explanation: `Vì ${divisor} × ${quotient} = ${dividend} nên ${dividend} ÷ ${divisor} = ${quotient}.`,
    };
  }

  // Lớp 4
  const divisor = difficulty <= 2 ? randomInt(2, 9) : randomInt(3, 12);
  const quotient = difficulty <= 2 ? randomInt(4, 20) : randomInt(10, 60);
  const dividend = divisor * quotient;
  return {
    id,
    operation: '÷',
    expression: `${dividend} ÷ ${divisor}`,
    answer: quotient,
    explanation: `Tìm số nhân với ${divisor} để được ${dividend}: ${divisor} × ${quotient} = ${dividend}, nên đáp án là ${quotient}.`,
  };
}

export function generateQuestionSet(
  count: number,
  grade: Grade,
  level: Difficulty
): Question[] {
  return Array.from({ length: count }, (_, idx) =>
    generateQuestion(idx + 1, grade, level)
  );
}
