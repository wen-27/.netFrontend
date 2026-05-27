# AutoTallerManager Frontend

Frontend operativo para administrar un taller automotriz moderno. Está construido con React, TypeScript, Vite, React Router DOM, TanStack Query, TanStack Table, React Hook Form, Zod, Axios, Tailwind CSS, Lucide React y date-fns.

## Ejecutar

```bash
pnpm install
pnpm dev
```

Compilar:

```bash
pnpm build
```

## Configuración

Copia `.env.example` a `.env` y ajusta el backend:

```env
VITE_API_URL=https://localhost:7137
# VITE_API_URL=http://localhost:5213
```

## Supuestos importantes

- El backend expone `accessToken`, `role`, `email`, `userId`, `personId` y `expiresAt` en `POST /api/auth/login`.
- `POST /api/auth/register-client` usa el body con `documentTypeId`, `genderId`, `phoneCountryId` y demás campos del contrato actual.
- El rol se lee de los claims `role`, `roles` o `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`.
- Si existen múltiples roles, se prioriza: `Admin > Receptionist > Mechanic > Client`.
- Las tablas server-side envían `pageNumber`, `pageSize` y `search` como query params y leen `X-Total-Count`.
- Los datos mock son fallback visual cuando el backend no está disponible; los servicios siguen apuntando al backend REST real con `pageNumber`, `pageSize` y `X-Total-Count`.
- El flujo de recuperar contraseña queda como mock visual porque no se especificó endpoint.
- No se solicita ni almacena CVV ni número completo de tarjeta.

## Estructura

La app está organizada por `app`, `shared`, `services`, `guards` y `features`. Cada módulo principal tiene páginas, servicios y tipos propios para escalar sin mezclar responsabilidades.
