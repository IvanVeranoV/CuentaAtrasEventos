import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export default function EventCard({ event, onClick, isSelected }) {
  const [daysLeft, setDaysLeft] = useState(0);
  const [clicked, setClicked] = useState(false);

  // 🎯 SOLUCIÓN SONARQUBE: En lugar de un useEffect, derivamos el estado real en cada render.
  // Si la tarjeta ya no está seleccionada de forma global, "clicked" se apaga en caliente.
  const isCurrentlyClicked = isSelected ? false : clicked;

  useEffect(() => {
    const calculateDaysLeft = () => {
      const targetDate = event.date.includes('T') ? event.date : `${event.date}T00:00`;
      const difference = new Date(targetDate) - Date.now();
      const absDiff = Math.abs(difference);
      const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
      setDaysLeft(days);
    };

    calculateDaysLeft();
    const intervalId = window.setInterval(calculateDaysLeft, 60_000);
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

    // 1. Apagamos el nombre localmente justo antes de que empiece la animación
    setClicked(true);

    // 2. Esperamos al siguiente frame para asegurar que el navegador capture el DOM sin el ID duplicado
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
      {/* 🎯 SOLUCIÓN: Usar una etiqueta <img> con carga diferida (lazy loading) */}
      {/* Esto evita que el navegador bloquee la pestaña esperando a que la imagen se descargue */}
      <img
        src={event.image}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105"
      />

      {/* Capas de gradiente estéticas */}
      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/40 to-transparent" />

      {/* Contenido en la tarjeta */}
      <div className="relative p-6 z-10 w-full space-y-2">
        <span className="inline-block bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-cyan-300 border border-white/10">
          {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <h3 className="text-2xl font-bold text-white tracking-wide line-clamp-2">
          {event.title}
        </h3>
        <p className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400">
          {daysLeft} <span className="text-sm font-medium text-slate-300 tracking-normal">días restantes</span>
        </p>
      </div>
    </button>
  );
}