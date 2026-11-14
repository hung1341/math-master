import { DIFFICULTIES } from '../constants/gameConfig';
import type { Difficulty, Grade, MathOperation, Question } from '../types/game';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateQuestion(id: number, grade: Grade, level: Difficulty): Question {
  const diffObj = DIFFICULTIES.find((d) => d.id === level) ?? DIFFICULTIES[0];
  const difficulty = diffObj.multiplier;

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
