import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../shared/components/layout/AppLayout";
import { dashboardByRole, moduleRoles } from "../shared/components/layout/navigation";
import { useAuth } from "../shared/hooks/useAuth";
import { AuthGuard } from "../guards/AuthGuard";
import { RoleGuard } from "../guards/RoleGuard";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterClientPage } from "../features/auth/pages/RegisterClientPage";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { SessionExpiredPage } from "../features/auth/pages/SessionExpiredPage";
import { AdminDashboardPage } from "../features/dashboard/pages/AdminDashboardPage";
import { ReceptionistDashboardPage } from "../features/dashboard/pages/ReceptionistDashboardPage";
import { MechanicDashboardPage } from "../features/dashboard/pages/MechanicDashboardPage";
import { ClientDashboardPage } from "../features/dashboard/pages/ClientDashboardPage";
import { PersonsListPage } from "../features/persons/pages/PersonsListPage";
import { PersonCreatePage } from "../features/persons/pages/PersonCreatePage";
import { PersonDetailPage } from "../features/persons/pages/PersonDetailPage";
import { PersonEditPage } from "../features/persons/pages/PersonEditPage";
import { VehiclesListPage } from "../features/vehicles/pages/VehiclesListPage";
import { VehicleCreatePage } from "../features/vehicles/pages/VehicleCreatePage";
import { VehicleDetailPage } from "../features/vehicles/pages/VehicleDetailPage";
import { VehicleEditPage } from "../features/vehicles/pages/VehicleEditPage";
import { ServiceOrdersListPage } from "../features/service-orders/pages/ServiceOrdersListPage";
import { ServiceOrderCreatePage } from "../features/service-orders/pages/ServiceOrderCreatePage";
import { ServiceOrderDetailPage } from "../features/service-orders/pages/ServiceOrderDetailPage";
import { PartsListPage } from "../features/parts/pages/PartsListPage";
import { PartCreatePage } from "../features/parts/pages/PartCreatePage";
import { PartEditPage } from "../features/parts/pages/PartEditPage";
import { LowStockPage } from "../features/parts/pages/LowStockPage";
import { PartPurchasesListPage } from "../features/parts/pages/PartPurchasesListPage";
import { PartPurchaseCreatePage } from "../features/parts/pages/PartPurchaseCreatePage";
import { PartPurchaseDetailPage } from "../features/parts/pages/PartPurchaseDetailPage";
import { InvoicesListPage } from "../features/invoices/pages/InvoicesListPage";
import { InvoiceDetailPage } from "../features/invoices/pages/InvoiceDetailPage";
import { UsersListPage } from "../features/users/pages/UsersListPage";
import { UserCreatePage } from "../features/users/pages/UserCreatePage";
import { UserRolesPage } from "../features/users/pages/UserRolesPage";
import { AuditsListPage } from "../features/audits/pages/AuditsListPage";
import { CatalogsPage } from "../features/catalogs/pages/CatalogsPage";
import {
  ClientApprovalsPage,
  ClientHistoryPage,
  ClientMessagesPage,
  ClientOrderDetailPage,
  ClientOrdersPage,
  ClientPaymentNewPage,
  ClientPaymentsPage,
  InventoryHistoryPage,
  InventoryManagerDashboardPage,
  InventoryProductsPage,
  InventoryReviewDetailPage,
  InventoryReviewPage,
  MechanicOrderDetailPage,
  MechanicOrdersPage,
  MechanicRequestsPage,
  ReceptionDeliveriesPage,
  ReceptionPaymentsVerificationPage,
  WarehouseChiefDashboardPage,
  WarehouseProductFormPage,
  WarehouseProductsPage,
  WarehouseStockSubmissionDetailPage,
  WarehouseStockSubmissionsPage,
  WorkshopChiefDashboardPage,
  WorkshopChiefRequestDetailPage,
  WorkshopChiefRequestsPage,
  WorkshopServiceFormPage,
  WorkshopServicesPage,
} from "../features/operations/pages/OperationsPages";

