import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import ConfirmModal from './ConfirmModal';
import { getBusinessCountdownParts, getCountdownParts } from '../utils/countdown';
import useDialogAccessibility from '../hooks/useDialogAccessibility';

export default function EventDetail({
  event,
  onClose,
  onDelete,
  onEdit,
  isModalActive = true,
  countWeekends = true
}) {
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
      const getParts = countWeekends ? getCountdownParts : getBusinessCountdownParts;
      setTimeLeft(getParts(eventDate));
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => {
      document.body.style.overflow = '';
      clearInterval(timer);
    };
  }, [eventDate, countWeekends]);

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
        className="fixed inset-0 z-50 flex flex-col justify-between bg-app-bg text-white overflow-y-auto"
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

      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8 flex flex-wrap justify-between items-center gap-3">
        <button
          type="button"
          onClick={handleTransitionClose}
          className="max-w-full flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/10 font-medium text-xs sm:text-sm"
        >
          ← Volver al panel
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(event)}
            className="text-white hover:text-white/80 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/10 font-medium text-xs sm:text-sm"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            className="text-rose-400 hover:text-rose-300 font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 backdrop-blur-md rounded-xl border border-rose-500/20"
          >
            Eliminar
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col items-center text-center my-auto">

        <h1 id="event-detail-title" className="w-full max-w-3xl text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight break-words">
          {event.title}
        </h1>

        <p className="text-neutral-400 text-sm sm:text-base md:text-lg mb-6 font-medium">
          {formattedDate}
        </p>

        {timeLeft.isPast && (
          <p className="text-neutral-400 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-8">
            Tiempo transcurrido desde el evento
          </p>
        )}

        {/* Marcadores numéricos */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 max-w-3xl w-full">
          {[
            { label: 'Días', val: timeLeft.days, key: 'days' },
            { label: 'Horas', val: timeLeft.hours, key: 'hours' },
            { label: 'Min', val: timeLeft.minutes, key: 'mins' },
            { label: 'Seg', val: timeLeft.seconds, key: 'secs' }
          ].map((item) => (
            <div key={item.key} className="ui-glass flex min-w-0 flex-[1_1_calc(50%-0.375rem)] sm:flex-[1_1_calc(25%-1.125rem)] flex-col items-center rounded-2xl p-3 sm:p-4">
              <span className={`countdown-number ${timeLeft.isPast ? 'countdown-number--past' : 'countdown-number--future'}`}>
                {String(item.val).padStart(2, '0')}
              </span>
              <span className="countdown-label">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </main>

      <div className="min-h-12 sm:min-h-20 w-full pointer-events-none" />

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