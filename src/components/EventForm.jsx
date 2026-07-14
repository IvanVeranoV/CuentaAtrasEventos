import { useState } from 'react';

export default function EventForm({ onAddEvent }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date) return;

    let finalImage = image.trim();

    // Si no introduce imagen, buscamos una usando la API limpia de Wikipedia (sin CORS ni ORB)
    if (!finalImage) {
      setIsLoading(true);
      try {
        const words = title.trim().toLowerCase().split(/\s+/);
        const sortedWords = [...words].sort((a, b) => b.length - a.length);
        // Usamos la palabra descriptiva más larga o la última
        const keyword = sortedWords[0];

        // Consultamos la API pública de Wikipedia para obtener una imagen asociada a la palabra
        const response = await fetch(
          `https://es.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(keyword)}&origin=*`
        );

        const data = await response.json();
        const pages = data?.query?.pages;

        // Extraemos la URL directa de la imagen original si existe
        let wikiImage = null;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          wikiImage = pages[pageId]?.original?.source;
        }

        // Si Wikipedia tiene imagen para esa palabra, la guardamos. Si no, usamos nuestro fallback seguro.
        finalImage = wikiImage || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=60';

      } catch (error) {
        console.error("Error obteniendo la imagen:", error);
        // Imagen de respaldo definitiva
        finalImage = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=60';
      } finally {
        setIsLoading(false);
      }
    }

    onAddEvent({ title, date, image: finalImage });

    setTitle('');
    setDate('');
    setImage('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">Nuevo Evento</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="event-title" className="block text-sm font-medium text-slate-300 mb-1">
            Nombre del evento
          </label>
          <input
            id="event-title"
            type="text"
            required
            disabled={isLoading}
            placeholder="Ej. Nieve, Playa, Concierto..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-cyan-500 text-white disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="event-date" className="block text-sm font-medium text-slate-300 mb-1">
            Fecha
          </label>
          <input
            id="event-date"
            type="date"
            required
            disabled={isLoading}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-cyan-500 text-white disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="event-image" className="block text-sm font-medium text-slate-300 mb-1">
            URL de la Imagen de Fondo (Opcional)
          </label>
          <input
            id="event-image"
            type="url"
            disabled={isLoading}
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Deja vacío para asignación automática"
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-cyan-500 text-white placeholder:text-slate-500 text-sm disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition duration-200 shadow-lg active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isLoading ? 'Buscando imagen fija...' : 'Crear Evento'}
        </button>
      </div>
    </form>
  );
}