function HomeRedirect() {
  const role = useAuth((state) => state.role);
  return <Navigate to={role ? dashboardByRole[role] : "/auth/login"} replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register-client" element={<RegisterClientPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/session-expired" element={<SessionExpiredPage />} />

      <Route element={<AuthGuard />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleGuard allowedRoles={["Admin"]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
          </Route>
          <Route element={<RoleGuard allowedRoles={["Admin", "Receptionist"]} />}>
            <Route path="/dashboard/reception" element={<ReceptionistDashboardPage />} />
          </Route>
          <Route element={<RoleGuard allowedRoles={["Admin", "Mechanic"]} />}>
            <Route path="/dashboard/mechanic" element={<MechanicDashboardPage />} />
          </Route>
          <Route element={<RoleGuard allowedRoles={["Admin", "Client"]} />}>
            <Route path="/dashboard/client" element={<ClientDashboardPage />} />
          </Route>
          <Route element={<RoleGuard allowedRoles={["Admin", "WorkshopChief"]} />}>
            <Route path="/dashboard/workshop-chief" element={<WorkshopChiefDashboardPage />} />
          </Route>
          <Route element={<RoleGuard allowedRoles={["Admin", "WarehouseChief"]} />}>
            <Route path="/dashboard/warehouse-chief" element={<WarehouseChiefDashboardPage />} />
          </Route>
          <Route element={<RoleGuard allowedRoles={["Admin", "InventoryManager"]} />}>
            <Route path="/dashboard/inventory-manager" element={<InventoryManagerDashboardPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.persons} />}>
            <Route path="/persons" element={<PersonsListPage />} />
            <Route path="/persons/new" element={<PersonCreatePage />} />
            <Route path="/persons/:id" element={<PersonDetailPage />} />
            <Route path="/persons/:id/edit" element={<PersonEditPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.vehicles} />}>
            <Route path="/vehicles" element={<VehiclesListPage />} />
            <Route path="/vehicles/new" element={<VehicleCreatePage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/vehicles/:id/edit" element={<VehicleEditPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.serviceOrders} />}>
            <Route path="/service-orders" element={<ServiceOrdersListPage />} />
            <Route path="/service-orders/new" element={<ServiceOrderCreatePage />} />
            <Route path="/service-orders/:id" element={<ServiceOrderDetailPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.mechanic} />}>
            <Route path="/mechanic/orders" element={<MechanicOrdersPage />} />
            <Route path="/mechanic/orders/:id" element={<MechanicOrderDetailPage />} />
            <Route path="/mechanic/requests" element={<MechanicRequestsPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.workshopChief} />}>
            <Route path="/workshop-chief/requests" element={<WorkshopChiefRequestsPage />} />
            <Route path="/workshop-chief/requests/:id" element={<WorkshopChiefRequestDetailPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.workshopServices} />}>
            <Route path="/workshop/services" element={<WorkshopServicesPage />} />
            <Route path="/workshop/services/new" element={<WorkshopServiceFormPage />} />
            <Route path="/workshop/services/:id/edit" element={<WorkshopServiceFormPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.client} />}>
            <Route path="/client/orders" element={<ClientOrdersPage />} />
            <Route path="/client/orders/:id" element={<ClientOrderDetailPage />} />
            <Route path="/client/approvals" element={<ClientApprovalsPage />} />
            <Route path="/client/payments" element={<ClientPaymentsPage />} />
            <Route path="/client/payments/new" element={<ClientPaymentNewPage />} />
            <Route path="/client/messages" element={<ClientMessagesPage />} />
            <Route path="/client/history" element={<ClientHistoryPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.warehouse} />}>
            <Route path="/warehouse/products" element={<WarehouseProductsPage />} />
            <Route path="/warehouse/products/new" element={<WarehouseProductFormPage />} />
            <Route path="/warehouse/products/:id/edit" element={<WarehouseProductFormPage />} />
            <Route path="/warehouse/stock-submissions" element={<WarehouseStockSubmissionsPage />} />
            <Route path="/warehouse/stock-submissions/:id" element={<WarehouseStockSubmissionDetailPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.inventory} />}>
            <Route path="/inventory/review" element={<InventoryReviewPage />} />
            <Route path="/inventory/review/:id" element={<InventoryReviewDetailPage />} />
            <Route path="/inventory/products" element={<InventoryProductsPage />} />
            <Route path="/inventory/history" element={<InventoryHistoryPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.reception} />}>
            <Route path="/reception/customers" element={<PersonsListPage />} />
            <Route path="/reception/vehicles" element={<VehiclesListPage />} />
            <Route path="/reception/service-orders" element={<ServiceOrdersListPage />} />
            <Route path="/reception/payments-verification" element={<ReceptionPaymentsVerificationPage />} />
            <Route path="/reception/deliveries" element={<ReceptionDeliveriesPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.parts} />}>
            <Route path="/parts" element={<PartsListPage />} />
            <Route path="/parts/new" element={<PartCreatePage />} />
            <Route path="/parts/:id/edit" element={<PartEditPage />} />
            <Route path="/parts/low-stock" element={<LowStockPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.purchases} />}>
            <Route path="/part-purchases" element={<PartPurchasesListPage />} />
            <Route path="/part-purchases/new" element={<PartPurchaseCreatePage />} />
            <Route path="/part-purchases/:id" element={<PartPurchaseDetailPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.invoices} />}>
            <Route path="/invoices" element={<InvoicesListPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          </Route>
          <Route element={<RoleGuard allowedRoles={moduleRoles.payments} />}>
            <Route path="/payments" element={<InvoicesListPage payments />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.users} />}>
            <Route path="/users" element={<UsersListPage />} />
            <Route path="/users/new" element={<UserCreatePage />} />
            <Route path="/users/:id/roles" element={<UserRolesPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.audits} />}>
            <Route path="/audits" element={<AuditsListPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={moduleRoles.catalogs} />}>
            <Route path="/catalogs" element={<CatalogsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
