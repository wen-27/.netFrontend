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
  status: ServiceOrderStatus | string;
  mechanic: string;
  entryDate: string;
  estimatedDelivery: string;
  estimatedTotal: number;
  invoiceId?: number;
  canPay?: boolean;
  paymentStatus?: PaymentStatus;
  paymentMessage?: string;
  deliveryDate?: string;
};

export type PaymentStatus =
  | "PendingPayment"
  | "PendingReceptionVerification"
  | "Approved"
  | "Rejected"
  | "Refunded";

export type AdditionalRequestStatus =
  | "Draft"
  | "PendingWorkshopChiefApproval"
  | "RejectedByWorkshopChief"
  | "PendingClientApproval"
  | "RejectedByClient"
  | "ApprovedByClient"
  | "AddedToOrder";

export type OrderServiceStatus =
  | "Pending"
  | "Approved"
  | "InProgress"
  | "WaitingForParts"
  | "Completed"
  | "Rejected"
  | "Invoiced";

export type ServiceOrderStatus =
  | "Created"
  | "PendingAssignment"
  | "Assigned"
  | "InProgress"
  | "PendingClientApproval"
  | "WaitingForPayment"
  | "PaymentUnderReview"
  | "Paid"
  | "ReadyForDelivery"
  | "Delivered"
  | "Cancelled";

export type StockSubmissionStatus =
  | "Draft"
  | "PendingInventoryManagerReview"
  | "RejectedByInventoryManager"
  | "ApprovedByInventoryManager"
  | "AddedToInventory";

export type WorkshopServiceStatus = "Active" | "Inactive";

export type OrderServiceItem = {
  id: string;
  name: string;
  status: OrderServiceStatus;
  parts: string[];
  price: number;
};

export type AdditionalRequest = {
  id: string;
  createdAt: string;
  orderId: string;
  orderCode: string;
  customer: string;
  vehicle: string;
  mechanic: string;
  requestType: "Service" | "Part";
  suggestedService: string;
  suggestedPart?: string;
  quantity?: number;
  problemDescription: string;
  technicalJustification: string;
  observations?: string;
  workshopChiefComment?: string;
  clientComment?: string;
  estimatedPrice: number;
  status: AdditionalRequestStatus;
  priority: "Baja" | "Media" | "Alta";
  decisionHistory: string[];
};

export type WarehouseProduct = {
  id: string;
  name: string;
  referenceCode: string;
  supplier: string;
  supplierPrice: number;
  profitPercentage: number;
  salePrice: number;
  quantity: number;
  category: string;
  brand: string;
  description: string;
  minimumStock: number;
  observations?: string;
};

export type StockSubmission = WarehouseProduct & {
  submissionId: string;
  submittedAt: string;
  warehouseChief: string;
  status: StockSubmissionStatus;
  warehouseComment?: string;
  inventoryManagerComment?: string;
};

export type WorkshopServicePart = {
  partId: string;
  name: string;
  salePrice: number;
  quantity: number;
};

export type WorkshopService = {
  id: string;
  name: string;
  description: string;
  category: string;
  parts: WorkshopServicePart[];
  laborPercentage: number;
  partsTotal: number;
  laborValue: number;
  finalPrice: number;
  status: WorkshopServiceStatus;
};

export type ClientPayment = {
  id: string;
  orderId: string;
  orderCode: string;
  invoiceNumber: string;
  customer: string;
  method: string;
  amount: number;
  reference: string;
  date: string;
  status: PaymentStatus;
  deliveryDate?: string;
};

export type ClientPaymentRequest = {
  invoiceId: number;
  paymentMethodId: number;
  amount: number;
  cardLastFourDigits?: string | null;
  cardHolderName?: string | null;
  cardBrand?: string | null;
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
