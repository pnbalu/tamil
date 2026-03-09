// Quiz rewards: XP for correct answers and bonuses

export const XP_PER_CORRECT = 10;
export const BONUS_PERFECT = 25; // extra XP when all answers are correct

/**
 * @param {number} correctCount
 * @param {number} total
 * @returns {{ points: number, breakdown: string }}
 */
export function computeQuizPoints(correctCount, total) {
  const base = correctCount * XP_PER_CORRECT;
  const bonus = total > 0 && correctCount === total ? BONUS_PERFECT : 0;
  const points = base + bonus;
  const breakdown =
    total > 0
      ? bonus > 0
        ? `${correctCount} correct × ${XP_PER_CORRECT} XP + ${BONUS_PERFECT} bonus = ${points} XP`
        : `${correctCount} correct × ${XP_PER_CORRECT} XP = ${points} XP`
      : '0 XP';
  return { points, breakdown };
}
