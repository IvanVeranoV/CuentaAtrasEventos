import { expect, test } from '@playwright/test';
import { Buffer } from 'node:buffer';

const addEvent = async (page, title) => {
  await page.getByRole('button', { name: 'Añadir Evento' }).click();
  await page.getByLabel('Nombre del evento').fill(title);
  await page.getByLabel('Fecha *').fill('2035-01-01');
  await page.getByLabel('Hora (Opcional)').fill('12:00');
  await page.getByLabel('URL de la Imagen (Opcional)').fill('https://example.test/event.jpg');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
};

test('creates, updates, persists, and deletes an event', async ({ page }) => {
  await page.goto('/');
  await addEvent(page, 'Viaje inicial');
  await expect(page.getByRole('button', { name: 'Abrir detalles de Viaje inicial' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: 'Abrir detalles de Viaje inicial' })).toBeVisible();

  await page.getByRole('button', { name: 'Abrir detalles de Viaje inicial' }).click();
  await page.getByRole('button', { name: 'Editar' }).click();
  await page.getByLabel('Nombre del evento').fill('Viaje actualizado');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await page.getByRole('button', { name: '← Volver al panel' }).click();

  const updatedEvent = page.getByRole('button', { name: 'Abrir detalles de Viaje actualizado' });
  await expect(updatedEvent).toBeVisible();
  await updatedEvent.click();
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await page.getByRole('alertdialog', { name: '¿Eliminar evento?' })
    .getByRole('button', { name: 'Eliminar evento' }).click();

  await expect(page.getByRole('button', { name: 'Abrir detalles de Viaje actualizado' })).toHaveCount(0);
  await expect(page.getByText('Tu horizonte está vacío.')).toBeVisible();
});

test('imports events and exports the saved event list', async ({ page }) => {
  await page.goto('/');
  const eventData = [{
    id: 'imported-event',
    title: 'Evento importado',
    date: '2035-02-03T10:30',
    image: 'https://example.test/imported.jpg'
  }];

  await page.locator('input[type="file"]').setInputFiles({
    name: 'events.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(eventData))
  });
  await expect(page.getByRole('dialog', { name: '¡Fusión completada!' })).toBeVisible();
  await page.getByRole('button', { name: 'Entendido' }).click();
  await expect(page.getByRole('button', { name: 'Abrir detalles de Evento importado' })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByText('Importar / exportar').click();
  await page.getByRole('button', { name: 'Exportar eventos' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('mis_eventos_cuenta_atras.json');

  await page.getByRole('button', { name: 'Entendido' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Abrir detalles de Evento importado' })).toBeVisible();
});

test('adapts the event grid, form, and detail view to narrow screens without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 680, height: 800 });
  await page.goto('/');
  const title = page.getByRole('heading', { name: 'Event Horizon' });
  const titleLines = () => title.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getClientRects().length;
  });

  expect(await titleLines()).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.setViewportSize({ width: 320, height: 640 });
  await page.reload();

  await page.getByRole('button', { name: 'Añadir Evento' }).click();
  await expect(page.getByRole('dialog', { name: 'Crear Nuevo Evento' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Cancelar' }).click();

  await addEvent(page, 'Evento móvil uno');
  await addEvent(page, 'Evento móvil dos');
  const eventGrid = page.locator('main div.grid').filter({ has: page.getByRole('button', { name: /Abrir detalles de Evento móvil uno/ }) });
  const eventCard = page.getByRole('button', { name: /Abrir detalles de Evento móvil uno/ });
  const datePill = eventCard.locator('span.rounded-full');
  const addEventButton = page.getByRole('button', { name: 'Añadir Evento' });

  await expect(eventCard).toHaveClass(/rounded-2xl/);
  await expect(datePill).toHaveClass(/bg-white\/10/);
  await expect(datePill).toHaveClass(/px-2\.5/);
  await expect(addEventButton).toHaveClass(/from-cyan-500/);
  await expect(addEventButton).toHaveClass(/via-indigo-500/);
  await expect(addEventButton).toHaveClass(/to-purple-600/);
  await expect(eventCard.locator('.countdown-number')).toHaveCSS('font-family', /JetBrains Mono/);

  const gridColumns = async () => eventGrid.evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(' ').length
  );

  expect(await gridColumns()).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.setViewportSize({ width: 640, height: 800 });
  expect(await gridColumns()).toBe(2);

  await page.setViewportSize({ width: 1024, height: 800 });
  expect(await gridColumns()).toBe(3);

  await page.setViewportSize({ width: 320, height: 640 });
  await eventCard.click();
  await expect(page.getByRole('dialog', { name: 'Evento móvil uno' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('.countdown-number').first()).toHaveCSS('font-family', /JetBrains Mono/);
});
