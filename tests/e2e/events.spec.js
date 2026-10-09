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
  await page.getByRole('button', { name: /Exportar/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('mis_eventos_cuenta_atras.json');

  await page.getByRole('button', { name: 'Entendido' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Abrir detalles de Evento importado' })).toBeVisible();
});
