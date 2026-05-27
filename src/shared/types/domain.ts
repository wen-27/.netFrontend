export type Person = {
  id: string;
  documentType: string;
  documentNumber: string;
  fullName: string;
  roles: string[];
  primaryEmail: string;
  primaryPhone: string;
  vehiclesCount: number;
  status: string;
};

export type Vehicle = {
  id: string;
  vin: string;
  brand: string;
  model: string;
  type: string;
  year: number;
  mileage: number;
  currentOwner: string;
  activeOrders: number;
};

export type ServiceOrder = {
  id: string;
  code: string;
  customer: string;
  vehicle: string;
  status: string;
  mechanic: string;
  entryDate: string;
  estimatedDelivery: string;
  estimatedTotal: number;
};

export type Part = {
  id: string;
  code: string;
  description: string;
  category: string;
  brand: string;
  currentStock: number;
  minimumStock: number;
  price: number;
};

export type Invoice = {
  id: string;
  number: string;
  customer: string;
  orderCode: string;
  date: string;
  subtotal: number;
  taxes: number;
  total: number;
  paymentStatus: string;
};

export type UserAccount = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string;
  lastAccess: string;
};

export type AuditEvent = {
  id: string;
  date: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  origin: string;
};

export type Purchase = {
  id: string;
  number: string;
  supplier: string;
  date: string;
  total: number;
  status: string;
};
