import { apiClient } from "../../../services/apiClient";
import {
  AdditionalRequest,
  ClientPayment,
  ClientPaymentRequest,
  StockSubmission,
  WarehouseProduct,
  WorkshopService,
  WorkshopServicePart,
} from "../../../shared/types/domain";
import {
  mockAdditionalRequests,
  mockClientOrders,
  mockClientPayments,
  mockStockSubmissions,
  mockWarehouseProducts,
  mockWorkshopServices,
} from "../../../shared/mocks/operationsMocks";

async function withMock<T>(request: Promise<{ data: T }>, fallback: T): Promise<T> {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    if ((error as { status?: number }).status === 401) throw error;
    return fallback;
  }
}

export function calculateProductSalePrice(supplierPrice: number, profitPercentage: number) {
  return supplierPrice + (supplierPrice * profitPercentage) / 100;
}

export function calculateWorkshopServicePrice(parts: WorkshopServicePart[], laborPercentage: number) {
  const partsTotal = parts.reduce((total, part) => total + part.salePrice * part.quantity, 0);
  const laborValue = (partsTotal * laborPercentage) / 100;
  return {
    partsTotal,
    laborValue,
    finalPrice: partsTotal + laborValue,
  };
}

export const operationsService = {
  createAdditionalRequest: (payload: Partial<AdditionalRequest>) =>
    withMock(apiClient.post<AdditionalRequest>(`/api/mechanic/orders/${payload.orderId}/additional-requests`, payload), {
      ...mockAdditionalRequests[0],
      ...payload,
      id: crypto.randomUUID(),
      status: "PendingWorkshopChiefApproval",
    }),
  getMechanicRequests: () =>
    withMock(apiClient.get<AdditionalRequest[]>("/api/mechanic/requests"), mockAdditionalRequests),
  getMechanicOrders: () => withMock(apiClient.get<typeof mockClientOrders>("/api/mechanic/orders"), mockClientOrders),
  getMechanicOrderById: (orderId: string) =>
    withMock(apiClient.get<(typeof mockClientOrders)[number]>(`/api/mechanic/orders/${orderId}`), mockClientOrders.find((item) => item.id === orderId) ?? mockClientOrders[0]),
  registerMechanicWork: (orderId: string, payload: { workPerformed: string; observations?: string }) =>
    withMock(apiClient.post(`/api/mechanic/orders/${orderId}/work`, payload), { ok: true }),
  getWorkshopChiefRequests: () =>
    withMock(apiClient.get<AdditionalRequest[]>("/api/workshop-chief/requests"), mockAdditionalRequests),
  getWorkshopChiefRequestById: (requestId: string) =>
    withMock(apiClient.get<AdditionalRequest>(`/api/workshop-chief/requests/${requestId}`), mockAdditionalRequests.find((item) => item.id === requestId) ?? mockAdditionalRequests[0]),
  approveRequestByWorkshopChief: (requestId: string, comment: string) =>
    withMock(apiClient.post<AdditionalRequest>(`/api/workshop-chief/requests/${requestId}/approve`, { comment }), {
      ...mockAdditionalRequests.find((item) => item.id === requestId)!,
      workshopChiefComment: comment,
      status: "PendingClientApproval",
    }),
  rejectRequestByWorkshopChief: (requestId: string, comment: string) =>
    withMock(apiClient.post<AdditionalRequest>(`/api/workshop-chief/requests/${requestId}/reject`, { comment }), {
      ...mockAdditionalRequests.find((item) => item.id === requestId)!,
      workshopChiefComment: comment,
      status: "RejectedByWorkshopChief",
    }),
  getClientPendingApprovals: () =>
    withMock(
      apiClient.get<AdditionalRequest[]>("/api/client/approvals"),
      mockAdditionalRequests.filter((item) => item.status === "PendingClientApproval"),
    ),
  approveRequestByClient: (requestId: string) =>
    withMock(apiClient.post<AdditionalRequest>(`/api/client/approvals/${requestId}/approve`), {
      ...mockAdditionalRequests.find((item) => item.id === requestId)!,
      status: "AddedToOrder",
    }),
  rejectRequestByClient: (requestId: string, comment?: string) =>
    withMock(apiClient.post<AdditionalRequest>(`/api/client/approvals/${requestId}/reject`, { comment }), {
      ...mockAdditionalRequests.find((item) => item.id === requestId)!,
      clientComment: comment,
      status: "RejectedByClient",
    }),

  getClientOrders: () => withMock(apiClient.get<typeof mockClientOrders>("/api/client/orders"), mockClientOrders),
  getClientOrderById: (orderId: string) =>
    withMock(apiClient.get<(typeof mockClientOrders)[number]>(`/api/client/orders/${orderId}`), mockClientOrders.find((item) => item.id === orderId) ?? mockClientOrders[0]),
  getClientMessages: () =>
    withMock(apiClient.get<string[]>("/api/client/messages"), [
      "Aprobación pendiente para cambio de filtro de aire.",
      "Tu vehículo está en prueba final.",
      "Recepción confirmará la entrega después de verificar el pago.",
    ]),
  getClientPayments: () => withMock(apiClient.get<ClientPayment[]>("/api/client/payments"), mockClientPayments),

  createWarehouseProduct: (payload: Omit<WarehouseProduct, "id" | "salePrice">) =>
    withMock(apiClient.post<WarehouseProduct>("/api/warehouse/products", payload), {
      ...payload,
      id: crypto.randomUUID(),
      salePrice: calculateProductSalePrice(payload.supplierPrice, payload.profitPercentage),
    }),
  updateWarehouseProduct: (id: string, payload: Partial<WarehouseProduct>) =>
    withMock(apiClient.put<WarehouseProduct>(`/api/warehouse/products/${id}`, payload), {
      ...mockWarehouseProducts.find((item) => item.id === id)!,
      ...payload,
    }),
  getWarehouseProducts: () => withMock(apiClient.get<WarehouseProduct[]>("/api/warehouse/products"), mockWarehouseProducts),
  createStockSubmission: (payload: Partial<StockSubmission>) =>
    withMock(apiClient.post<StockSubmission>("/api/warehouse/stock-submissions", payload), {
      ...mockStockSubmissions[0],
      ...payload,
      submissionId: crypto.randomUUID(),
      status: "Draft",
    }),
  sendStockSubmissionForReview: (id: string) =>
    withMock(apiClient.post<StockSubmission>(`/api/warehouse/stock-submissions/${id}/send-to-review`), {
      ...mockStockSubmissions.find((item) => item.submissionId === id)!,
      status: "PendingInventoryManagerReview",
    }),
  getStockSubmissions: () => withMock(apiClient.get<StockSubmission[]>("/api/warehouse/stock-submissions"), mockStockSubmissions),
  getStockSubmissionById: (id: string) =>
    withMock(apiClient.get<StockSubmission>(`/api/warehouse/stock-submissions/${id}`), mockStockSubmissions.find((item) => item.submissionId === id) ?? mockStockSubmissions[0]),

  getInventoryReviewRequests: () =>
    withMock(
      apiClient.get<StockSubmission[]>("/api/inventory/review-requests"),
      mockStockSubmissions.filter((item) => item.status === "PendingInventoryManagerReview"),
    ),
  getInventoryReviewRequestById: (id: string) =>
    withMock(apiClient.get<StockSubmission>(`/api/inventory/review-requests/${id}`), mockStockSubmissions.find((item) => item.submissionId === id) ?? mockStockSubmissions[0]),
  approveStockSubmission: (id: string, comment: string) =>
    withMock(apiClient.post<StockSubmission>(`/api/inventory/review-requests/${id}/approve`, { comment }), {
      ...mockStockSubmissions.find((item) => item.submissionId === id)!,
      inventoryManagerComment: comment,
      status: "ApprovedByInventoryManager",
    }),
  rejectStockSubmission: (id: string, comment: string) =>
    withMock(apiClient.post<StockSubmission>(`/api/inventory/review-requests/${id}/reject`, { comment }), {
      ...mockStockSubmissions.find((item) => item.submissionId === id)!,
      inventoryManagerComment: comment,
      status: "RejectedByInventoryManager",
    }),
  getInventoryProducts: () => withMock(apiClient.get<WarehouseProduct[]>("/api/inventory/products"), mockWarehouseProducts),
  getInventoryHistory: () => withMock(apiClient.get<StockSubmission[]>("/api/inventory/history"), mockStockSubmissions),

  getWorkshopServices: () => withMock(apiClient.get<WorkshopService[]>("/api/workshop-services"), mockWorkshopServices),
  getWorkshopServiceById: (id: string) =>
    withMock(apiClient.get<WorkshopService>(`/api/workshop-services/${id}`), mockWorkshopServices.find((item) => item.id === id) ?? mockWorkshopServices[0]),
  createWorkshopService: (payload: Omit<WorkshopService, "id" | "partsTotal" | "laborValue" | "finalPrice">) => {
    const totals = calculateWorkshopServicePrice(payload.parts, payload.laborPercentage);
    return withMock(apiClient.post<WorkshopService>("/api/workshop-services", payload), {
      ...payload,
      ...totals,
      id: crypto.randomUUID(),
    });
  },
  updateWorkshopService: (id: string, payload: Partial<WorkshopService>) =>
    withMock(apiClient.put<WorkshopService>(`/api/workshop-services/${id}`, payload), {
      ...mockWorkshopServices.find((item) => item.id === id)!,
      ...payload,
    }),
  activateWorkshopService: (id: string) =>
    withMock(apiClient.patch<WorkshopService>(`/api/workshop-services/${id}/activate`), {
      ...mockWorkshopServices.find((item) => item.id === id)!,
      status: "Active",
    }),
  deactivateWorkshopService: (id: string) =>
    withMock(apiClient.patch<WorkshopService>(`/api/workshop-services/${id}/deactivate`), {
      ...mockWorkshopServices.find((item) => item.id === id)!,
      status: "Inactive",
    }),
  calculateWorkshopServicePrice,

  submitClientPayment: (payload: ClientPaymentRequest) =>
    withMock(apiClient.post<ClientPayment>("/api/client/payments", payload), {
      ...mockClientPayments[0],
      id: crypto.randomUUID(),
      amount: payload.amount,
      status: "PendingReceptionVerification",
    }),
  getPaymentsPendingReceptionVerification: () =>
    withMock(apiClient.get<ClientPayment[]>("/api/reception/payments/pending-verification"), mockClientPayments),
  getReceptionPaymentById: (paymentId: string) =>
    withMock(apiClient.get<ClientPayment>(`/api/reception/payments/${paymentId}`), mockClientPayments.find((item) => item.id === paymentId) ?? mockClientPayments[0]),
  approvePaymentByReception: (paymentId: string, deliveryDate?: string) =>
    withMock(apiClient.post<ClientPayment>(`/api/reception/payments/${paymentId}/approve`, { deliveryDate }), {
      ...mockClientPayments.find((item) => item.id === paymentId)!,
      deliveryDate,
      status: "Approved",
    }),
  rejectPaymentByReception: (paymentId: string) =>
    withMock(apiClient.post<ClientPayment>(`/api/reception/payments/${paymentId}/reject`), {
      ...mockClientPayments.find((item) => item.id === paymentId)!,
      status: "Rejected",
    }),
  confirmVehicleDeliveryDate: (orderId: string, deliveryDate: string) =>
    withMock(apiClient.post<ClientPayment>(`/api/reception/orders/${orderId}/confirm-delivery-date`, { deliveryDate }), {
      ...mockClientPayments.find((item) => item.orderId === orderId)!,
      deliveryDate,
      status: "Approved",
    }),
};

export const {
  createAdditionalRequest,
  getMechanicRequests,
  getMechanicOrders,
  getMechanicOrderById,
  registerMechanicWork,
  getWorkshopChiefRequests,
  getWorkshopChiefRequestById,
  approveRequestByWorkshopChief,
  rejectRequestByWorkshopChief,
  getClientPendingApprovals,
  approveRequestByClient,
  rejectRequestByClient,
  getClientMessages,
  getClientPayments,
  createWarehouseProduct,
  updateWarehouseProduct,
  getWarehouseProducts,
  createStockSubmission,
  sendStockSubmissionForReview,
  getStockSubmissions,
  getStockSubmissionById,
  getInventoryReviewRequests,
  getInventoryReviewRequestById,
  approveStockSubmission,
  rejectStockSubmission,
  getInventoryProducts,
  getInventoryHistory,
  getWorkshopServices,
  getWorkshopServiceById,
  createWorkshopService,
  updateWorkshopService,
  activateWorkshopService,
  deactivateWorkshopService,
  submitClientPayment,
  getPaymentsPendingReceptionVerification,
  getReceptionPaymentById,
  approvePaymentByReception,
  rejectPaymentByReception,
  confirmVehicleDeliveryDate,
} = operationsService;
