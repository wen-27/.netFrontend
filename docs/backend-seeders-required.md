# Seeders requeridos para backend

Este frontend no implementa seeders reales porque el repositorio es únicamente frontend. El backend debe crear seeders para que los flujos de AutoTallerManager funcionen con datos base consistentes.

## Roles

- Admin
- Receptionist
- Mechanic
- Client
- WorkshopChief
- WarehouseChief
- InventoryManager

## Usuarios iniciales por rol

Contraseña solo para desarrollo: `Admin123*`

- `admin@autotaller.com` - Admin
- `recepcion@autotaller.com` - Receptionist
- `mecanico@autotaller.com` - Mechanic
- `cliente@autotaller.com` - Client
- `jefetaller@autotaller.com` - WorkshopChief
- `jefebodega@autotaller.com` - WarehouseChief
- `jefealmacen@autotaller.com` - InventoryManager

## Catálogos mínimos

- Categorías de repuestos
- Marcas de repuestos
- Proveedores
- Productos/repuestos iniciales
- Inventario inicial aprobado
- Tipos de servicios
- Servicios del taller
- Repuestos requeridos por servicio
- Métodos de pago
- Estados de pago
- Estados de orden
- Estados de solicitudes técnicas
- Estados de stock

## Proveedores seed

- AutoPartes Colombia S.A.S.
- Lubricantes del Oriente
- Repuestos Premium Bucaramanga
- Distribuidora Nacional de Llantas
- Baterías Andinas

## Productos/repuestos seed

- Aceite 20W50
- Filtro de aceite universal
- Llanta rin 15
- Pastillas de freno delanteras
- Batería 12V
- Filtro de aire
- Bujías estándar
- Líquido de frenos
- Correa de repartición
- Limpiaparabrisas universal

## Servicios del taller seed

- Cambio de aceite
- Cambio de llantas
- Revisión de frenos
- Cambio de batería
- Cambio de filtro de aire
- Cambio de bujías
- Alineación
- Balanceo
- Diagnóstico general
- Mantenimiento preventivo

## Estados técnicos

Solicitudes técnicas:

- Draft
- PendingWorkshopChiefApproval
- RejectedByWorkshopChief
- PendingClientApproval
- RejectedByClient
- ApprovedByClient
- AddedToOrder

Órdenes:

- Created
- PendingAssignment
- Assigned
- InProgress
- PendingClientApproval
- WaitingForPayment
- PaymentUnderReview
- Paid
- ReadyForDelivery
- Delivered
- Cancelled

Servicios de orden:

- Pending
- Approved
- InProgress
- WaitingForParts
- Completed
- Rejected
- Invoiced

Stock:

- Draft
- PendingInventoryManagerReview
- RejectedByInventoryManager
- ApprovedByInventoryManager
- AddedToInventory

## Fórmulas

Precio venta producto:

```txt
precio proveedor + (precio proveedor * porcentaje ganancia / 100)
```

Precio servicio:

```txt
subtotal repuestos + (subtotal repuestos * porcentaje mano de obra / 100)
```

El backend debe persistir los totales calculados o recalcularlos de forma transaccional al aprobar stock, crear servicios y añadir servicios aprobados por cliente a una orden activa.
