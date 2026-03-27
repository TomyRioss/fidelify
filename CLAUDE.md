# Project Instructions for Claude

## Fallbacks
- Never use hardcoded fallback values (e.g. `?? "Mi Negocio"`, `|| "default"`). If data is loading, show a spinner. If data is missing, show nothing or an explicit error state.

## Error Handling
- All errors must be caught and handled explicitly.
- Every error must produce both console feedback (descriptive log) and visual feedback to the user (toast, alert, inline message, or equivalent UX/UI element).
- Never silently swallow errors.

## Third-Party Libraries
- Before implementing custom logic or UI solutions, always research whether a well-maintained third-party library exists that solves the problem.
- Propose the library option to the user before proceeding with a custom implementation.

## UI Components
- Always use shadcn/ui for general-purpose prebuilt components (buttons, dialogs, inputs, tables, etc.).
- Do not build custom versions of components that shadcn already provides.

## Icons
- Always use `react-icons` for all icons. No other icon library is permitted.
- Never use inline SVGs for icons unless explicitly requested.
- Import icons from the appropriate react-icons sub-package (e.g., `react-icons/fi`, `react-icons/md`).

## Styling
- Always use TailwindCSS for all styling.
- Never write raw/plain CSS.
- Never modify `global.css`.

## Database
- Never make database or Prisma changes without explicit user consent.
- Always ask the user before touching any schema, migration, seed, or query.
- Only proceed after receiving a clear, explicit confirmation message from the user.

## Responsive Design
- All UI must be designed mobile-first and fully responsive for both mobile and desktop viewports.
- Test layout decisions against both screen sizes before finalizing.

## Architecture
- Follow MVC methodology and modular component structure.
- Separate concerns: models, controllers/services, and views/components must be clearly distinct.
- Keep components focused and single-purpose.

## Component Size Limit
- No component or file may exceed 500 lines.
- If a component grows beyond this limit, split it into smaller, focused subcomponents or modules.

## Researching Unknown Problems
- For any unfamiliar problem (technical, library-specific, or architectural), always search for information online before proposing a solution.
- Reference sources such as Stack Overflow, Reddit (r/reactjs, r/nextjs, r/webdev, etc.), GitHub Issues, and official documentation.
- Summarize findings before implementing.

## Color & Visual Design
- La paleta es estrictamente: blanco, negro, naranja y grises.
- Color de acento: naranja (usar variantes claras/oscuros según contexto)
- Jerarquía de colores para UX/UI:
  - Fondos principales: blanco (`white`) o naranja muy claro (`orange-50`)
  - Fondos secundarios / cards: `orange-50` o `neutral-50`
  - Bordes y separadores: `orange-200`
  - Texto secundario / placeholders: `neutral-400` – `neutral-500`
  - Texto principal: `neutral-800` – `neutral-900`
  - Acciones primarias (botones CTA): fondo `orange-600`, texto `white`, hover `orange-500`
  - Acciones secundarias: borde `orange-300`, texto `neutral-700`
  - Elementos destacados: `orange-500` (links, iconos, badges)
- Mantener contraste suficiente en cada combinación fondo/texto para garantizar legibilidad (mínimo ratio 4.5:1 para texto normal).
- Nunca usar otros colores de acento (azul, verde, rojo, etc.) salvo para estados de error/destructivo donde sea semánticamente necesario.
- **Inputs y formularios**:
  - Fondo: `bg-white`
  - Texto ingresado: `text-neutral-900` (siempre visible)
  - Placeholder: `placeholder:text-neutral-400` (gris claro, nunca igual al texto real)
  - Borde normal: `border-neutral-300` o `border-orange-200`
  - Borde focus: naranja (`focus-visible:border-orange-400` o similar)
  - Labels: `text-neutral-700` mínimo (nunca `text-neutral-400` ni `text-muted`)
- **Botones secundarios / cancelar**: fondo `bg-white`, borde `border-orange-300`, texto `text-neutral-700`, hover `hover:bg-orange-50 hover:text-orange-600`. Nunca usar `variant="outline"` del componente Button sin sobrescribir sus clases, ya que el tema base puede renderizarlo con fondo oscuro.

## Layout & Spacing
- El contenido principal de cada página debe ocupar el 100% del ancho disponible del área de trabajo.

## Routing & Modals
- **EVITAR A TODA COSTA EL USO DE MODALES/DIALOGS**: Usar subrutas en su lugar para crear, editar, eliminar o asignar elementos.
- Para acciones de CRUD:
  - Crear nuevo: `/dashboard/[seccion]/new` o `/admin/dashboard/[seccion]/new`
  - Editar: `/dashboard/[seccion]/[id]/edit` o `/admin/dashboard/[seccion]/[id]/edit`
  - Eliminar: `/dashboard/[seccion]/[id]/delete` o `/admin/dashboard/[seccion]/[id]/delete` (página de confirmación)
  - Asignar: `/dashboard/[seccion]/[id]/asignar` (ej: cupones a clientes)
- Los modales rompen la navegación del browser (botón atrás no funciona) y no tienen URLs compartibles.
- Las subrutas permiten navegación completa con soporte de back/forward y URLs compartibles.
- Nunca usar `max-w-*` con `mx-auto` ni márgenes laterales que encapsulen o "floten" la funcionalidad principal en un contenedor centrado con espacio a los lados.
- Las cards, tablas y paneles principales deben extenderse de borde a borde del área de contenido.
- Solo se permite limitar el ancho en elementos internos secundarios (ej: formularios dentro de dialogs, campos de input individuales).

## General
- Nunca realizar diseños utilizando SVG si no fue explicitamente requerido.
- Siempre ser concreto y directo. Respuestas verbosas son inaceptables.
- Nunca hacer mas de lo que se pidio. Seguir los requerimientos al pie de la letra.
- Siempre explicar que se quiere hacer, que va a resolver y como, antes de proponer un plan.
