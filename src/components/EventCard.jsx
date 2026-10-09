import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { getBusinessCountdownParts, getCountdownParts } from '../utils/countdown';

export default function EventCard({ event, onClick, isSelected, countWeekends = true }) {
  // 🎯 Estado estructurado para almacenar los días y si la fecha ya pasó
  const [timeData, setTimeData] = useState({ days: 0, isPast: false });
  const [clicked, setClicked] = useState(false);

  // 🎯 SOLUCIÓN SONARQUBE: Derivamos el estado real en cada render.
  const isCurrentlyClicked = isSelected ? false : clicked;
  const isSingleDay = timeData.days === 1;
  const dayLabel = isSingleDay ? 'día' : 'días';
  const dayStatus = timeData.isPast
    ? (isSingleDay ? 'transcurrido' : 'transcurridos')
    : (isSingleDay ? 'restante' : 'restantes');

  useEffect(() => {
    const calculateTime = () => {
      const targetDate = event.date.includes('T') ? event.date : `${event.date}T00:00`;
      const getParts = countWeekends ? getCountdownParts : getBusinessCountdownParts;
      const { days, isPast } = getParts(new Date(targetDate));
      setTimeData({ days, isPast });
    };

    calculateTime();
    const intervalId = window.setInterval(calculateTime, 60_000);
    return () => window.clearInterval(intervalId);
  }, [event.date, countWeekends]);

  const runCardTransition = () => {
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        onClick();
      });
    });
    transition.finished.then(
      () => setClicked(false),
      () => setClicked(false)
    );
  };

  const handleTransitionClick = () => {
    if (!document.startViewTransition) {
      onClick();
      return;
    }

    setClicked(true);
    requestAnimationFrame(runCardTransition);
  };

  return (
    <button
      type="button"
      onClick={handleTransitionClick}
      aria-label={`Abrir detalles de ${event.title}. ${timeData.days} ${dayLabel} ${dayStatus}`}
      style={{ viewTransitionName: (isSelected || isCurrentlyClicked) ? 'none' : `card-${event.id}` }}
      className="event-card relative group h-96 w-full rounded-3xl overflow-hidden bg-app-bg shadow-xl shadow-black/40 cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/60 border border-white/10 text-left flex flex-col justify-end"
    >
      <img
        src={event.image}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105"
      />

      <span className="relative z-10 block w-full space-y-2 p-6">
        <span className={`inline-block border backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold ${timeData.isPast
            ? 'bg-amber-950/40 border-amber-800/40 text-amber-300'
            : 'bg-white/10 border-white/10 text-cyan-300'
          }`}>
          {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>

        <span role="heading" aria-level="2" className="block text-2xl font-bold text-white tracking-wide line-clamp-2">
          {event.title}
        </span>

        <span className="block">
          <span className={`countdown-number ${timeData.isPast ? 'countdown-number--past' : 'countdown-number--future'}`}>
            {timeData.days}
          </span>{' '}
          <span className="font-sans text-sm font-medium text-slate-300 tracking-normal">
            {dayLabel} {dayStatus}
          </span>
        </span>
      </span>
    </button>
  );
}