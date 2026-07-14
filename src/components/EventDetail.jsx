import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import ConfirmModal from './ConfirmModal';

const EMPTY_TIME_LEFT = Object.freeze({ days: 0, hours: 0, minutes: 0, seconds: 0 });

export default function EventDetail({ event, onClose, onDelete }) {
  const [timeLeft, setTimeLeft] = useState(EMPTY_TIME_LEFT);
  // 🎯 ESTADO CLAVE: Controla si el modal está en proceso de cierre
  const [isClosing, setIsClosing] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const eventDate = useMemo(() => new Date(`${event.date}T00:00:00`), [event.date]);

  const formattedDate = useMemo(() =>
    eventDate.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }), [eventDate]
  );

  useEffect(() => {
    const calculateTime = () => {
      const difference = eventDate.getTime() - Date.now();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
        return;
      }
      setTimeLeft(EMPTY_TIME_LEFT);
    };

    calculateTime();
    const timer = window.setInterval(calculateTime, 1000);
    return () => window.clearInterval(timer);
  }, [eventDate]);

  const runDetailTransition = () => {
    document.startViewTransition(() => {
      flushSync(() => {
        onClose();
      });
    });
  };

  const handleTransitionClose = () => {
    if (!document.startViewTransition) {
      onClose();
      return;
    }

    // 1. Avisamos que se va a cerrar para preparar los estilos mutuos
    setIsClosing(true);

    // 2. Esperamos un frame para que el navegador capture la transición
    requestAnimationFrame(runDetailTransition);
  };

  const handleConfirmDelete = () => {
    setIsConfirmOpen(false);
    onDelete(event.id);
  };

  return (
    <div
      style={{ viewTransitionName: isClosing ? 'none' : `card-${event.id}` }}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 text-white overflow-y-auto"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-sm scale-105 pointer-events-none"
        style={{ backgroundImage: `url(${event.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950 pointer-events-none" />

      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 pt-8 flex justify-between items-center">
        <button
          type="button"
          onClick={handleTransitionClose}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 transition backdrop-blur-md rounded-xl border border-white/10 font-medium text-sm"
        >
          ← Volver al panel
        </button>
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className="text-rose-400 hover:text-rose-300 font-medium text-sm transition px-3 py-2 rounded-lg hover:bg-rose-500/10"
        >
          Eliminar
        </button>
      </header>

      <main className="relative z-10 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center text-center my-auto">
        <span className="text-cyan-400 font-bold tracking-widest uppercase text-xs sm:text-sm bg-cyan-400/10 px-4 py-1.5 rounded-full mb-6">
          Tiempo Restante
        </span>

        <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tight max-w-2xl leading-tight">
          {event.title}
        </h1>

        <p className="text-slate-400 text-base sm:text-lg mb-12 font-medium">
          {formattedDate}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl">
          {[
            { label: 'Días', value: timeLeft.days },
            { label: 'Horas', value: timeLeft.hours },
            { label: 'Minutos', value: timeLeft.minutes },
            { label: 'Segundos', value: timeLeft.seconds },
          ].map((time) => (
            <div
              key={time.label}
              className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl transition hover:border-white/20"
            >
              <span className="block text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                {String(time.value).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-cyan-400/80 uppercase tracking-widest mt-2 block">
                {time.label}
              </span>
            </div>
          ))}
        </div>
      </main>

      <div className="h-20 w-full pointer-events-none" />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        eventTitle={event.title}
      />
    </div>
  );
}