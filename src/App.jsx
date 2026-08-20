import { useState, useEffect, useRef } from 'react';
import EventForm from './components/EventForm';
import EventCard from './components/EventCard';
import EventDetail from './components/EventDetail';
import NotificationModal from './components/NotificationModal';

export default function App() {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('countdown_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // 🎯 Control del modal del formulario
  const fileInputRef = useRef(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

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
    setEvents([...events, { ...newEvent, id: Date.now().toString() }]);
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
    if (selectedEvent?.id === id) setSelectedEvent(null);
  };

  const handleConfirmDeleteAll = () => {
    setEvents([]);
    setSelectedEvent(null);
    setIsDeleteAllModalOpen(false); // Cierra el modal personalizado
    if (typeof showNotification === 'function') {
      showNotification('success', '¡Todo limpio!', 'Se han eliminado todos los eventos de la aplicación.');
    }
  };

  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const exportToJSON = () => {
    if (events.length === 0) {
      showNotification('error', 'No hay eventos', 'Crea al menos un evento antes de intentar exportar tu lista.');
      return;
    }
    try {
      const jsonString = JSON.stringify(events, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = "mis_eventos_cuenta_atras.json";
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
      showNotification('success', '¡Exportación exitosa!', 'Tu archivo de respaldo se ha descargado correctamente.');
    } catch {
      showNotification('error', 'Error al exportar', 'Ocurrió un problema inesperado al generar el archivo JSON.');
    }
  };

  const importFromJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedEvents = JSON.parse(text);

      if (!Array.isArray(importedEvents)) {
        showNotification('error', 'Formato inválido', 'El archivo seleccionado no contiene una lista válida.');
        return;
      }

      const sanitizedImported = importedEvents.map((ev, index) => {
        let normalizedDate = new Date().toISOString().slice(0, 16);

        if (ev.date) {
          normalizedDate = ev.date.includes('T') ? ev.date : `${ev.date}T00:00`;
        }

        return {
          id: ev.id ? ev.id.toString() : (Date.now() + index).toString(),
          title: ev.title || 'Evento importado',
          date: normalizedDate,
          image: ev.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=60'
        };
      });

      const newEvents = sanitizedImported.filter((importedEv) => {
        const alreadyExists = events.some((currentEv) =>
          currentEv.title.trim().toLowerCase() === importedEv.title.trim().toLowerCase() &&
          currentEv.date === importedEv.date
        );
        return !alreadyExists;
      });

      if (newEvents.length === 0) {
        showNotification(
          'success',
          'Sin novedades',
          'Todos los eventos del archivo ya existen en este dispositivo. No se ha modificado nada.'
        );
        return;
      }

      const updatedEvents = [...events, ...newEvents];

      setEvents(updatedEvents);
      setSelectedEvent(null);

      showNotification(
        'success',
        '¡Fusión completada!',
        `Se han añadido ${newEvents.length} eventos nuevos. Los eventos duplicados han sido ignorados de forma segura.`
      );
    } catch {
      showNotification('error', 'Error de lectura', 'El archivo JSON está corrupto o es inválido.');
    } finally {
      e.target.value = '';
    }
  };

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
            <button type="button" className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-serif flex items-center justify-center cursor-help group-hover:bg-slate-700 group-hover:text-slate-200 transition">
              i
            </button>
            <div className="pointer-events-none absolute right-0 top-8 z-9999 w-60 p-3 bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition duration-200 leading-relaxed">
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
                onClick={() => setSelectedEvent(event)}
                isSelected={selectedEvent?.id === event.id}
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

      {/* Modal del Formulario */}
      <EventForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAddEvent={addEvent}
      />
      {/* 🎯 MODAL PERSONALIZADO DE CONFIRMACIÓN DE BORRADO TOTAL */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-left">

            {/* Botón de Aspa para cerrar */}
            <button
              type="button"
              onClick={() => setIsDeleteAllModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            {/* Cabecera de Alerta */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-950/50 border border-red-900/40 rounded-xl text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-400">
                ¿Eliminar todo?
              </h3>
            </div>

            {/* Cuerpo del Mensaje */}
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Estás a punto de borrar <span className="text-red-400 font-semibold">todos los eventos</span> creados en la aplicación. Esta acción vaciará el almacenamiento local y no se puede deshacer.
            </p>

            {/* Botones de Acción integrados */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAll}
                className="flex-1 py-3 bg-linear-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-red-500/20 active:scale-[0.98] cursor-pointer text-center"
              >
                Sí, vaciar todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista Detalle */}
      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={deleteEvent}
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
    </div>


  );
}