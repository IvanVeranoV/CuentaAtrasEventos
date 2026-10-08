export const getUniqueEventId = (baseId, usedIds, reservedIds = new Set()) => {
  let uniqueId = String(baseId);

  if (usedIds.has(uniqueId)) {
    let suffix = 1;
    while (usedIds.has(`${baseId}-${suffix}`) || reservedIds.has(`${baseId}-${suffix}`)) {
      suffix += 1;
    }
    uniqueId = `${baseId}-${suffix}`;
  }

  usedIds.add(uniqueId);
  return uniqueId;
};
