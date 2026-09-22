export type DrawResult = {
  numbers: number[];
  prizePool: number;
};

export function generateDrawNumbers(): number[] {
  const numbers = new Set<number>();

  while (numbers.size < 5) {
    const number = Math.floor(Math.random() * 45) + 1;
    numbers.add(number);
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

export function calculatePrizePool(
  subscriberCount: number,
  subscriptionPrice: number,
  rollover: number = 0
) {
  const totalSubscriptionValue =
    subscriberCount * subscriptionPrice;

  return totalSubscriptionValue + rollover;
}

export function calculatePrize(
  matchType: 3 | 4 | 5,
  prizePool: number,
  winnerCount: number
) {
  if (winnerCount <= 0) return 0;

  let percentage = 0;

  if (matchType === 5) {
    percentage = 0.4;
  }

  if (matchType === 4) {
    percentage = 0.35;
  }

  if (matchType === 3) {
    percentage = 0.25;
  }

  return (prizePool * percentage) / winnerCount;
}

export function countMatches(
  userNumbers: number[],
  drawNumbers: number[]
) {
  return userNumbers.filter((number) =>
    drawNumbers.includes(number)
  ).length;
}