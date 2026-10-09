import { useState, useEffect, useRef } from 'react';
import EventForm from './components/EventForm';
import EventCard from './components/EventCard';
import EventDetail from './components/EventDetail';
import NotificationModal from './components/NotificationModal';
import DeleteAllModal from './components/DeleteAllModal';
import useEventFileSync from './hooks/useEventFileSync';
import { FALLBACK_IMAGE } from './utils/constants';
import { getUniqueEventId } from './utils/eventIds';

const getSafeImageUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return FALLBACK_IMAGE;

  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' ? url.href : FALLBACK_IMAGE;
  } catch {
    return FALLBACK_IMAGE;
  }
};

const normalizeEventData = (eventData) => ({
  ...eventData,
  title: eventData.title.trim().slice(0, 120),
  image: getSafeImageUrl(eventData.image)
});

const getStoredEvents = () => {
  try {
    const saved = localStorage.getItem('countdown_events');
    if (!saved) return { events: [], canPersist: true, error: null };

    let parsed;
    try {
      parsed = JSON.parse(saved);
    } catch {
      return {
        events: [],
        canPersist: false,
        error: 'Los eventos guardados no se pueden leer porque el contenido está dañado. No se guardarán cambios para evitar sobrescribir esos datos.'
      };
    }

    if (!Array.isArray(parsed)) {
      return {
        events: [],
        canPersist: false,
        error: 'Los eventos guardados tienen un formato inválido. No se guardarán cambios para evitar sobrescribir esos datos.'
      };
    }

    const validEvents = parsed.filter((event) =>
      event &&
      typeof event === 'object' &&
      !Array.isArray(event) &&
      typeof event.id === 'string' &&
      event.id.trim() &&
      typeof event.title === 'string' &&
      event.title.trim() &&
      typeof event.date === 'string' &&
      !Number.isNaN(Date.parse(event.date)) &&
      typeof event.image === 'string'
    );
    const reservedIds = new Set(validEvents.map((event) => event.id));
    const usedIds = new Set();

    return {
      events: validEvents.map((event) => {
        const id = getUniqueEventId(event.id, usedIds, reservedIds);
        return id === event.id ? event : { ...event, id };
      }),
      canPersist: true,
      error: null
    };
  } catch {
    return {
      events: [],
      canPersist: false,
      error: 'No se pudieron leer los eventos guardados en este navegador. No se guardarán cambios para evitar sobrescribir datos existentes.'
    };
  }
};

