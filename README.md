# Cuenta Atrás Eventos

Una aplicación web para crear y seguir eventos importantes con cuentas atrás en tiempo real. Permite guardar eventos localmente, gestionar su información e importar o exportar listas en JSON.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript)

## ✨ ¿Qué puedes hacer con esta app?

- Crear eventos personalizados con título, fecha e imagen
- Buscar automáticamente una imagen en Wikipedia cuando no se proporciona una URL
- Ver un contador regresivo en tiempo real para cada evento y elegir si cuenta los fines de semana
- Guardar tus eventos de forma local en el navegador
- Exportar e importar datos en formato JSON para moverlos entre dispositivos
- Editar y eliminar eventos individualmente o vaciar la lista completa
- Acceder a importar y exportar desde un desplegable; el borrado de todos los eventos permanece visible y requiere confirmación
- Disfrutar de una interfaz responsive y visualmente cuidada
- Usar una interfaz fluida en móviles, tabletas y escritorio, con tarjetas y contadores que se reorganizan según el ancho disponible
- Recibir notificaciones claras para acciones importantes como importación o exportación
- Navegar por los diálogos y controles con teclado y recibir etiquetas descriptivas para tecnologías de asistencia

El interruptor «Contar fines de semana» aplica globalmente tanto a las tarjetas del panel como a la vista de detalle. Activado (opción predeterminada), el contador incluye todos los días; desactivado, no contabiliza sábados ni domingos.

## 🛠️ Tecnologías empleadas

- React 19
- Vite 8
- JavaScript moderno
- Tailwind CSS 4 y diseño responsive
- LocalStorage para persistencia de datos
- Vitest, React Testing Library y Playwright para pruebas automatizadas

## 🚀 Cómo empezar

### Requisitos

- Node.js `^20.19.0` o `>=22.12.0` (requisito declarado en `package.json`)
- npm

### Instalación

```bash
git clone https://github.com/IvanVeranoV/CuentaAtrasEventos.git
cd CuentaAtrasEventos
npm ci
```

Esto instala las dependencias JavaScript del proyecto. Requisitos y detalles: [DEPENDENCIES.md](./DEPENDENCIES.md).

### Ejecutar en modo desarrollo

```bash
npm run dev
```

Abre la URL que aparezca en la terminal para ver la aplicación en tu navegador.

### Generar una build de producción

```bash
npm run build
```

### Ejecutar las pruebas automatizadas

Las pruebas unitarias y de integración no requieren navegador adicional. Para ejecutar la suite E2E, primero instala Chromium dentro del proyecto:

```bash
npm run setup:browsers
```

Después puedes ejecutar las pruebas por capa o todas juntas:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:all
```

Las pruebas están agrupadas en `tests/unit`, `tests/integration` y `tests/e2e`. Las unitarias e integración se ejecutan con Vitest y React Testing Library en jsdom; E2E usa Playwright y Chromium en `node_modules/playwright-core/.local-browsers`. La suite E2E también comprueba la cuadrícula en anchos móvil, tableta y escritorio, y que el formulario y la vista de detalle no causen desbordamiento horizontal en un móvil estrecho. `npm test` ejecuta todas las pruebas Vitest; `npm run test:all` ejecuta Vitest y Playwright.

“Regresión” describe el propósito de una prueba, no una capa técnica independiente: una regresión puede comprobarse con una prueba unitaria, de integración o E2E. Los casos existentes de persistencia, IDs, datos corruptos y accesibilidad están en sus respectivas capas y protegen esos comportamientos.

## ♿ Accesibilidad

Los diálogos gestionan el foco inicial, el ciclo de tabulación, el cierre con Escape y la devolución del foco al cerrarse. Los controles y mensajes incluyen nombres o descripciones accesibles, y los avisos de éxito permanecen visibles hasta que se cierran explícitamente. La interfaz también respeta la preferencia del sistema para reducir movimiento.

Las pruebas de integración cubren el acceso por teclado a la información de sincronización y la navegación por teclado en la vista de detalle. Estas medidas no representan por sí solas una certificación de conformidad WCAG; para ello se requieren auditorías adicionales, incluidas pruebas con tecnologías de asistencia.

## 📁 Estructura del proyecto

```text
src/
├── components/
├── hooks/
├── utils/
├── App.jsx
├── App.css
├── index.css
└── main.jsx
tests/
├── unit/
│   ├── countdown.test.js
│   ├── eventIds.test.js
│   └── searchEventImage.test.js
├── integration/
│   └── App.test.jsx
└── e2e/
    └── events.spec.js
playwright.config.js
DEPENDENCIES.md
```

## 🎯 Flujo de uso

1. En el panel, activa o desactiva «Contar fines de semana» para elegir si las cuentas atrás incluyen sábados y domingos. El ajuste se aplica al panel y al detalle del evento.
2. Añade un evento y define su nombre y fecha; la hora y la URL de la imagen son opcionales.
3. Si no indicas una imagen, la aplicación intenta buscarla automáticamente y usa una imagen de respaldo si no encuentra ninguna.
4. Consulta la cuenta atrás, edita o elimina el evento desde su detalle.
5. Importa o exporta eventos como JSON para combinarlos o moverlos entre dispositivos. Los datos principales se guardan en el almacenamiento local del navegador.

## 🌟 Estado del proyecto

Este proyecto se encuentra en desarrollo activo y está orientado a ofrecer una solución simple, útil y visual para organizar los momentos más importantes.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si tienes ideas, mejoras o encuentras algún problema, puedes abrir un issue o enviar un pull request.
