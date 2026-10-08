export const searchEventImage = async (title) => {
  const words = title.trim().toLowerCase().split(/\s+/);
  const keyword = words.toSorted((a, b) => b.length - a.length)[0];
  const response = await fetch(
    `https://es.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(keyword)}&origin=*`
  );

  const data = await response.json();
  const pages = data?.query?.pages;
  if (!pages) return null;

  const pageId = Object.keys(pages)[0];
  return pages[pageId]?.original?.source ?? null;
};
