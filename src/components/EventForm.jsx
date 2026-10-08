import { useState } from 'react';
import { FALLBACK_IMAGE } from '../utils/constants';
import { searchEventImage } from '../utils/searchEventImage';

const getDateTimeInputValues = (value) => {
  const eventDate = new Date(value);
  if (Number.isNaN(eventDate.getTime())) return { date: '', time: '' };

  const pad = (part) => String(part).padStart(2, '0');
  return {
    date: `${eventDate.getFullYear()}-${pad(eventDate.getMonth() + 1)}-${pad(eventDate.getDate())}`,
    time: `${pad(eventDate.getHours())}:${pad(eventDate.getMinutes())}`
  };
};

export default function EventForm({ onClose, onAddEvent, onUpdateEvent, eventToEdit }) {
  const initialDateTime = getDateTimeInputValues(eventToEdit?.date);
  const [title, setTitle] = useState(eventToEdit?.title ?? '');
  const [date, setDate] = useState(initialDateTime.date);
  const [time, setTime] = useState(initialDateTime.time);
  const [image, setImage] = useState(eventToEdit?.image ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [titleError, setTitleError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setTitleError(true);
      return;
    }
    if (!date) return;

    const finalTime = !time ? '00:00' : time;
    const combinedDateTime = `${date}T${finalTime}`;

    let finalImage = image.trim();

    if (!finalImage) {
      setIsLoading(true);
      try {
        finalImage = (await searchEventImage(normalizedTitle)) || FALLBACK_IMAGE;
      } catch (error) {
        console.error("Error obteniendo la imagen:", error);
        finalImage = FALLBACK_IMAGE;
      } finally {
        setIsLoading(false);
      }
    }

    const updatedEvent = { title: normalizedTitle, date: combinedDateTime, image: finalImage };
    if (eventToEdit) {
      onUpdateEvent(eventToEdit.id, updatedEvent);
    } else {
      onAddEvent(updatedEvent);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div role="dialog" aria-modal="true" aria-labelledby="event-form-title" className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">

        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
        >
          ✕
        </button>

        <h2 id="event-form-title" className="text-2xl font-black mb-6 bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-indigo-400">
          {eventToEdit ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="modal-title" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Nombre del evento
            </label>
            <input
              id="modal-title"
              type="text"
              required
              disabled={isLoading}
              placeholder="Ej. Viaje a la playa"
              value={title}
              aria-invalid={titleError}
              aria-describedby={titleError ? 'modal-title-error' : undefined}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError(false);
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-cyan-500 text-white disabled:opacity-50 transition"
            />
            {titleError && (
              <p id="modal-title-error" className="mt-2 text-sm text-rose-400">
                El nombre del evento no puede estar vacío.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="modal-date" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Fecha *
              </label>
              <input
                id="modal-date"
                type="date"
                required
                disabled={isLoading}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-cyan-500 text-white disabled:opacity-50 transition text-sm cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor="modal-time" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Hora <span className="text-slate-600 font-normal text-[10px]">(Opcional)</span>
              </label>
              <input
                id="modal-time"
                type="time"
                disabled={isLoading}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-cyan-500 text-white disabled:opacity-50 transition text-sm cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="modal-image" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              URL de la Imagen (Opcional)
            </label>
            <input
              id="modal-image"
              type="url"
              disabled={isLoading}
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Vacío para búsqueda automática"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-cyan-500 text-white placeholder:text-slate-600 text-sm disabled:opacity-50 transition"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition cursor-pointer text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-linear-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-500/20 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? 'Buscando foto...' : eventToEdit ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}