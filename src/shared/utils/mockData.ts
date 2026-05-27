import { AuditEvent, Invoice, Part, Person, Purchase, ServiceOrder, UserAccount, Vehicle } from "../types/domain";

export const mockPersons: Person[] = [
  { id: "1", documentType: "CC", documentNumber: "10203040", fullName: "Laura Méndez", roles: ["Client"], primaryEmail: "laura@example.com", primaryPhone: "3001234567", vehiclesCount: 2, status: "Activo" },
  { id: "2", documentType: "NIT", documentNumber: "900123456", fullName: "Transporte Norte SAS", roles: ["Client"], primaryEmail: "operaciones@tnorte.com", primaryPhone: "6015551000", vehiclesCount: 8, status: "Activo" },
  { id: "3", documentType: "CC", documentNumber: "80900100", fullName: "Carlos Rojas", roles: ["Client", "Mechanic"], primaryEmail: "carlos@example.com", primaryPhone: "3105552222", vehiclesCount: 1, status: "Activo" },
];

export const mockVehicles: Vehicle[] = [
  { id: "1", vin: "9BWZZZ377VT004251", brand: "Toyota", model: "Hilux", type: "Pickup", year: 2022, mileage: 45210, currentOwner: "Laura Méndez", activeOrders: 1 },
  { id: "2", vin: "3FA6P0H75ER208976", brand: "Ford", model: "Fusion", type: "Sedán", year: 2019, mileage: 83200, currentOwner: "Transporte Norte SAS", activeOrders: 2 },
  { id: "3", vin: "KMHD84LF2HU123987", brand: "Hyundai", model: "Elantra", type: "Sedán", year: 2021, mileage: 31000, currentOwner: "Carlos Rojas", activeOrders: 0 },
];

export const mockServiceOrders: ServiceOrder[] = [
  { id: "1", code: "OT-2026-0018", customer: "Laura Méndez", vehicle: "Toyota Hilux 2022", status: "En progreso", mechanic: "Carlos Rojas", entryDate: "2026-05-26", estimatedDelivery: "2026-05-29", estimatedTotal: 980000 },
  { id: "2", code: "OT-2026-0019", customer: "Transporte Norte SAS", vehicle: "Ford Fusion 2019", status: "Esperando repuestos", mechanic: "Ana Torres", entryDate: "2026-05-25", estimatedDelivery: "2026-05-30", estimatedTotal: 1450000 },
  { id: "3", code: "OT-2026-0020", customer: "Carlos Rojas", vehicle: "Hyundai Elantra 2021", status: "Completada", mechanic: "Miguel Peña", entryDate: "2026-05-24", estimatedDelivery: "2026-05-27", estimatedTotal: 620000 },
];

export const mockParts: Part[] = [
  { id: "1", code: "FLT-001", description: "Filtro de aceite premium", category: "Filtros", brand: "Bosch", currentStock: 24, minimumStock: 8, price: 45000 },
  { id: "2", code: "BRK-022", description: "Pastillas de freno delanteras", category: "Frenos", brand: "Brembo", currentStock: 3, minimumStock: 6, price: 180000 },
  { id: "3", code: "BAT-100", description: "Batería 12V 700A", category: "Eléctrico", brand: "Mac", currentStock: 0, minimumStock: 4, price: 390000 },
];

export const mockInvoices: Invoice[] = [
  { id: "1", number: "FV-1052", customer: "Laura Méndez", orderCode: "OT-2026-0017", date: "2026-05-24", subtotal: 800000, taxes: 152000, total: 952000, paymentStatus: "Pagada" },
  { id: "2", number: "FV-1053", customer: "Transporte Norte SAS", orderCode: "OT-2026-0016", date: "2026-05-25", subtotal: 1250000, taxes: 237500, total: 1487500, paymentStatus: "Pendiente" },
];

export const mockUsers: UserAccount[] = [
  { id: "1", name: "Admin Taller", email: "admin@autotaller.com", roles: ["Admin"], status: "Activo", lastAccess: "2026-05-27T09:20:00" },
  { id: "2", name: "Diana Recepción", email: "diana@autotaller.com", roles: ["Receptionist"], status: "Activo", lastAccess: "2026-05-27T08:45:00" },
  { id: "3", name: "Carlos Rojas", email: "carlos@autotaller.com", roles: ["Mechanic"], status: "Activo", lastAccess: "2026-05-26T17:05:00" },
];

export const mockAudits: AuditEvent[] = [
  { id: "1", date: "2026-05-27T09:14:00", user: "Admin Taller", action: "Actualizar", entity: "ServiceOrder", entityId: "OT-2026-0018", origin: "192.168.1.15" },
  { id: "2", date: "2026-05-27T08:50:00", user: "Diana Recepción", action: "Crear", entity: "Vehicle", entityId: "9BWZZZ377VT004251", origin: "192.168.1.18" },
];

export const mockPurchases: Purchase[] = [
  { id: "1", number: "OC-3021", supplier: "Repuestos Andinos", date: "2026-05-26", total: 2200000, status: "Recibida" },
  { id: "2", number: "OC-3022", supplier: "Importadora Motor", date: "2026-05-27", total: 870000, status: "Pendiente" },
];
