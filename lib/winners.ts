export type WinnerMatch = {
  userId: string;
  matchType: 3 | 4 | 5;
};

export function countMatches(
  userNumbers: number[],
  drawNumbers: number[]
): number {
  return userNumbers.filter((number) =>
    drawNumbers.includes(number)
  ).length;
}

export function getMatchType(
  matchCount: number
): 3 | 4 | 5 | null {
  if (matchCount >= 5) return 5;
  if (matchCount === 4) return 4;
  if (matchCount === 3) return 3;

  return null;
}

export function getPrizePercentage(
  matchType: 3 | 4 | 5
): number {
  if (matchType === 5) return 0.40;
  if (matchType === 4) return 0.35;
  return 0.25;
}

export function calculateIndividualPrize(
  prizePool: number,
  matchType: 3 | 4 | 5,
  winnerCount: number
): number {
  if (winnerCount <= 0) return 0;

  const tierAmount =
    prizePool * getPrizePercentage(matchType);

  return Number((tierAmount / winnerCount).toFixed(2));
}