# Dependencias e instalación

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0`.
- npm (se distribuye con Node.js).
- Chromium para las pruebas end-to-end. Se instala en el proyecto con el comando de abajo.

Las dependencias JavaScript y sus versiones quedan declaradas en `package.json` y bloqueadas en `package-lock.json`.

## Preparar el proyecto desde un clon

```bash
npm ci
npm run setup:browsers
```

`setup:browsers` instala el Chromium requerido por Playwright bajo `node_modules/playwright-core/.local-browsers`, en vez de la caché global/local del usuario. No instala Chromium como navegador del sistema.

## Comprobar que todo funciona

```bash
npm run lint
npm run build
npm run test:all
```

`test:all` ejecuta las pruebas unitarias y de integración con Vitest y las end-to-end con Playwright. `npm run test:unit`, `npm run test:integration` y `npm run test:e2e` permiten ejecutar cada capa por separado. Los comandos E2E usan la misma ruta local de Chromium configurada por `setup:browsers`.
