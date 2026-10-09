import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../../src/App';

const STORAGE_KEY = 'countdown_events';
const TEST_IMAGE = 'https://example.test/event.jpg';

const createStoredEvent = (overrides = {}) => ({
  id: 'event-1',
  title: 'Evento de prueba',
  date: '2030-01-01T12:00',
  image: TEST_IMAGE,
  ...overrides
});

const createEventFromForm = async (title) => {
  fireEvent.click(screen.getByRole('button', { name: /Añadir Evento/ }));
  fireEvent.change(screen.getByLabelText('Nombre del evento'), {
    target: { value: title }
  });
  fireEvent.change(screen.getByLabelText(/Fecha/), {
    target: { value: '2035-01-01' }
  });
  fireEvent.change(screen.getByLabelText(/Hora/), {
    target: { value: '12:00' }
  });
  fireEvent.change(screen.getByLabelText(/URL de la Imagen/), {
    target: { value: TEST_IMAGE }
  });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar', exact: true }));
  await screen.findByRole('button', { name: `Abrir detalles de ${title}` });
};

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{}]);
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('persistencia e IDs de eventos', () => {
  it('repara IDs repetidos sin colisionar con IDs reservados al cargar', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      createStoredEvent({ id: 'repetido', title: 'Evento A' }),
      createStoredEvent({ id: 'repetido', title: 'Evento B' }),
      createStoredEvent({ id: 'repetido-1', title: 'Evento C' })
    ]));

    render(<App />);

    await waitFor(() => {
      const storedEvents = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(storedEvents.map((event) => event.id)).toEqual([
        'repetido',
        'repetido-2',
        'repetido-1'
      ]);
    });
  });

  it('genera IDs distintos en altas consecutivas aunque coincida el reloj', async () => {
    const timestamp = 1234567890000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      createStoredEvent({ id: `${timestamp}-0` })
    ]));
    vi.spyOn(Date, 'now').mockReturnValue(timestamp);

    render(<App />);
    await createEventFromForm('Alta uno');
    await createEventFromForm('Alta dos');

    await waitFor(() => {
      const ids = JSON.parse(localStorage.getItem(STORAGE_KEY))
        .map((event) => event.id);
      expect(ids).toEqual([
        `${timestamp}-0`,
        `${timestamp}-0-1`,
        `${timestamp}-1`
      ]);
    });
  });

  it('no sobrescribe los eventos guardados al importar un JSON corrupto', async () => {
    const savedEvents = [createStoredEvent()];
    const savedJson = JSON.stringify(savedEvents);
    localStorage.setItem(STORAGE_KEY, savedJson);

    const { container } = render(<App />);
    const fileInput = container.querySelector('input[type="file"]');
    const corruptFile = new File(['{'], 'eventos.json', { type: 'application/json' });
    Object.defineProperty(corruptFile, 'text', {
      value: vi.fn().mockResolvedValue('{')
    });

    fireEvent.change(fileInput, { target: { files: [corruptFile] } });

    expect(await screen.findByRole('dialog', { name: 'Error de lectura' })).toBeTruthy();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(savedJson);
  });

  it('no sobrescribe el almacenamiento dañado al iniciar la aplicación', async () => {
    localStorage.setItem(STORAGE_KEY, '{');

    render(<App />);

    expect(await screen.findByRole('dialog', { name: 'Error al cargar eventos' })).toBeTruthy();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{');
  });
});

describe('accesibilidad del formulario modal', () => {
  it('cierra el formulario con Escape, conserva el detalle y devuelve el foco a Editar', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      createStoredEvent({ id: 'edit-1', title: 'Evento editable' })
    ]));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir detalles de Evento editable' }));
    const editButton = screen.getByRole('button', { name: 'Editar' });
    editButton.focus();
    fireEvent.click(editButton);

    expect(await screen.findByRole('dialog', { name: 'Editar Evento' })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Nombre del evento'));
    expect(document.querySelector('[aria-labelledby="event-detail-title"]')
      .getAttribute('aria-hidden')).toBe('true');

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Editar Evento' })).toBeNull();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Editar' }));
    });
    expect(screen.getByRole('dialog', { name: 'Evento editable' })).toBeTruthy();
  });
});
