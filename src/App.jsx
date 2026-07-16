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

      const sanitizedImported = importedEvents.map((ev, index) => ({
        id: ev.id ? ev.id.toString() : (Date.now() + index).toString(),
        title: ev.title || 'Evento importado',
        date: ev.date || new Date().toISOString().split('T')[0],
        image: ev.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=60'
      }));

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
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-6 flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-slate-900 mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500">
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
            <div className="pointer-events-none absolute right-0 top-8 w-60 p-3 bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition duration-200 z-30 leading-relaxed">
              <span className="font-bold text-slate-200 block mb-1">Sincronización Portátil</span>
              <span className="text-white">Usa Exportar</span> para guardar tus eventos en un archivo. Pásalo a tu móvil u otro navegador e indícalo en <span className="text-white">Importar</span> para verlos ahí.
            </div>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={importFromJSON} accept=".json" className="hidden" />
      </header>

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
          className="px-6 py-4 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:via-indigo-400 hover:to-purple-500 text-white font-black rounded-2xl shadow-2xl shadow-indigo-500/30 transition hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer text-sm tracking-wide uppercase"
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