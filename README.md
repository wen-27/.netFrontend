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
- Si existen múltiples roles, se prioriza: `Admin > WorkshopChief > InventoryManager > WarehouseChief > Receptionist > Mechanic > Client`.
- Las tablas server-side envían `pageNumber`, `pageSize` y `search` como query params y leen `X-Total-Count`.
- Los datos mock son fallback visual cuando el backend no está disponible; los servicios siguen apuntando al backend REST real con `pageNumber`, `pageSize` y `X-Total-Count`.
- El flujo de recuperar contraseña queda como mock visual porque no se especificó endpoint.
- No se solicita ni almacena CVV ni número completo de tarjeta.

## Roles disponibles

- Admin
- Recepcionista (`Receptionist`)
- Mecánico (`Mechanic`)
- Cliente (`Client`)
- Jefe de Taller (`WorkshopChief`)
- Jefe de Bodega (`WarehouseChief`)
- Jefe de Almacén (`InventoryManager`)

## Rutas principales por rol

Admin ve dashboard, clientes, vehículos, órdenes, inventario, bodega, almacén, servicios del taller, facturación, pagos, usuarios y roles, auditoría y catálogos.

Recepción: `/dashboard/reception`, `/reception/customers`, `/reception/vehicles`, `/reception/service-orders`, `/invoices`, `/reception/payments-verification`, `/reception/deliveries`.

Mecánico: `/dashboard/mechanic`, `/mechanic/orders`, `/mechanic/orders/:id`, `/mechanic/requests`.

Jefe de Taller: `/dashboard/workshop-chief`, `/workshop-chief/requests`, `/workshop-chief/requests/:id`, `/workshop/services`, `/workshop/services/new`, `/workshop/services/:id/edit`.

Cliente: `/dashboard/client`, `/client/orders`, `/client/orders/:id`, `/client/approvals`, `/client/payments/new`, `/client/messages`, `/client/history`.

Jefe de Bodega: `/dashboard/warehouse-chief`, `/warehouse/products`, `/warehouse/products/new`, `/warehouse/products/:id/edit`, `/warehouse/stock-submissions`, `/warehouse/stock-submissions/:id`.

Jefe de Almacén: `/dashboard/inventory-manager`, `/inventory/review`, `/inventory/review/:id`, `/inventory/products`, `/inventory/history`.

## Flujos operativos

Solicitudes técnicas: el mecánico crea una solicitud adicional y queda en `PendingWorkshopChiefApproval`. El Jefe de Taller aprueba y envía al cliente como `PendingClientApproval`, o rechaza como `RejectedByWorkshopChief`. El cliente aprueba como `ApprovedByClient` para añadir a la orden, o rechaza como `RejectedByClient`.

Aprobación cliente: `/client/approvals` muestra orden, vehículo, servicio sugerido, repuesto, comentarios técnicos, precio estimado e impacto en el total.

Bodega y almacén: el Jefe de Bodega registra producto y envía stock a `PendingInventoryManagerReview`. El Jefe de Almacén aprueba para inventario oficial o rechaza con comentario obligatorio.

Servicios del taller: el Jefe de Taller crea servicios base, asocia repuestos, define porcentaje de mano de obra y activa o desactiva servicios.

Pagos por recepción: el cliente registra el pago en `/client/payments/new?orderId=...`; recepción verifica en `/reception/payments-verification`, aprueba o rechaza y confirma fecha de entrega. El cliente ve pago enviado, exitoso o rechazado.

## Fórmulas de cálculo

Producto:

```txt
Precio venta = precio proveedor + (precio proveedor * porcentaje ganancia / 100)
```

Servicio:

```txt
Precio servicio = subtotal repuestos + (subtotal repuestos * porcentaje mano de obra / 100)
```

## Mocks temporales

Los mocks operativos viven en `src/shared/mocks/operationsMocks.ts`. Los servicios de `src/features/operations/services/operationsService.ts` intentan consumir API REST con Axios y hacen fallback a mocks cuando el backend todavía no tiene el endpoint.

## Estructura

La app está organizada por `app`, `shared`, `services`, `guards` y `features`. Cada módulo principal tiene páginas, servicios y tipos propios para escalar sin mezclar responsabilidades.
