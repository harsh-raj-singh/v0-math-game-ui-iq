export type Operation = "add" | "subtract" | "multiply" | "divide";

export interface MathProblem {
  operand1: number;
  operand2: number;
  operation: Operation;
  answer: number;
  display: string;
}

const OPERATION_SYMBOLS: Record<Operation, string> = {
  add: "+",
  subtract: "-",
  multiply: "\u00d7",
  divide: "\u00f7",
};

export function generateProblem(operations: Operation[]): MathProblem {
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let operand1: number;
  let operand2: number;
  let answer: number;

  switch (operation) {
    case "add":
      operand1 = randInt(1, 100);
      operand2 = randInt(1, 100);
      answer = operand1 + operand2;
      break;
    case "subtract":
      operand1 = randInt(1, 100);
      operand2 = randInt(1, operand1);
      answer = operand1 - operand2;
      break;
    case "multiply":
      operand1 = randInt(2, 12);
      operand2 = randInt(2, 12);
      answer = operand1 * operand2;
      break;
    case "divide":
      operand2 = randInt(2, 12);
      answer = randInt(2, 12);
      operand1 = operand2 * answer;
      break;
    default:
      operand1 = randInt(1, 100);
      operand2 = randInt(1, 100);
      answer = operand1 + operand2;
  }

  const display = `${operand1} ${OPERATION_SYMBOLS[operation]} ${operand2}`;
  return { operand1, operand2, operation, answer, display };
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Spoken word to number conversion ---

const WORD_TO_NUM: Record<string, number> = {
  zero: 0, oh: 0, o: 0,
  one: 1, won: 1,
  two: 2, to: 2, too: 2,
  three: 3, tree: 3,
  four: 4, for: 4, fore: 4,
  five: 5,
  six: 6, sex: 6,
  seven: 7,
  eight: 8, ate: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  thousand: 1000,
};

export function parseSpokenNumber(text: string): number | null {
  if (!text || text.trim().length === 0) return null;

  const cleaned = text.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "");

  // Direct numeric match
  const directNum = Number.parseInt(cleaned, 10);
  if (!Number.isNaN(directNum)) return directNum;

  // Check for negative
  let isNegative = false;
  let working = cleaned;
  if (working.startsWith("negative ") || working.startsWith("minus ")) {
    isNegative = true;
    working = working.replace(/^(negative|minus)\s+/, "");
  }

  const words = working.split(/[\s-]+/).filter(Boolean);
  if (words.length === 0) return null;

  // Try digit-by-digit: "four two" => 42
  const digitMode = words.every(
    (w) => WORD_TO_NUM[w] !== undefined && WORD_TO_NUM[w] < 10
  );
  if (digitMode && words.length > 1) {
    const digits = words.map((w) => WORD_TO_NUM[w]);
    const result = Number.parseInt(digits.join(""), 10);
    return isNegative ? -result : result;
  }

  // Standard word-to-number parsing
  let total = 0;
  let current = 0;

  for (const word of words) {
    const val = WORD_TO_NUM[word];
    if (val === undefined) {
      // Try parsing as a raw number in the word
      const n = Number.parseInt(word, 10);
      if (!Number.isNaN(n)) {
        current += n;
        continue;
      }
      return null;
    }

    if (val === 1000) {
      current = current === 0 ? 1000 : current * 1000;
      total += current;
      current = 0;
    } else if (val === 100) {
      current = current === 0 ? 100 : current * 100;
    } else {
      current += val;
    }
  }

  total += current;
  return isNegative ? -total : total;
}

export function problemToSpeech(problem: MathProblem): string {
  const opWords: Record<Operation, string> = {
    add: "plus",
    subtract: "minus",
    multiply: "times",
    divide: "divided by",
  };
  return `${problem.operand1} ${opWords[problem.operation]} ${problem.operand2} equals what?`;
}
