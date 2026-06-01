import { apiClient } from "../../../services/apiClient";

export type AdminDashboardSummaryItem = {
  id: number;
  [key: string]: unknown;
};

export type AdminDashboardData = {
  totals: {
    clients: number;
    vehicles: number;
    activeUsers: number;
    mechanics: number;
    receptionists: number;
    workshopChiefs: number;
    activeOrders: number;
    pendingOrders: number;
    completedOrders: number;
    pendingPayments: number;
    verifiedPayments: number;
    pendingInvoices: number;
  };
  recentOrders: Array<AdminDashboardSummaryItem & {
    code: string;
    customer: string;
    vehicle: string;
    status: string;
    entryDate: string;
    estimatedTotal: number;
  }>;
  recentPayments: Array<AdminDashboardSummaryItem & {
    invoiceId: number;
    orderCode: string;
    customer: string;
    vehicle: string;
    amount: number;
    method: string;
    status: string;
    date: string;
    reference?: string | null;
  }>;
  recentClients: Array<AdminDashboardSummaryItem & {
    fullName: string;
    document: string;
    email?: string | null;
    createdAt: string;
  }>;
  recentVehicles: Array<AdminDashboardSummaryItem & {
    vin: string;
    vehicle: string;
    owner: string;
    createdAt: string;
  }>;
  mechanicsBySpecialty: Array<{ specialty: string; total: number }>;
  ordersByStatus: Array<{ status: string; total: number }>;
};

export const adminDashboardService = {
  get: () => apiClient.get<AdminDashboardData>("/api/admin/dashboard").then((response) => response.data),
};
