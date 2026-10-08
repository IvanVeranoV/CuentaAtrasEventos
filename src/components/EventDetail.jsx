import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import ConfirmModal from './ConfirmModal';
import { getCountdownParts } from '../utils/countdown';
import useDialogAccessibility from '../hooks/useDialogAccessibility';

export default function EventDetail({ event, onClose, onDelete, onEdit, isModalActive = true }) {
  const [timeLeft, setTimeLeft] = useState({
    isPast: false,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  // 🎯 ESTADO CLAVE: Controla si el modal está en proceso de cierre
  const [isClosing, setIsClosing] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const isDialogActive = isModalActive && !isConfirmOpen;

  const eventDate = useMemo(() => new Date(event.date), [event.date]);

  const formattedDate = useMemo(() => {
    const dateText = eventDate.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const timeText = eventDate.toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit'
    });
    return `${dateText} a las ${timeText}`;
  }, [eventDate]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const calculateTime = () => {
      setTimeLeft(getCountdownParts(eventDate));
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => {
      document.body.style.overflow = '';
      clearInterval(timer);
    };
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

  const dialogRef = useDialogAccessibility({
    isOpen: true,
    isActive: isDialogActive,
    onClose: handleTransitionClose
  });

  const handleConfirmDelete = () => {
    setIsConfirmOpen(false);
    onDelete(event.id);
  };

  return (
    <>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal={isDialogActive}
        aria-hidden={isDialogActive ? undefined : true}
        aria-labelledby="event-detail-title"
        tabIndex={-1}
        style={{ viewTransitionName: isClosing ? 'none' : `card-${event.id}` }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 text-white overflow-hidden"
      >
      <img
        src={event.image}
        alt=""
        loading="eager" // Aquí usamos eager para que intente mostrarse de inmediato al abrir el detalle
        decoding="async"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover filter z-0 scale-105 pointer-events-none"
      />

      <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/40 to-slate-950 pointer-events-none" />

      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 pt-8 flex justify-between items-center">
        <button
          type="button"
          onClick={handleTransitionClose}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 transition backdrop-blur-md rounded-xl border border-white/10 font-medium text-sm"
        >
          ← Volver al panel
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(event)}
            className="text-white hover:text-white/80 transition px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md rounded-xl border border-white/10 font-medium text-sm"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            className="text-rose-400 hover:text-rose-300 font-medium text-sm transition px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 backdrop-blur-md rounded-xl border border-rose-500/20"
          >
            Eliminar
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center text-center my-auto">

        <h1 id="event-detail-title" className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tight max-w-2xl leading-tight">
          {event.title}
        </h1>

        <p className="text-slate-400 text-base sm:text-lg mb-12 font-medium">
          {formattedDate}
        </p>

        {/* Subtítulo dinámico */}
        <p className="text-cyan-400 sm:text-lg font-bold uppercase tracking-widest mb-12 bg-slate-950/50 px-4 py-1.5 rounded-full border border-slate-900/30 backdrop-blur-sm">
          {timeLeft.isPast ? 'Tiempo transcurrido desde el evento' : formattedDate}
        </p>

        {/* Marcadores numéricos */}
        <div className="grid grid-cols-4 gap-4 sm:gap-8 max-w-2xl w-full">
          {[
            { label: 'Días', val: timeLeft.days, key: 'days' },
            { label: 'Horas', val: timeLeft.hours, key: 'hours' },
            { label: 'Min', val: timeLeft.minutes, key: 'mins' },
            { label: 'Seg', val: timeLeft.seconds, key: 'secs' }
          ].map((item) => (
            <div key={item.key} className="flex flex-col items-center p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
              <span className={`text-3xl sm:text-6xl font-black tracking-tight font-mono text-transparent bg-clip-text ${timeLeft.isPast
                ? 'bg-linear-to-b from-amber-200 to-orange-500' // Tono cálido para eventos pasados
                : 'bg-linear-to-b from-white to-slate-400'
                }`}>
                {String(item.val).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </main>

      <div className="h-20 w-full pointer-events-none" />

      </div>
      <ConfirmModal
        isOpen={isConfirmOpen}
        isActive={isModalActive}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        eventTitle={event.title}
      />
    </>
  );
}