import { useState, useEffect } from 'react';
import EventForm from './components/EventForm';
import EventCard from './components/EventCard';
import EventDetail from './components/EventDetail';

export default function App() {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('countdown_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedEvent, setSelectedEvent] = useState(null);

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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      <header className="py-12 text-center bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-3">
          Mis Cuentas Atrás
        </h1>
        <p className="text-slate-400 text-lg">No te pierdas ni un solo momento especial.</p>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <EventForm onAddEvent={addEvent} />
            </div>
          </div>

          <div className="lg:col-span-3">
            {events.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-2xl">
                <p className="text-slate-500 text-lg">Aún no has añadido ningún evento. ¡Empieza creando uno!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
}