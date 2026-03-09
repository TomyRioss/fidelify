# Project Instructions for Claude

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

## General
- La interfaz debe ser monocromatica con blanco ligeramente grisaceo (cerca de beige) como color principal.
- Nunca realizar diseños utilizando SVG si no fue explicitamente requerido.
- Siempre ser concreto y directo. Respuestas verbosas son inaceptables.
- Nunca hacer mas de lo que se pidio. Seguir los requerimientos al pie de la letra.
- Siempre explicar que se quiere hacer, que va a resolver y como, antes de proponer un plan.
