import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { getCountdownParts } from '../utils/countdown';

export default function EventCard({ event, onClick, isSelected }) {
  // 🎯 Estado estructurado para almacenar los días y si la fecha ya pasó
  const [timeData, setTimeData] = useState({ days: 0, isPast: false });
  const [clicked, setClicked] = useState(false);

  // 🎯 SOLUCIÓN SONARQUBE: Derivamos el estado real en cada render.
  const isCurrentlyClicked = isSelected ? false : clicked;

  useEffect(() => {
    const calculateTime = () => {
      const targetDate = event.date.includes('T') ? event.date : `${event.date}T00:00`;
      const { days, isPast } = getCountdownParts(new Date(targetDate));
      setTimeData({ days, isPast });
    };

    calculateTime();
    const intervalId = window.setInterval(calculateTime, 60_000);
    return () => window.clearInterval(intervalId);
  }, [event.date]);

  const runCardTransition = () => {
    document.startViewTransition(() => {
      flushSync(() => {
        onClick();
      });
    });
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
      aria-label={`Abrir detalles de ${event.title}`}
      style={{ viewTransitionName: (isSelected || isCurrentlyClicked) ? 'none' : `card-${event.id}` }}
      className="relative group h-96 w-full rounded-3xl overflow-hidden shadow-lg cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border border-slate-800 text-left flex flex-col justify-end bg-slate-950"
    >
      <img
        src={event.image}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/40 to-transparent" />

      <div className="relative p-6 z-10 w-full space-y-2">
        <span className={`inline-block border backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold ${timeData.isPast
            ? 'bg-amber-950/40 border-amber-800/40 text-amber-300'
            : 'bg-white/10 border-white/10 text-cyan-300'
          }`}>
          {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>

        <h3 className="text-2xl font-bold text-white tracking-wide line-clamp-2">
          {event.title}
        </h3>

        {/* 🎯 Texto y gradiente dinámicos según si el evento es futuro o pasado */}
        <p className={`text-4xl font-black text-transparent bg-clip-text ${timeData.isPast
            ? 'bg-linear-to-r from-amber-400 to-orange-400'
            : 'bg-linear-to-r from-cyan-400 to-emerald-400'
          }`}>
          {timeData.days}{' '}
          <span className="text-sm font-medium text-slate-300 tracking-normal">
            {timeData.isPast ? 'días transcurridos' : 'días restantes'}
          </span>
        </p>
      </div>
    </button>
  );
}