import { useState } from 'react';
import { FALLBACK_IMAGE } from '../utils/constants';
import { searchEventImage } from '../utils/searchEventImage';
import useDialogAccessibility from '../hooks/useDialogAccessibility';

const getDateTimeInputValues = (value) => {
  const eventDate = new Date(value);
  if (Number.isNaN(eventDate.getTime())) return { date: '', time: '' };

  const pad = (part) => String(part).padStart(2, '0');
  return {
    date: `${eventDate.getFullYear()}-${pad(eventDate.getMonth() + 1)}-${pad(eventDate.getDate())}`,
    time: `${pad(eventDate.getHours())}:${pad(eventDate.getMinutes())}`
  };
};

export default function EventForm({ onClose, onAddEvent, onUpdateEvent, eventToEdit, isActive = true }) {
  const dialogRef = useDialogAccessibility({ isOpen: true, isActive, onClose });
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
    <div className="ui-overlay fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal={isActive}
        aria-hidden={isActive ? undefined : true}
        aria-labelledby="event-form-title"
        tabIndex={-1}
        className="ui-panel relative w-full max-w-md p-4 sm:p-6"
      >

        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar formulario"
          className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
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
              data-autofocus
              placeholder="Ej. Viaje a la playa"
              value={title}
              aria-invalid={titleError}
              aria-describedby={titleError ? 'modal-title-error' : undefined}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError(false);
              }}
              className="ui-input"
            />
            {titleError && (
              <p id="modal-title-error" role="alert" className="mt-2 text-sm text-rose-300">
                El nombre del evento no puede estar vacío.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="ui-input cursor-pointer text-sm"
              />
            </div>

            <div>
              <label htmlFor="modal-time" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Hora <span className="text-slate-400 text-xs font-normal">(Opcional)</span>
              </label>
              <input
                id="modal-time"
                type="time"
                disabled={isLoading}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="ui-input cursor-pointer text-sm"
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
              className="ui-input text-sm placeholder:text-neutral-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl cursor-pointer text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-linear-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? 'Buscando foto...' : eventToEdit ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}