export default function App() {
  const [storedEvents] = useState(getStoredEvents);
  const [events, setEvents] = useState(storedEvents.events);
  const [countWeekends, setCountWeekends] = useState(true);
  const eventIdCounter = useRef(0);

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // 🎯 Control del modal del formulario
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;

  const [notification, setNotification] = useState({
    isOpen: Boolean(storedEvents.error),
    type: storedEvents.error ? 'error' : 'success',
    title: storedEvents.error ? 'Error al cargar eventos' : '',
    message: storedEvents.error ?? ''
  });

  useEffect(() => {
    if (!storedEvents.canPersist) return;

    try {
      localStorage.setItem('countdown_events', JSON.stringify(events));
    } catch {
      window.setTimeout(() => {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error al guardar eventos',
          message: 'No se pudieron guardar los eventos en este navegador. Los cambios actuales solo están en memoria; expórtalos antes de cerrar la página.'
        });
      });
    }
  }, [events, storedEvents.canPersist]);

  const addEvent = (newEvent) => {
    const usedIds = new Set(events.map((event) => event.id));
    const id = getUniqueEventId(
      `${Date.now()}-${eventIdCounter.current++}`,
      usedIds
    );

    setEvents((currentEvents) => [
      ...currentEvents,
      { ...normalizeEventData(newEvent), id }
    ]);
  };

  const deleteEvent = (id) => {
    setEvents((currentEvents) => currentEvents.filter((event) => event.id !== id));
    if (selectedEventId === id) setSelectedEventId(null);
  };

  const updateEvent = (id, updatedEvent) => {
    const updatedEventData = normalizeEventData(updatedEvent);
    setEvents((currentEvents) => currentEvents.map((event) => event.id === id
      ? { ...event, ...updatedEventData }
      : event));
  };

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setIsFormOpen(true);
  };

  const handleConfirmDeleteAll = () => {
    setEvents([]);
    setSelectedEventId(null);
    setIsDeleteAllModalOpen(false); // Cierra el modal personalizado
    showNotification('success', '¡Todo limpio!', 'Se han eliminado todos los eventos de la aplicación.');
  };

  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const { fileInputRef, exportToJSON, importFromJSON } = useEventFileSync({
    events,
    setEvents,
    setSelectedEventId,
    showNotification,
    getSafeImageUrl
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans pb-16 sm:pb-24 relative overflow-x-hidden">

      {/* Cabecera Principal */}
      <header className="relative z-50 max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-6 sm:pb-9 flex flex-col lg:flex-row lg:flex-wrap justify-between items-stretch lg:items-center gap-4 sm:gap-6 border-b border-white/10 mb-10 sm:mb-16">
        <div className="w-full min-w-0 lg:w-auto lg:flex-1 lg:basis-64">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-cyan-400 via-indigo-400 to-purple-500">
            Event Horizon
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">Tus cuentas atrás en tiempo real de forma local.</p>
        </div>

        <label className="ui-glass flex w-full lg:w-auto cursor-pointer items-center justify-between lg:justify-start gap-3 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-200">
          <span>Contar fines de semana</span>
          <input
            type="checkbox"
            role="switch"
            checked={countWeekends}
            onChange={(event) => setCountWeekends(event.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-6 w-11 shrink-0 rounded-full border border-white/10 bg-slate-800 transition-colors duration-200 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-neutral-400 after:transition-transform after:duration-200 peer-checked:border-cyan-400/40 peer-checked:bg-cyan-500/30 peer-checked:after:translate-x-5 peer-checked:after:bg-cyan-300 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-400"
          />
        </label>

        {/* 🎯 Controles de Sincronización Minimalistas */}
        <div className="ui-glass flex w-full lg:w-auto items-center justify-between gap-3 sm:gap-4 rounded-2xl p-2">
          <div className="flex min-w-0 flex-1 lg:flex-initial gap-2">
            <button
              type="button"
              onClick={exportToJSON}
              className="flex-1 lg:flex-initial px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs sm:text-sm cursor-pointer border border-slate-800"
            >
              💾 Exportar
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex-1 lg:flex-initial px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold rounded-xl text-xs sm:text-sm cursor-pointer border border-cyan-500/20"
            >
              📂 Importar
            </button>
          </div>

          {/* Botón de Información descriptiva */}
          <div className="group relative">
            <button
              type="button"
              aria-label="Información sobre la sincronización"
              aria-describedby="sync-tooltip"
              className="w-8 h-8 shrink-0 rounded-full bg-slate-800 text-slate-300 text-xs font-serif flex items-center justify-center cursor-help group-hover:bg-slate-700 group-hover:text-white"
            >
              i
            </button>
            <div id="sync-tooltip" role="tooltip" className="pointer-events-none absolute right-0 top-8 z-9999 w-60 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-slate-900 p-3 text-neutral-300 text-xs shadow-2xl opacity-0 transition duration-200 leading-relaxed group-hover:opacity-100 group-focus-within:opacity-100">
              <span className="font-bold text-slate-200 block mb-1">Sincronización Portátil</span>
              <span className="text-white">Usa Exportar</span> para guardar tus eventos en un archivo. Pásalo a tu móvil u otro navegador e indícalo en <span className="text-white">Importar</span> para verlos ahí.
            </div>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={importFromJSON} accept=".json" className="hidden" aria-label="Seleccionar archivo JSON para importar" />

        <button type="button"
          onClick={() => setIsDeleteAllModalOpen(true)}
          title="Eliminar todos los eventos"
          className="w-full lg:w-auto px-3 py-3 sm:py-2 text-xs sm:text-sm font-bold uppercase tracking-wider bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-900/30 hover:border-red-800 rounded-xl backdrop-blur-sm cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
        >
          Vaciar Todo
        </button></header>

      {/* Grid Central de Eventos (Ocupa el ancho al completo) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8">
        {events.length === 0 ? (
          <div className="ui-glass text-center px-4 py-16 sm:px-8 sm:py-24 border-dashed rounded-3xl">
            <p className="text-neutral-400 text-sm sm:text-base max-w-sm mx-auto">
              Tu horizonte está vacío. Haz clic en el botón inferior para programar tu primer momento especial.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => setSelectedEventId(event.id)}
                isSelected={selectedEventId === event.id}
                countWeekends={countWeekends}
              />
            ))}
          </div>
        )}
      </main>

      <div className="mx-auto mt-8 sm:mt-10 flex justify-center px-4 sm:px-8">
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          aria-haspopup="dialog"
          className="w-full sm:w-auto justify-center px-5 sm:px-6 py-4 bg-linear-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:via-indigo-400 hover:to-purple-500 text-white font-black rounded-2xl shadow-2xl shadow-indigo-500/30 hover:scale-105 flex items-center gap-3 cursor-pointer text-xs sm:text-sm tracking-wide uppercase"
        >
          <span aria-hidden="true" className="text-lg leading-none">+</span> Añadir Evento
        </button>
      </div>

      <DeleteAllModal
        isOpen={isDeleteAllModalOpen}
        isActive={!notification.isOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleConfirmDeleteAll}
      />

      {/* Vista Detalle */}
      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEventId(null)}
          onDelete={deleteEvent}
          onEdit={handleEditEvent}
          isModalActive={!isFormOpen && !notification.isOpen}
          countWeekends={countWeekends}
        />
      )}

      {/* El formulario se renderiza después del detalle para aparecer encima sin desmontarlo. */}
      {isFormOpen && (
        <EventForm
          onClose={() => {
            setIsFormOpen(false);
            setEventToEdit(null);
          }}
          onAddEvent={addEvent}
          onUpdateEvent={updateEvent}
          eventToEdit={eventToEdit}
          isActive={!notification.isOpen}
        />
      )}

      {/* Alertas */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />

      <footer className="max-w-7xl mx-auto mt-16 sm:mt-20 px-4 sm:px-8 pt-6 sm:pt-8 border-t border-white/10 text-xs sm:text-sm text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="font-semibold text-slate-300">Desarrollado por Iván Verano</p>
          <p className="mt-1">2026</p>
        </div>
        <nav aria-label="Redes sociales" className="flex items-center gap-5">
          <a
            href="https://www.linkedin.com/in/ivan-verano-pena"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-cyan-400 transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/IvanVeranoV"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-cyan-400 transition-colors"
          >
            GitHub
          </a>
        </nav>
      </footer>
    </div>


  );
}