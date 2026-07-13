import { useState } from 'react';

export default function EventForm({ onAddEvent }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date) return;

    let finalImage = image.trim();

    // Si el usuario deja la URL vacía, asignamos una imagen automática basada en el título
    if (!finalImage) {
      // 1. Limpiamos el título para quedarnos con caracteres válidos para URLs
      // Convertimos a minúsculas y eliminamos caracteres extraños
      const cleanTitle = title.trim().toLowerCase();

      // 2. Extraemos la última palabra (suele ser la más descriptiva, ej: "nieve" en "vacaciones en la nieve")
      const words = cleanTitle.split(/\s+/);
      const keyword = words[words.length - 1];

      // 3. Usamos un generador dinámico que no falla por CORS ni bloquea cookies.
      // LoremFlicker cambiará la imagen según la palabra clave y el parámetro 'random' evitará la caché del navegador.
      finalImage = `https://loremflickr.com/800/600/${encodeURIComponent(keyword)}?random=${Date.now()}`;
    }

    onAddEvent({ title, date, image: finalImage });
    
    // Resetear formulario
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
            placeholder="Ej. Vacaciones en la nieve"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-cyan-500 text-white"
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-cyan-500 text-white"
          />
        </div>

        <div>
          <label htmlFor="event-image" className="block text-sm font-medium text-slate-300 mb-1">
            URL de la Imagen de Fondo (Opcional)
          </label>
          <input
            id="event-image"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Deja vacío para asignación automática"
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-cyan-500 text-white placeholder:text-slate-500 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition duration-200 shadow-lg active:scale-[0.98] cursor-pointer flex justify-center items-center"
        >
          Crear Evento
        </button>
      </div>
    </form>
  );
}