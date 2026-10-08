export const getCountdownParts = (targetDate, now = Date.now()) => {
  const difference = targetDate.getTime() - now;
  const absDiff = Math.abs(difference);

  return {
    isPast: difference < 0,
    days: Math.floor(absDiff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((absDiff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((absDiff / (1000 * 60)) % 60),
    seconds: Math.floor((absDiff / 1000) % 60)
  };
};
