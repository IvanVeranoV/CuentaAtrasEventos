import { describe, expect, it } from 'vitest';
import { getUniqueEventId } from '../../src/utils/eventIds';

describe('getUniqueEventId', () => {
  it('returns and records an unused ID', () => {
    const usedIds = new Set();

    expect(getUniqueEventId('event', usedIds)).toBe('event');
    expect(usedIds.has('event')).toBe(true);
  });

  it('chooses the next available suffix when an ID is already used', () => {
    const usedIds = new Set(['event', 'event-1']);

    expect(getUniqueEventId('event', usedIds)).toBe('event-2');
  });

  it('does not reuse an ID reserved for a later imported event', () => {
    const usedIds = new Set(['event']);
    const reservedIds = new Set(['event-1']);

    expect(getUniqueEventId('event', usedIds, reservedIds)).toBe('event-2');
  });

  it('normalizes numeric IDs to strings', () => {
    const usedIds = new Set();

    expect(getUniqueEventId(123, usedIds)).toBe('123');
    expect(usedIds.has('123')).toBe(true);
  });
});
