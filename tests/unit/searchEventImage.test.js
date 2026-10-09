import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchEventImage } from '../../src/utils/searchEventImage';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('searchEventImage', () => {
  it('searches Wikipedia with the longest normalized title word', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({
        query: { pages: { '42': { original: { source: 'https://example.test/image.jpg' } } } }
      })
    });

    await expect(searchEventImage('  fiesta   aniversario ')).resolves.toBe(
      'https://example.test/image.jpg'
    );
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('titles=aniversario'));
  });

  it('returns null when the page has no original image', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({ query: { pages: { '42': {} } } })
    });

    await expect(searchEventImage('Concierto')).resolves.toBeNull();
  });

  it('returns null when Wikipedia has no page results', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({ query: { pages: {} } })
    });

    await expect(searchEventImage('Concierto')).resolves.toBeNull();
  });

  it('propagates network errors to the caller', async () => {
    const networkError = new Error('Network unavailable');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(networkError);

    await expect(searchEventImage('Concierto')).rejects.toBe(networkError);
  });
});
