const getParts = (difference) => {
  const absDiff = Math.abs(difference);

  return {
    isPast: difference < 0,
    days: Math.floor(absDiff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((absDiff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((absDiff / (1000 * 60)) % 60),
    seconds: Math.floor((absDiff / 1000) % 60)
  };
};

export const getCountdownParts = (targetDate, now = Date.now()) =>
  getParts(targetDate.getTime() - now);

export const getBusinessCountdownParts = (targetDate, now = Date.now()) => {
  const targetTime = targetDate.getTime();
  const isPast = targetTime < now;
  const startTime = Math.min(targetTime, now);
  const endTime = Math.max(targetTime, now);
  let businessTime = 0;
  let cursor = new Date(startTime);

  while (cursor.getTime() < endTime) {
    const dayOfWeek = cursor.getDay();
    const nextDay = new Date(cursor);
    nextDay.setHours(24, 0, 0, 0);
    const segmentEnd = Math.min(nextDay.getTime(), endTime);

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessTime += segmentEnd - cursor.getTime();
    }

    cursor = new Date(segmentEnd);
  }

  return {
    ...getParts(businessTime),
    isPast
  };
};
