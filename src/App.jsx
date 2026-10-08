import { useState, useEffect } from 'react';
import EventForm from './components/EventForm';
import EventCard from './components/EventCard';
import EventDetail from './components/EventDetail';
import NotificationModal from './components/NotificationModal';
import DeleteAllModal from './components/DeleteAllModal';
import useEventFileSync from './hooks/useEventFileSync';
import { FALLBACK_IMAGE } from './utils/constants';

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
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((event) => event && typeof event === 'object') : [];
  } catch {
    return [];
  }
};

export default function App() {
  const [events, setEvents] = useState(getStoredEvents);

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // 🎯 Control del modal del formulario
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;

  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    localStorage.setItem('countdown_events', JSON.stringify(events));
  }, [events]);

  const addEvent = (newEvent) => {
    setEvents((currentEvents) => [
      ...currentEvents,
      { ...normalizeEventData(newEvent), id: Date.now().toString() }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 relative overflow-x-hidden">

      {/* Cabecera Principal */}
      <header className="relative z-50 max-w-7xl mx-auto px-6 pt-12 pb-6 flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-slate-900 mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-cyan-400 via-indigo-400 to-purple-500">
            Event Horizon
          </h1>
          <p className="text-slate-500 text-sm mt-1">Tus cuentas atrás en tiempo real de forma local.</p>
        </div>

        {/* 🎯 Controles de Sincronización Minimalistas */}
        <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-2xl border border-slate-900 backdrop-blur-sm">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportToJSON}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer border border-slate-800"
            >
              💾 Exportar
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold rounded-xl text-xs transition cursor-pointer border border-cyan-500/20"
            >
              📂 Importar
            </button>
          </div>

          {/* Botón de Información descriptiva */}
          <div className="group relative">
            <button type="button" aria-label="Mostrar información sobre la sincronización" className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-serif flex items-center justify-center cursor-help group-hover:bg-slate-700 group-hover:text-slate-200 transition">
              i
            </button>
            <div role="tooltip" className="pointer-events-none absolute right-0 top-8 z-9999 w-60 p-3 bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition duration-200 leading-relaxed">
              <span className="font-bold text-slate-200 block mb-1">Sincronización Portátil</span>
              <span className="text-white">Usa Exportar</span> para guardar tus eventos en un archivo. Pásalo a tu móvil u otro navegador e indícalo en <span className="text-white">Importar</span> para verlos ahí.
            </div>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={importFromJSON} accept=".json" className="hidden" />

        <button type="button"
          onClick={() => setIsDeleteAllModalOpen(true)}
          title="Eliminar todos los eventos"
          className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-900/30 hover:border-red-800 rounded-xl transition backdrop-blur-sm cursor-pointer flex items-center gap-1.5 shadow-md"
        >
          Vaciar Todo
        </button></header>

      {/* Grid Central de Eventos (Ocupa el ancho al completo) */}
      <main className="max-w-7xl mx-auto px-6">
        {events.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
            <p className="text-slate-600 text-base max-w-sm mx-auto">
              Tu horizonte está vacío. Haz clic en el botón inferior para programar tu primer momento especial.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => setSelectedEventId(event.id)}
                isSelected={selectedEventId === event.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* 🎯 BOTÓN FLOTANTE VIBRANTE: Para lanzar el Modal */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-4 bg-linear-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:via-indigo-400 hover:to-purple-500 text-white font-black rounded-2xl shadow-2xl shadow-indigo-500/30 transition hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer text-sm tracking-wide uppercase"
        >
          <span className="text-lg leading-none">+</span> Añadir Evento
        </button>
      </div>

      <DeleteAllModal
        isOpen={isDeleteAllModalOpen}
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
        />
      )}

      {/* El formulario se renderiza después del detalle para aparecer encima sin desmontarlo. */}
      {isFormOpen && (
        <EventForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEventToEdit(null);
          }}
          onAddEvent={addEvent}
          onUpdateEvent={updateEvent}
          eventToEdit={eventToEdit}
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

      <footer className="max-w-7xl mx-auto mt-20 px-6 pt-8 border-t border-slate-900 text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
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