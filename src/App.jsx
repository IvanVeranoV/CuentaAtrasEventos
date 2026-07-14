import { useState, useEffect, useRef } from 'react';
import EventForm from './components/EventForm';
import EventCard from './components/EventCard';
import EventDetail from './components/EventDetail';
import NotificationModal from './components/NotificationModal'; // 🎯 Importamos el nuevo modal

export default function App() {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('countdown_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const fileInputRef = useRef(null);

  // 🎯 Estado para controlar las alertas personalizadas
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success', // 'success' o 'error'
    title: '',
    message: ''
  });

  // Guardar en localStorage de manera local automática
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

  // Función auxiliar para abrir el modal de notificación de forma limpia
  const showNotification = (type, title, message) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  };

  // 🎯 EXPORTAR DATOS A UN ARCHIVO JSON
  const exportToJSON = () => {
    if (events.length === 0) {
      showNotification(
        'error',
        'No hay eventos',
        'Crea al menos un evento antes de intentar exportar tu lista.'
      );
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

      // Limpieza de memoria
      downloadAnchor.remove();
      URL.revokeObjectURL(url);

      // Notificación de éxito
      showNotification(
        'success',
        '¡Exportación exitosa!',
        'Tu archivo "mis_eventos_cuenta_atras.json" se ha descargado correctamente.'
      );
    } catch {
      showNotification(
        'error',
        'Error al exportar',
        'Ocurrió un problema inesperado al generar el archivo JSON.'
      );
    }
  };

  // 🎯 IMPORTAR DATOS DESDE UN ARCHIVO JSON
  const importFromJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileText = await file.text();
      const importedEvents = JSON.parse(fileText);

      // Validación estricta
      if (!Array.isArray(importedEvents)) {
        showNotification(
          'error',
          'Formato inválido',
          'El archivo seleccionado no contiene una lista válida de eventos.'
        );
        return;
      }

      const sanitizedEvents = importedEvents.map((ev, index) => ({
        id: ev.id ? ev.id.toString() : (Date.now() + index).toString(),
        title: ev.title || "Evento importado",
        date: ev.date || new Date().toISOString().split('T')[0],
        image: ev.image || "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=60"
      }));

      setEvents(sanitizedEvents);
      setSelectedEvent(null);

      // Notificación de éxito
      showNotification(
        'success',
        '¡Importación completada!',
        `Se han importado con éxito ${sanitizedEvents.length} eventos a tu dispositivo.`
      );
    } catch {
      showNotification(
        'error',
        'Error de lectura',
        'Asegúrate de que el archivo JSON no esté corrupto y tenga la estructura correcta.'
      );
    } finally {
      e.target.value = ""; // Resetear input
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      {/* Hero Section */}
      <header className="py-12 text-center bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-3">
          Mis Cuentas Atrás
        </h1>
        <p className="text-slate-400 text-lg">No te pierdas ni un solo momento especial.</p>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Panel de Formulario y Backup */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-6 space-y-6">
              <EventForm onAddEvent={addEvent} />

              {/* Panel de Sincronización JSON */}
              <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-cyan-400 tracking-wider uppercase">Sincronizar Dispositivos</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Exporta tus eventos a un archivo JSON para poder importarlos en tu móvil u otro navegador.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={exportToJSON}
                    className="py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl text-xs transition active:scale-95 cursor-pointer flex justify-center items-center gap-1 border border-slate-600"
                  >
                    💾 Exportar
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="py-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 font-semibold rounded-xl text-xs transition active:scale-95 cursor-pointer flex justify-center items-center gap-1 border border-cyan-500/30"
                  >
                    📂 Importar
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={importFromJSON}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Grid de Tarjetas */}
          <div className="lg:col-span-3">
            {events.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-2xl">
                <p className="text-slate-500 text-lg">Aún no has añadido ningún evento. ¡Empieza creando uno o importa un archivo JSON!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
          </div>
        </div>
      </main>

      {/* Vista Detalle */}
      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={deleteEvent}
        />
      )}

      {/* 🎯 NUEVO: Modal de Notificación para Importación/Exportación */}
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