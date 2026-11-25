# Feature: Nivel 2B — Desacoplamiento de `features/user` y consolidación de `AuthProvider`

Objetivo: refactorizar `src/features/user` bajo el estándar aplicado en `features/auth` y completar el desacoplamiento de autenticación entre `app/providers` y `features/auth`.
Branch: `refact/global-refactorization`. Delivery: sin commits (working tree con trabajo previo sin commitear del usuario). Test runner: `npx eslint` + `npm run build` (el frontend no tiene suite de tests).

## Specs

S1. Consolidar `AuthProvider` / `useAuth` en `features/auth`:
   - "Mueve la lógica/contexto de sesión hacia `src/features/auth/` (ej. `context/` o `providers/`), haciendo que consuma `authService.me()` y `authService.logout()` en lugar de llamar a `privateClient` directo."
   - "Re-expórtalo en `src/features/auth/index.js` para que `useLoginForm` lo consuma internamente y `src/app/providers/AppProviders.jsx` (o `AuthContext.jsx` como re-export compat) lo monte sin duplicación."
   - Aceptación: no queda lógica de sesión en `src/app/`; no hay dos fuentes de verdad para el estado de sesión.

S2. Refactorizar `src/features/user`:
   - "Servicios (`services/`): Verifica que todas las llamadas HTTP de usuarios vivan exclusivamente en `src/features/user/services/` usando `privateClient`."
   - "Componentes y Páginas (`components/`, `pages/`): Divide componentes grandes o formularios en subcomponentes pequeños (contenedor vs. presentación pura). Las páginas solo deben componer el layout."
   - "Hooks y DTO/Schemas (`hooks/`, `dto/`, `schemas/`): Extrae lógica de formularios, tablas, filtros o mutaciones a custom hooks de dominio en `src/features/user/hooks/`."
   - "API Pública (`index.js`): Crea `src/features/user/index.js` exportando únicamente las páginas y piezas públicas necesarias, y actualiza los imports profundos en `src/app/routes/` (y donde se consuma `user`)."

S3. Validación final:
   - "Ejecuta `npx eslint src/features/auth src/features/user src/app` para verificar que no haya errores nuevos."
   - "Ejecuta `npm run build` para confirmar compilación limpia."

Restricciones (verbatim):
   - "NO toques `src/features/Inventario/` ni `src/features/production/` todavía."
   - "NO instales ni migres a TanStack Query todavía (Fase 2)."
   - "NO refactorices `useEffect` locales de interfaz ni el error `react-refresh/only-export-components` todavía (Fase 3)."

## Tasks

- T1 — Mover contexto + provider de sesión a `features/auth` consumiendo `authService` (S1). Route: inline. Status: done.
- T2 — Dividir `ChangePasswordForm` en subcomponentes de presentación + contenedor (S2). Route: inline. Status: done.
- T3 — Extraer lógica de formulario/tabs a hooks de dominio en `features/user/hooks/` (S2). Route: inline. Status: done.
- T4 — Crear `features/user/index.js` y actualizar `src/app/routes/` (S2). Route: inline. Status: done.
- T5 — Validación eslint + build (S3). Route: inline. Status: done.

## Log

L1 (request verbatim, extracto): "Actúa bajo las reglas de la skill @bulletproof-react-patterns... Objetivo: Nivel 2B — Desacoplamiento de `src/features/user` y consolidación de `AuthProvider`. Ejecuta directamente la refactorización arquitectónica de `src/features/user` bajo el mismo estándar aplicado en `features/auth`, y completa el desacoplamiento de autenticación entre `app/providers` y `features/auth`."

L2: Estructura creada en auth: `context/authContext.js` (AuthContext + useAuth), `providers/AuthProvider.jsx` (usa `authService.me()` / `authService.logout()`), re-export en `features/auth/index.js`. `app/providers/AuthContext.jsx` eliminado; `AppProviders` monta `AuthProvider` desde `@/features/auth`; guards, `AppSidebar`, `NavUser` y `useLoginForm` consumen el hook del feature.

L3: `features/user`: `ChangePasswordForm` pasó de 288 a ~95 líneas (contenedor); se agregaron `PasswordField`, `PasswordRequirements`, `ChangePasswordFeedback` (presentación pura) y `hooks/useChangePasswordForm.js`, `hooks/useUserSettingsTabs.js`, `utils/passwordRequirements.js`. `UserProfileForm` ahora es presentacional y recibe `user`; la página solo compone.

L4: Evidencia: `npx eslint src/features/auth src/features/user src/app` → 0 errores, 1 warning (`react-hooks/incompatible-library` por `watch()` de RHF, ya existente en el baseline). `npm run build` → OK. Baseline previo: 4 errores + 1 warning.

L5: Observación: el error `react-refresh/only-export-components` de `app/providers/AuthContext.jsx` desaparece como efecto de mover el contexto a `context/authContext.js` (archivo sin componentes). No se refactorizó ningún `useEffect` local (Fase 3 intacta).

L6: Chunking verificado en `dist/assets`: `LoginPage` conserva chunk propio (3.24 kB) y `UserSettingsPage` chunk propio (12.07 kB); `AuthProvider` queda en el chunk principal. El barrel no arrastró la página de login.

L7: Verificación independiente: S1/S2/S3 met. Un blocker corregido: `userService.changePassword` había introducido un mensaje de error de respaldo no solicitado; se restauró el `throw new Error(error.response?.data?.detail)` del baseline. Además se recortó la API pública de `features/user/index.js` a solo `UserSettingsPage` y se quitó `AuthContext` del barrel de auth. Recheck: eslint 0 errores / 1 warning preexistente; build OK.

Advisories aceptados sin cambio (preexistentes): el checklist muestra la regla de mayúscula pero el schema no la exige; `features/user` importa `useAuth` de `features/auth` (dependencia de sesión, antes vía `app/`).
