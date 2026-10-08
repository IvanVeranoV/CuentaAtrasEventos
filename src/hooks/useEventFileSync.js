import { useLayoutEffect, useRef } from 'react';
import { MAX_IMPORT_FILE_SIZE, MAX_IMPORTED_EVENTS } from '../utils/constants';
import { getUniqueEventId } from '../utils/eventIds';

export default function useEventFileSync({
  events,
  setEvents,
  setSelectedEventId,
  showNotification,
  getSafeImageUrl
}) {
  const fileInputRef = useRef(null);
  const currentEventsRef = useRef(events);

  useLayoutEffect(() => {
    currentEventsRef.current = events;
  }, [events]);

  const exportToJSON = () => {
    if (events.length === 0) {
      showNotification('error', 'No hay eventos', 'Crea al menos un evento antes de intentar exportar tu lista.');
      return;
    }

    try {
      const jsonString = JSON.stringify(events, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = 'mis_eventos_cuenta_atras.json';
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
      if (file.size > MAX_IMPORT_FILE_SIZE) {
        showNotification('error', 'Archivo demasiado grande', 'El archivo JSON no puede superar 1 MB.');
        return;
      }

      const text = await file.text();
      const importedEvents = JSON.parse(text);

      if (!Array.isArray(importedEvents)) {
        showNotification('error', 'Formato inválido', 'El archivo seleccionado no contiene una lista válida.');
        return;
      }

      if (importedEvents.length > MAX_IMPORTED_EVENTS) {
        showNotification('error', 'Demasiados eventos', `El archivo no puede contener más de ${MAX_IMPORTED_EVENTS} eventos.`);
        return;
      }

      const currentEvents = currentEventsRef.current;
      const usedIds = new Set(currentEvents
        .filter((event) => event.id !== null && event.id !== undefined)
        .map((event) => String(event.id)));
      const sanitizedImported = importedEvents.map((event, index) => {
        let normalizedDate = new Date().toISOString().slice(0, 16);

        if (event && typeof event.date === 'string' && !Number.isNaN(Date.parse(event.date))) {
          normalizedDate = event.date.includes('T') ? event.date : `${event.date}T00:00`;
        }

        const baseId = event?.id ? event.id.toString().slice(0, 100) : (Date.now() + index).toString();
        const id = getUniqueEventId(baseId, usedIds);

        return {
          id,
          title: typeof event?.title === 'string' && event.title.trim()
            ? event.title.trim().slice(0, 120)
            : 'Evento importado',
          date: normalizedDate,
          image: getSafeImageUrl(event?.image)
        };
      });

      const eventKeys = new Set(currentEvents
        .filter((event) => typeof event.title === 'string')
        .map((event) => JSON.stringify([event.title.trim().toLowerCase(), event.date])));
      const newEvents = sanitizedImported.filter((event) => {
        const eventKey = JSON.stringify([event.title.trim().toLowerCase(), event.date]);
        if (eventKeys.has(eventKey)) return false;

        eventKeys.add(eventKey);
        return true;
      });

      if (newEvents.length === 0) {
        showNotification(
          'success',
          'Sin novedades',
          'Todos los eventos del archivo ya existen en este dispositivo. No se ha modificado nada.'
        );
        return;
      }

      setEvents([...currentEvents, ...newEvents]);
      setSelectedEventId(null);
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

  return { fileInputRef, exportToJSON, importFromJSON };
}
