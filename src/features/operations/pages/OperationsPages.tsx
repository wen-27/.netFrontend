import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  History,
  Package,
  PackageCheck,
  PackageMinus,
  PackagePlus,
  PackageSearch,
  Plus,
  Wrench,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";
import { Card } from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Badge } from "../../../shared/components/ui/Badge";
import { Modal } from "../../../shared/components/ui/Modal";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { TablePagination } from "../../../shared/components/data-table/TablePagination";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { formatCurrency, formatDateTime } from "../../../shared/utils/formatters";
import { getPaymentStatusLabel, getPaymentStatusTone } from "../../../shared/utils/statusLabels";
import { formatApiError } from "../../../shared/utils/apiErrors";
import { AdditionalRequest, ClientPayment, MechanicDiagnostic, OrderServiceItem, ServiceOrder, StockMovement, StockSubmission, WarehouseProduct } from "../../../shared/types/domain";
import { useAuth } from "../../../shared/hooks/useAuth";
import { serviceOrdersService } from "../../service-orders/services/serviceOrdersService";
import {
  AdditionalRequestStatusBadge,
  ClientApprovalActionCard,
  ClientOrderStatusCard,
  MechanicRequestModal,
  OrderPaymentAlert,
  OrderServicesTimeline,
  PaymentSuccessMessage,
  PaymentVerificationDrawer,
  PaymentVerificationTable,
  ServiceOrderStatusBadge,
  StockSubmissionForm,
  StockSubmissionReviewDrawer,
  StockSubmissionStatusBadge,
  WorkshopChiefRequestDrawer,
  WorkshopServiceForm,
  WorkshopServiceStatusBadge,
} from "../components";
import {
  operationsService,
  getClientPendingApprovals,
  getInventoryHistory,
  getInventoryProducts,
  getInventoryReviewRequestById,
  getInventoryReviewRequests,
  getStockDashboard,
  getStockMovements,
  getStockParts,
  getMechanicOrderById,
  getMechanicOrders,
  getMechanicRequests,
  getMechanicDiagnostics,
  submitMechanicDiagnostic,
  getClientPayments,
  getClientPaymentById,
  getPaymentsPendingReceptionVerification,
  getReceptionApprovedPayments,
  getStockSubmissionById,
  getStockSubmissions,
  getWarehouseProducts,
  getAvailableWorkshopParts,
  getWorkshopChiefRequestById,
  getWorkshopChiefRequests,
  getWorkshopChiefDiagnostics,
  getWorkshopChiefDiagnosticById,
  getWorkshopServices,
  createWorkshopService,
  updateWorkshopService,
  approveStockSubmission,
  rejectStockSubmission,
  approveRequestByWorkshopChief,
  rejectRequestByWorkshopChief,
  approveMechanicDiagnostic,
  rejectMechanicDiagnostic,
  approveRequestByClient,
  rejectRequestByClient,
  registerStockIn,
  registerStockOut,
} from "../services/operationsService";

function useFallbackQuery<T>(queryKey: string[], queryFn: () => Promise<T>) {
  return useQuery({ queryKey, queryFn, staleTime: 60_000 });
}

function getOrderServices(order: ServiceOrder): OrderServiceItem[] {
  const source = order as ServiceOrder & { services?: OrderServiceItem[]; orderServices?: OrderServiceItem[] };
  return source.services ?? source.orderServices ?? [];
}

function requestBelongsToOrder(request: AdditionalRequest, order: ServiceOrder) {
  return request.orderId === order.id || request.orderCode === order.code;
}

function isPendingClientApproval(order: ServiceOrder) {
  return String(order.status).replace(/\s+/g, "").toLowerCase() === "pendingclientapproval";
}

const workshopActiveOrderStatuses = new Set(["Created", "PendingAssignment", "Assigned", "InProgress", "WaitingForPayment", "PaymentUnderReview", "ReadyForDelivery"]);

function ClientOrderRequestActionsList({ requests, emptyMessage }: { requests: AdditionalRequest[]; emptyMessage: string }) {
  const queryClient = useQueryClient();
  const [hiddenRequestIds, setHiddenRequestIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const refreshClientViews = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["client-approvals"] }),
      queryClient.invalidateQueries({ queryKey: ["client-orders"] }),
      queryClient.invalidateQueries({ queryKey: ["client-order"] }),
    ]);
  };
  const approveMutation = useMutation({
    mutationFn: approveRequestByClient,
    onSuccess: async (response) => {
      if (response.status === "AddedToOrder" || response.status === "ApprovedByClient") {
        setHiddenRequestIds((current) => [...current, response.id]);
      }
      setMessage("Solicitud aprobada. Se añadirá a la orden asociada.");
      await refreshClientViews();
    },
  });
  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => rejectRequestByClient(requestId),
    onSuccess: async (response) => {
      if (response.status === "RejectedByClient") {
        setHiddenRequestIds((current) => [...current, response.id]);
      }
      setMessage("Solicitud rechazada. No se añadirá a la orden asociada.");
      await refreshClientViews();
    },
  });
  const visibleRequests = requests.filter((request) => !hiddenRequestIds.includes(request.id) && request.status !== "AddedToOrder" && request.status !== "RejectedByClient");

  return (
    <>
      {message ? <Card className="mb-4 border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{message}</Card> : null}
      {visibleRequests.length === 0 ? <Card className="p-5 text-sm text-slate-600">{emptyMessage}</Card> : null}
      <div className="grid gap-4">
        {visibleRequests.map((request) => (
          <ClientApprovalActionCard
            key={request.id}
            request={request}
            isLoading={approveMutation.isPending || rejectMutation.isPending}
            onApprove={(requestId) => approveMutation.mutate(requestId)}
            onReject={(requestId) => rejectMutation.mutate(requestId)}
          />
        ))}
      </div>
    </>
  );
}

export function WorkshopChiefDashboardPage() {
  const requestsQuery = useFallbackQuery(["workshop-chief-requests"], getWorkshopChiefRequests);
  const servicesQuery = useFallbackQuery(["workshop-services"], getWorkshopServices);
  const ordersQuery = useFallbackQuery(["workshop-chief-active-orders"], () => serviceOrdersService.list({ pageNumber: 1, pageSize: 500 }));
  const data = requestsQuery.data ?? [];
  const services = servicesQuery.data ?? [];
  const orders = ordersQuery.data?.data ?? [];
  const activeOrders = orders.filter((order) => workshopActiveOrderStatuses.has(String(order.status)));
  const pendingClientApprovalOrders = orders.filter(isPendingClientApproval);
  const pending = data.filter((item) => item.status === "PendingWorkshopChiefApproval").length;
  const approvedByChief = data.filter((item) => ["PendingClientApproval", "ApprovedByClient", "AddedToOrder", "RejectedByClient"].includes(item.status));
  const rejectedByChief = data.filter((item) => item.status === "RejectedByWorkshopChief");
  return (
    <>
      <PageHeader title="Dashboard Jefe de Taller" description="Solicitudes técnicas, órdenes activas y servicios configurados." />
      <div className="space-y-3">
        {requestsQuery.isError ? <ApiErrorAlert error={requestsQuery.error} action="No se pudieron cargar las solicitudes técnicas" /> : null}
        {servicesQuery.isError ? <ApiErrorAlert error={servicesQuery.error} action="No se pudieron cargar los servicios del taller" /> : null}
        {ordersQuery.isError ? <ApiErrorAlert error={ordersQuery.error} action="No se pudieron cargar las órdenes activas" /> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Solicitudes pendientes de revisión" value={String(pending)} tone="amber" icon={AlertTriangle} />
        <MetricCard label="Solicitudes aprobadas" value={String(approvedByChief.length)} tone="green" icon={CheckCircle2} />
        <MetricCard label="Solicitudes rechazadas" value={String(rejectedByChief.length)} tone="red" icon={XCircle} />
        <MetricCard label="Órdenes activas" value={String(activeOrders.length)} tone="blue" icon={ClipboardList} />
        <MetricCard label="Órdenes pendientes de aprobación" value={String(pendingClientApprovalOrders.length)} tone="indigo" icon={FileText} />
        <MetricCard label="Servicios activos" value={String(services.filter((item) => item.status === "Active").length)} tone="green" icon={ClipboardList} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <RequestsTable title="Solicitudes que aprobé" requests={approvedByChief} className="mt-0" allowReviewActions={false} compact detailPathPrefix="/workshop-chief/requests" />
        <RequestsTable title="Solicitudes que denegué" requests={rejectedByChief} className="mt-0" allowReviewActions={false} compact detailPathPrefix="/workshop-chief/requests" />
      </div>
    </>
  );
}

function productValue(product: WarehouseProduct, ...keys: string[]) {
  const source = product as unknown as Record<string, unknown>;
  return keys.map((key) => source[key]).find((value) => value !== undefined && value !== null && value !== "");
}

function productText(product: WarehouseProduct, fallback: string, ...keys: string[]) {
  const value = productValue(product, ...keys);
  return value === undefined ? fallback : String(value);
}

function productNumber(product: WarehouseProduct, fallback: number, ...keys: string[]) {
  const value = productValue(product, ...keys);
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function getProductStockStatus(product: WarehouseProduct) {
  const quantity = productNumber(product, 0, "quantity", "stock", "Stock");
  const minimumStock = productNumber(product, 0, "minimumStock", "MinimumStock");
  if (quantity <= 0) return "Agotado";
  if (quantity <= minimumStock) return "Bajo stock";
  return "Disponible";
}

function StockStatusBadge({ product }: { product: WarehouseProduct }) {
  const status = getProductStockStatus(product);
  const tone: "green" | "amber" | "red" = status === "Disponible" ? "green" : status === "Bajo stock" ? "amber" : "red";
  return <Badge tone={tone}>{status}</Badge>;
}

function StockProductsTable({
  products,
  onMovement,
  showInventoryActions = false,
  editReturnPath,
  footer,
}: {
  products: WarehouseProduct[];
  onMovement?: (product: WarehouseProduct, type: "in" | "out") => void;
  showInventoryActions?: boolean;
  editReturnPath?: string;
  footer?: React.ReactNode;
}) {
  const hasActions = Boolean(showInventoryActions || onMovement);
  return (
    <Card className="overflow-hidden">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="w-[16%] px-3 py-3">Repuesto</th>
            <th className="w-[12%] px-3 py-3">Referencia</th>
            <th className="w-[12%] px-3 py-3">Categoría</th>
            <th className="w-[10%] px-3 py-3">Marca</th>
            <th className="w-[7%] px-3 py-3">Stock</th>
            <th className="w-[7%] px-3 py-3">Mín.</th>
            <th className="w-[11%] px-3 py-3">Estado</th>
            <th className="w-[10%] px-3 py-3">Precio</th>
            {hasActions ? <th className="w-[15%] px-3 py-3 text-center">Acciones</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.length === 0 ? <tr><td className="px-3 py-5 font-semibold text-slate-500" colSpan={hasActions ? 9 : 8}>No hay repuestos para mostrar.</td></tr> : null}
          {products.map((product) => (
            <tr key={product.id}>
              <td className="break-words px-3 py-3 font-semibold text-slate-900">{productText(product, "Repuesto", "name", "description", "Description")}</td>
              <td className="break-words px-3 py-3">{productText(product, "Sin referencia", "referenceCode", "code", "Code")}</td>
              <td className="break-words px-3 py-3">{productText(product, "Repuesto", "category", "Category")}</td>
              <td className="break-words px-3 py-3">{productText(product, "Sin marca", "brand", "Brand")}</td>
              <td className="px-3 py-3 font-bold">{productNumber(product, 0, "quantity", "stock", "Stock")}</td>
              <td className="px-3 py-3">{productNumber(product, 0, "minimumStock", "MinimumStock")}</td>
              <td className="px-3 py-3"><StockStatusBadge product={product} /></td>
              <td className="break-words px-3 py-3">{formatCurrency(productNumber(product, 0, "salePrice", "unitPrice", "UnitPrice"))}</td>
              {hasActions ? (
                <td className="px-3 py-3 text-center">
                  <div className="flex flex-col items-stretch gap-2">
                    {onMovement ? (
                      <>
                        <Button variant="secondary" className="min-h-8 justify-center px-2 text-xs" icon={<PackagePlus className="h-4 w-4 shrink-0" />} onClick={() => onMovement(product, "in")}>Entrada</Button>
                        <Button variant="secondary" className="min-h-8 justify-center px-2 text-xs" icon={<PackageMinus className="h-4 w-4 shrink-0" />} disabled={productNumber(product, 0, "quantity", "stock", "Stock") <= 0} onClick={() => onMovement(product, "out")}>Salida</Button>
                      </>
                    ) : null}
                    {showInventoryActions ? (
                      <Link to={`/parts/${product.id}/edit${editReturnPath ? `?returnTo=${encodeURIComponent(editReturnPath)}` : ""}`}>
                        <Button variant="secondary" className="min-h-8 w-full px-2 text-xs">Editar</Button>
                      </Link>
                    ) : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      {footer}
    </Card>
  );
}

function StockMovementTable({ movements, footer }: { movements: StockMovement[]; footer?: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="w-[14%] break-words px-3 py-3">Fecha</th>
            <th className="w-[20%] break-words px-3 py-3">Repuesto</th>
            <th className="w-[12%] break-words px-3 py-3">Acción</th>
            <th className="w-[10%] break-words px-3 py-3">Cambio</th>
            <th className="w-[12%] break-words px-3 py-3">Stock resultante</th>
            <th className="w-[12%] break-words px-3 py-3">Precio</th>
            <th className="w-[20%] break-words px-3 py-3">Observación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {movements.length === 0 ? <tr><td className="px-3 py-5 font-semibold text-slate-500" colSpan={7}>No hay movimientos registrados.</td></tr> : null}
          {movements.map((movement) => (
            <tr key={movement.id}>
              <td className="break-words px-3 py-3">{formatDateTime(movement.createdAt)}</td>
              <td className="break-words px-3 py-3"><p className="break-words font-semibold text-slate-900">{movement.partName}</p><p className="break-words text-xs text-slate-500">{movement.partCode}</p></td>
              <td className="break-words px-3 py-3">{movement.action}</td>
              <td className={`break-words px-3 py-3 font-bold ${movement.quantityChange < 0 ? "text-red-700" : "text-emerald-700"}`}>{movement.quantityChange > 0 ? `+${movement.quantityChange}` : movement.quantityChange}</td>
              <td className="break-words px-3 py-3">{movement.resultingStock}</td>
              <td className="break-words px-3 py-3">{formatCurrency(movement.unitPrice)}</td>
              <td className="break-words px-3 py-3">{movement.comment ?? "Sin observación"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {footer}
    </Card>
  );
}

function CriticalProductsDashboardTable({ products }: { products: WarehouseProduct[] }) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="w-[30%] px-4 py-3">Repuesto</th>
            <th className="w-[18%] px-4 py-3">Referencia</th>
            <th className="w-[12%] px-4 py-3">Stock</th>
            <th className="w-[12%] px-4 py-3">Mínimo</th>
            <th className="w-[14%] px-4 py-3">Estado</th>
            <th className="w-[14%] px-4 py-3 text-right">Precio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.length === 0 ? <tr><td className="px-4 py-5 font-semibold text-slate-500" colSpan={6}>No hay repuestos críticos para mostrar.</td></tr> : null}
          {products.map((product) => (
            <tr key={product.id}>
              <td className="break-words px-4 py-3 font-semibold text-slate-900">
                {productText(product, "Repuesto", "name", "description", "Description")}
                <span className="mt-1 block text-xs font-normal text-slate-500">{productText(product, "Sin marca", "brand", "Brand")}</span>
              </td>
              <td className="break-words px-4 py-3">{productText(product, "Sin referencia", "referenceCode", "code", "Code")}</td>
              <td className="px-4 py-3 font-bold">{productNumber(product, 0, "quantity", "stock", "Stock")}</td>
              <td className="px-4 py-3">{productNumber(product, 0, "minimumStock", "MinimumStock")}</td>
              <td className="px-4 py-3"><StockStatusBadge product={product} /></td>
              <td className="break-words px-4 py-3 text-right">{formatCurrency(productNumber(product, 0, "salePrice", "unitPrice", "UnitPrice"))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function StockMovementDashboardTable({ movements }: { movements: StockMovement[] }) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="w-[18%] px-4 py-3">Fecha</th>
            <th className="w-[28%] px-4 py-3">Repuesto</th>
            <th className="w-[14%] px-4 py-3">Acción</th>
            <th className="w-[12%] px-4 py-3">Cambio</th>
            <th className="w-[12%] px-4 py-3">Stock final</th>
            <th className="w-[16%] px-4 py-3">Observación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {movements.length === 0 ? <tr><td className="px-4 py-5 font-semibold text-slate-500" colSpan={6}>No hay movimientos registrados.</td></tr> : null}
          {movements.map((movement) => (
            <tr key={movement.id}>
              <td className="break-words px-4 py-3">{formatDateTime(movement.createdAt)}</td>
              <td className="break-words px-4 py-3">
                <p className="font-semibold text-slate-900">{movement.partName}</p>
                <p className="mt-1 text-xs text-slate-500">{movement.partCode}</p>
              </td>
              <td className="break-words px-4 py-3">{movement.action}</td>
              <td className={`px-4 py-3 font-bold ${movement.quantityChange < 0 ? "text-red-700" : "text-emerald-700"}`}>{movement.quantityChange > 0 ? `+${movement.quantityChange}` : movement.quantityChange}</td>
              <td className="px-4 py-3">{movement.resultingStock}</td>
              <td className="break-words px-4 py-3">{movement.comment ?? "Sin observación"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function StockMovementModal({
  product,
  type,
  onClose,
}: {
  product?: WarehouseProduct;
  type: "in" | "out";
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState("");
  const mutation = useMutation({
    mutationFn: () => {
      if (!product) throw new Error("Selecciona un repuesto.");
      const payload = { partId: product.id, quantity, comment: comment.trim() || undefined };
      return type === "in" ? registerStockIn(payload) : registerStockOut(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["stock-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["stock-parts"] }),
        queryClient.invalidateQueries({ queryKey: ["stock-movements"] }),
        queryClient.invalidateQueries({ queryKey: ["warehouse-products"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-products"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-history"] }),
      ]);
      onClose();
    },
  });
  const isOut = type === "out";
  const invalidOut = product && isOut && quantity > product.quantity;

  return (
    <Modal open={Boolean(product)} title={isOut ? "Registrar salida de stock" : "Registrar entrada de stock"} onClose={onClose}>
      {product ? (
        <div className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-bold text-slate-900">{product.name}</p>
            <p className="text-slate-500">Stock actual: {product.quantity} · Mínimo: {product.minimumStock}</p>
          </div>
          {mutation.isError ? <ApiErrorAlert error={mutation.error} action="No se pudo registrar el movimiento" /> : null}
          <label className="block text-sm font-semibold text-slate-700">
            Cantidad
            <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="number" min={1} max={isOut ? product.quantity : undefined} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Motivo u observación
            <textarea className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2" value={comment} onChange={(event) => setComment(event.target.value)} />
          </label>
          {invalidOut ? <p className="text-sm font-semibold text-red-700">La salida no puede superar el stock disponible.</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button isLoading={mutation.isPending} disabled={quantity <= 0 || invalidOut} onClick={() => mutation.mutate()}>{isOut ? "Registrar salida" : "Registrar entrada"}</Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export function WarehouseChiefDashboardPage() {
  const dashboardQuery = useFallbackQuery(["stock-dashboard"], getStockDashboard);
  const { data: products = [] } = useFallbackQuery(["warehouse-products"], getWarehouseProducts);
  const { data: submissions = [] } = useFallbackQuery(["warehouse-submissions"], getStockSubmissions);
  const dashboard = dashboardQuery.data;
  return (
    <>
      <PageHeader title="Dashboard Jefe de Stock" description="Control operativo de cantidades, bajo stock y movimientos." actions={<Link to="/warehouse/products"><Button icon={<PackageSearch className="h-4 w-4" />}>Ver stock</Button></Link>} />
      {dashboardQuery.isError ? <ApiErrorAlert error={dashboardQuery.error} action="No se pudieron cargar las métricas de stock" /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Repuestos registrados" value={String(dashboard?.totalParts ?? products.length)} tone="blue" icon={Package} />
        <MetricCard label="Disponibles" value={String(dashboard?.availableParts ?? products.filter((item) => item.quantity > item.minimumStock).length)} tone="green" icon={PackageCheck} />
        <MetricCard label="Bajo stock" value={String(dashboard?.lowStockParts ?? products.filter((item) => item.quantity > 0 && item.quantity <= item.minimumStock).length)} tone="amber" icon={AlertTriangle} />
        <MetricCard label="Agotados" value={String(dashboard?.outOfStockParts ?? products.filter((item) => item.quantity <= 0).length)} tone="red" icon={XCircle} />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <MetricCard label="Stock pendiente por revisión" value={String(submissions.filter((item) => item.status === "PendingInventoryManagerReview").length)} tone="amber" icon={PackageSearch} />
        <MetricCard label="Stock rechazado" value={String(submissions.filter((item) => item.status === "RejectedByInventoryManager").length)} tone="red" icon={XCircle} />
        <MetricCard label="Stock aprobado" value={String(submissions.filter((item) => item.status === "ApprovedByInventoryManager").length)} tone="green" icon={PackageCheck} />
      </div>
      <div className="mt-5 grid gap-5">
        <div>
          <h2 className="mb-3 font-bold text-slate-900">Repuestos críticos</h2>
          <CriticalProductsDashboardTable products={products.filter((item) => item.quantity <= item.minimumStock).slice(0, 8)} />
        </div>
        <div>
          <h2 className="mb-3 font-bold text-slate-900">Movimientos recientes</h2>
          <StockMovementDashboardTable movements={dashboard?.recentMovements ?? []} />
        </div>
      </div>
    </>
  );
}

export function InventoryManagerDashboardPage() {
  const { data: review = [] } = useFallbackQuery(["inventory-review"], getInventoryReviewRequests);
  const { data: products = [] } = useFallbackQuery(["inventory-products"], getInventoryProducts);
  const { data: movements = [] } = useFallbackQuery(["inventory-history"], getInventoryHistory);
  return (
    <>
      <PageHeader title="Dashboard Jefe de Inventario" description="Catálogo maestro, precios, stock mínimo y revisión de stock." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Solicitudes pendientes" value={String(review.length)} tone="amber" icon={PackageSearch} />
        <MetricCard label="Repuestos en catálogo" value={String(products.length)} tone="blue" icon={Package} />
        <MetricCard label="Bajo stock" value={String(products.filter((item) => item.quantity > 0 && item.quantity <= item.minimumStock).length)} tone="amber" icon={AlertTriangle} />
        <MetricCard label="Movimientos registrados" value={String(movements.length)} tone="green" icon={History} />
      </div>
      <div className="mt-5 space-y-5">
        <section>
          <h2 className="mb-3 font-bold text-slate-900">Revisión pendiente de stock</h2>
          <InventoryReviewPage embedded />
        </section>
        <section>
          <h2 className="mb-3 font-bold text-slate-900">Catálogo reciente</h2>
          <StockProductsTable products={products.slice(0, 8)} showInventoryActions />
        </section>
      </div>
    </>
  );
}

export function MechanicOrdersPage() {
  const { data = [] } = useFallbackQuery(["mechanic-orders"], getMechanicOrders);
  return (
    <>
      <PageHeader title="Mis órdenes" description="Órdenes asignadas, estado de servicios y avance técnico." />
      <div className="grid gap-4 lg:grid-cols-2">
        {data.map((order) => (
          <Link key={order.id} to={`/mechanic/orders/${order.id}`}><ClientOrderStatusCard order={order} /></Link>
        ))}
      </div>
    </>
  );
}

export function MechanicOrderDetailPage() {
  const { id = "1" } = useParams();
  const [requestOpen, setRequestOpen] = useState(false);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [findings, setFindings] = useState("");
  const [recommendedWork, setRecommendedWork] = useState("");
  const queryClient = useQueryClient();
  const { data: order } = useFallbackQuery(["mechanic-order", id], () => getMechanicOrderById(id));
  const { data: requests = [] } = useFallbackQuery(["mechanic-requests"], getMechanicRequests);
  const diagnosticMutation = useMutation({
    mutationFn: () => submitMechanicDiagnostic(id, { findings, recommendedWork }),
    onSuccess: async () => {
      setFindings("");
      setRecommendedWork("");
      setDiagnosticOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["mechanic-diagnostics"] });
    },
  });
  if (!order) return null;
  return (
    <>
      <PageHeader
        title={order.code}
        description={`${order.customer} · ${order.vehicle} · Estado general de la orden`}
        actions={
          <>
            <Button variant="secondary">Registrar trabajo</Button>
            <Button variant="secondary" onClick={() => setDiagnosticOpen(true)}>Enviar diagnóstico</Button>
            <Button onClick={() => setRequestOpen(true)}>Solicitar servicio adicional</Button>
            <Button variant="secondary" onClick={() => setRequestOpen(true)}>Solicitar repuesto adicional</Button>
          </>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <OrderServicesTimeline services={getOrderServices(order)} />
          <Card className="p-5">
            <h2 className="font-bold text-slate-900">Historial de trabajo</h2>
            <p className="mt-2 text-sm text-slate-600">Diagnóstico inicial, cambio de aceite y revisión de frenos registrados.</p>
          </Card>
          <RequestsTable requests={requests} />
          {diagnosticOpen ? (
            <Card className="p-5">
              <h2 className="font-bold text-slate-900">Enviar diagnóstico al Jefe de Taller</h2>
              {diagnosticMutation.error ? <ApiErrorAlert error={diagnosticMutation.error} action="No se pudo enviar el diagnóstico" className="mt-4" /> : null}
              <div className="mt-4 grid gap-4">
                <label>
                  <span className="text-sm font-semibold text-slate-700">Hallazgos</span>
                  <textarea className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={findings} onChange={(event) => setFindings(event.target.value)} />
                </label>
                <label>
                  <span className="text-sm font-semibold text-slate-700">Trabajo recomendado</span>
                  <textarea className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={recommendedWork} onChange={(event) => setRecommendedWork(event.target.value)} />
                </label>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setDiagnosticOpen(false)}>Cancelar</Button>
                  <Button disabled={!findings.trim() || !recommendedWork.trim() || diagnosticMutation.isPending} onClick={() => diagnosticMutation.mutate()}>Enviar</Button>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
        <Card className="h-fit p-5">
          <h2 className="font-bold text-slate-900">Resumen</h2>
          <div className="mt-4 space-y-3 text-sm">
            <p><strong>Cliente:</strong> {order.customer}</p>
            <p><strong>Vehículo:</strong> {order.vehicle}</p>
            <p><strong>Total estimado:</strong> {formatCurrency(order.estimatedTotal)}</p>
            <ServiceOrderStatusBadge status={order.status} />
          </div>
        </Card>
      </div>
      <MechanicRequestModal open={requestOpen} onClose={() => setRequestOpen(false)} defaultOrderId={id} />
    </>
  );
}

export function MechanicRequestsPage() {
  const { data = [] } = useFallbackQuery(["mechanic-requests"], getMechanicRequests);
  const [requestOpen, setRequestOpen] = useState(false);
  return (
    <>
      <PageHeader
        title="Mis solicitudes"
        description="Solicitudes adicionales enviadas al Jefe de Taller y su respuesta."
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setRequestOpen(true)}>Hacer solicitud a orden</Button>}
      />
      <RequestsTable requests={data} allowReviewActions={false} />
      <MechanicRequestModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </>
  );
}

export function MechanicDiagnosticsPage() {
  const query = useFallbackQuery(["mechanic-diagnostics"], getMechanicDiagnostics);
  const ordersQuery = useQuery({
    queryKey: ["service-orders-for-mechanic-diagnostics"],
    queryFn: () => serviceOrdersService.list({ pageNumber: 1, pageSize: 500 }),
    staleTime: 60_000,
  });
  const diagnostics = query.data ?? [];
  const diagnosticOrders = (ordersQuery.data?.data ?? []).filter((order) =>
    String(order.generalDescription ?? "").toLowerCase().includes("problema reportado"),
  );
  const diagnosticOrderRows: MechanicDiagnostic[] = diagnosticOrders
    .filter((order) => !diagnostics.some((diagnostic) => diagnostic.serviceOrderId === order.id))
    .map((order) => ({
      id: `order-${order.id}`,
      serviceOrderId: order.id,
      orderCode: order.code,
      customer: order.customer,
      vehicle: order.vehicle,
      mechanicPersonId: "",
      mechanic: order.mechanic,
      status: "PendingWorkshopChiefApproval",
      findings: order.generalDescription || order.workPerformed || "Orden de diagnóstico creada.",
      recommendedWork: "Pendiente de registrar diagnóstico.",
      submittedAt: order.entryDate,
    }));
  const visibleDiagnostics = [...diagnosticOrderRows, ...diagnostics];
  return (
    <>
      <PageHeader title="Mis diagnósticos" description="Diagnósticos enviados al Jefe de Taller y estado de aprobación." />
      {query.isError ? <ApiErrorAlert error={query.error} action="No se pudieron cargar los diagnósticos" className="mb-4" /> : null}
      {ordersQuery.isError ? <ApiErrorAlert error={ordersQuery.error} action="No se pudieron cargar las órdenes de diagnóstico" className="mb-4" /> : null}
      <DiagnosticTable diagnostics={visibleDiagnostics} />
    </>
  );
}

export function WorkshopChiefDiagnosticsPendingPage() {
  const query = useFallbackQuery(["workshop-chief-diagnostics"], getWorkshopChiefDiagnostics);
  const diagnostics = (query.data ?? []).filter((item) => item.status === "PendingWorkshopChiefApproval");
  return (
    <>
      <PageHeader title="Diagnósticos por aprobar" description="Diagnósticos enviados por mecánicos de diagnóstico pendientes de decisión." />
      {query.isError ? <ApiErrorAlert error={query.error} action="No se pudieron cargar los diagnósticos" className="mb-4" /> : null}
      <DiagnosticTable diagnostics={diagnostics} detailPathPrefix="/workshop-chief/diagnostics" />
    </>
  );
}

export function WorkshopChiefDiagnosticsHistoryPage() {
  const query = useFallbackQuery(["workshop-chief-diagnostics"], getWorkshopChiefDiagnostics);
  const diagnostics = query.data ?? [];
  return (
    <>
      <PageHeader title="Historial de diagnósticos" description="Diagnósticos aprobados y desaprobados por el Jefe de Taller." />
      <div className="space-y-5">
        <section>
          <h2 className="mb-3 font-bold text-slate-900">Aprobados</h2>
          <DiagnosticTable diagnostics={diagnostics.filter((item) => item.status === "Approved")} detailPathPrefix="/workshop-chief/diagnostics" />
        </section>
        <section>
          <h2 className="mb-3 font-bold text-slate-900">Desaprobados</h2>
          <DiagnosticTable diagnostics={diagnostics.filter((item) => item.status === "Rejected")} detailPathPrefix="/workshop-chief/diagnostics" />
        </section>
      </div>
    </>
  );
}

export function WorkshopChiefDiagnosticDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const query = useFallbackQuery(["workshop-chief-diagnostic", id], () => getWorkshopChiefDiagnosticById(id));
  const diagnostic = query.data;
  useEffect(() => setComment(diagnostic?.workshopChiefComment ?? ""), [diagnostic?.id, diagnostic?.workshopChiefComment]);
  const approveMutation = useMutation({
    mutationFn: () => approveMechanicDiagnostic(id, comment.trim() || "Diagnóstico aprobado."),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workshop-chief-diagnostics"] });
      navigate("/workshop-chief/diagnostics/history");
    },
  });
  const rejectMutation = useMutation({
    mutationFn: () => rejectMechanicDiagnostic(id, comment.trim() || "Diagnóstico desaprobado."),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workshop-chief-diagnostics"] });
      navigate("/workshop-chief/diagnostics/history");
    },
  });
  const canReview = diagnostic?.status === "PendingWorkshopChiefApproval";
  return (
    <>
      <PageHeader title={diagnostic?.orderCode ?? "Detalle diagnóstico"} description={diagnostic ? `${diagnostic.customer} · ${diagnostic.vehicle}` : "Revisión de diagnóstico"} actions={<Link to="/workshop-chief/diagnostics"><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>} />
      {query.isError ? <ApiErrorAlert error={query.error} action="No se pudo cargar el diagnóstico" className="mb-4" /> : null}
      {approveMutation.error || rejectMutation.error ? <ApiErrorAlert error={approveMutation.error ?? rejectMutation.error} action="No se pudo procesar el diagnóstico" className="mb-4" /> : null}
      {diagnostic ? (
        <Card className="p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Info label="Orden" value={diagnostic.orderCode} />
            <Info label="Mecánico" value={diagnostic.mechanic} />
            <Info label="Cliente" value={diagnostic.customer} />
            <Info label="Vehículo" value={diagnostic.vehicle} />
          </div>
          <div className="mt-5 grid gap-4">
            <Info label="Hallazgos" value={diagnostic.findings} />
            <Info label="Trabajo recomendado" value={diagnostic.recommendedWork} />
            <label>
              <span className="text-sm font-semibold text-slate-700">Comentario del Jefe de Taller</span>
              <textarea className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={comment} onChange={(event) => setComment(event.target.value)} disabled={!canReview} />
            </label>
          </div>
          {canReview ? <div className="mt-5 flex justify-end gap-2"><Button variant="danger" onClick={() => rejectMutation.mutate()}>Desaprobar</Button><Button onClick={() => approveMutation.mutate()}>Aprobar</Button></div> : null}
        </Card>
      ) : null}
    </>
  );
}

export function WorkshopChiefRequestsPage() {
  const query = useFallbackQuery(["workshop-chief-requests"], getWorkshopChiefRequests);
  const data = query.data ?? [];
  return (
    <>
      <PageHeader title="Solicitudes de mecánicos" description="Aprueba, deniega o envía solicitudes adicionales al cliente." />
      {query.isError ? <ApiErrorAlert error={query.error} action="No se pudieron cargar las solicitudes de mecánicos" className="mb-4" /> : null}
      <RequestsTable requests={data} detailPathPrefix="/workshop-chief/requests" />
    </>
  );
}

export function WorkshopChiefRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const query = useFallbackQuery(["workshop-chief-request", id ?? "req-1"], () => getWorkshopChiefRequestById(id ?? "req-1"));
  const request = query.data;
  useEffect(() => {
    setComment(request?.workshopChiefComment ?? "");
  }, [request?.id, request?.workshopChiefComment]);
  const approveMutation = useMutation({
    mutationFn: () => approveRequestByWorkshopChief(id ?? "", comment.trim() || "Aprobado por jefe de taller."),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workshop-chief-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["workshop-chief-request", id ?? "req-1"] });
      navigate("/workshop-chief/requests");
    },
  });
  const rejectMutation = useMutation({
    mutationFn: () => rejectRequestByWorkshopChief(id ?? "", comment.trim() || "Rechazado por jefe de taller."),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workshop-chief-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["workshop-chief-request", id ?? "req-1"] });
      navigate("/workshop-chief/requests");
    },
  });
  const mutationError = approveMutation.error ?? rejectMutation.error;
  const isWorking = approveMutation.isPending || rejectMutation.isPending;
  const canReview = request?.status === "PendingWorkshopChiefApproval";

  return (
    <>
      <PageHeader
        title={request?.orderCode ?? "Detalle de solicitud técnica"}
        description={request ? `${request.vehicle} · ${request.customer}` : "Revisión de Jefe de Taller."}
        actions={<Link to="/workshop-chief/requests"><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>}
      />
      {query.isError ? <ApiErrorAlert error={query.error} action="No se pudo cargar el detalle de la solicitud técnica" className="mb-4" /> : null}
      {mutationError ? <ApiErrorAlert error={mutationError} action="No se pudo procesar la solicitud del mecánico" className="mb-4" /> : null}
      {!request && !query.isError ? <Card className="p-5 text-sm text-slate-600">Cargando solicitud...</Card> : null}
      {request ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Card className="p-5">
              <h2 className="font-bold text-slate-900">Información de la orden</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <Info label="Orden" value={request.orderCode} />
                <Info label="Cliente" value={request.customer} />
                <Info label="Vehículo" value={request.vehicle} />
                <Info label="Mecánico asociado" value={request.mechanic} />
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="font-bold text-slate-900">Solicitud del mecánico</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <Info label="Tipo" value={request.requestType === "Service" ? "Servicio" : "Repuesto"} />
                <Info label="Servicio sugerido" value={request.suggestedService} />
                <Info label="Repuesto sugerido" value={request.suggestedPart ?? "No aplica"} />
                <Info label="Precio estimado" value={formatCurrency(request.estimatedPrice)} />
              </div>
              <div className="mt-5 rounded-md border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">Comentario técnico</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{request.technicalJustification}</p>
              </div>
            </Card>

            <Card className="p-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Comentario del Jefe de Taller</span>
                <textarea
                  className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  value={comment}
                  readOnly={!canReview}
                  onChange={(event) => setComment(event.target.value)}
                />
              </label>
              {canReview ? (
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button variant="secondary" isLoading={isWorking} onClick={() => rejectMutation.mutate()}>Denegar solicitud</Button>
                  <Button isLoading={isWorking} onClick={() => approveMutation.mutate()}>Aprobar y enviar al cliente</Button>
                </div>
              ) : (
                <p className="mt-3 text-sm font-semibold text-slate-500">Esta solicitud ya fue revisada por el jefe de taller. Solo está disponible para consulta.</p>
              )}
            </Card>
          </div>

          <Card className="p-5">
            <p className="text-xs font-bold uppercase text-slate-400">Estado</p>
            <div className="mt-2"><AdditionalRequestStatusBadge status={request.status} /></div>
            <p className="mt-5 text-xs font-bold uppercase text-slate-400">Total estimado</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(request.estimatedPrice)}</p>
            <p className="mt-3 text-sm text-slate-600">Esta solicitud está asociada a la orden {request.orderCode}.</p>
          </Card>
        </div>
      ) : null}
    </>
  );
}

export function WorkshopServicesPage() {
  const query = useFallbackQuery(["workshop-services"], getWorkshopServices);
  const data = query.data ?? [];
  return (
    <>
      <PageHeader title="Servicios del taller" description="Servicios base creados por el Jefe de Taller con cálculo de repuestos y mano de obra." actions={<Link to="/workshop/services/new"><Button icon={<Plus className="h-4 w-4" />}>Crear servicio</Button></Link>} />
      {query.isError ? <ApiErrorAlert error={query.error} action="No se pudieron cargar los servicios del taller" className="mb-4" /> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {data.map((service) => (
          <Card key={service.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">{service.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{service.category}</p>
              </div>
              <WorkshopServiceStatusBadge status={service.status} />
            </div>
            <p className="mt-3 text-sm text-slate-600">{service.description}</p>
            <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
              <Info label="Repuestos" value={formatCurrency(service.partsTotal)} />
              <Info label="Mano de obra" value={formatCurrency(service.laborValue)} />
              <Info label="Precio final" value={formatCurrency(service.finalPrice)} />
            </div>
            <Link className="mt-4 inline-block text-sm font-bold text-blue-700" to={`/workshop/services/${service.id}/edit`}>Editar</Link>
          </Card>
        ))}
      </div>
    </>
  );
}

export function WorkshopServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useFallbackQuery(["workshop-services"], getWorkshopServices);
  const partsQuery = useFallbackQuery(["workshop-service-parts"], getAvailableWorkshopParts);
  const data = query.data ?? [];
  const service = data.find((item) => item.id === id);
  const saveMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createWorkshopService>[0]) =>
      id ? updateWorkshopService(id, payload) : createWorkshopService(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workshop-services"] });
      navigate("/workshop/services");
    },
  });
  return (
    <>
      <PageHeader title={id ? "Editar servicio del taller" : "Nuevo servicio del taller"} description="Asocia repuestos, define porcentaje de mano de obra y calcula el precio final." />
      {query.isError ? <ApiErrorAlert error={query.error} action="No se pudo cargar la información del servicio del taller" className="mb-4" /> : null}
      {partsQuery.isError ? <ApiErrorAlert error={partsQuery.error} action="No se pudieron cargar los repuestos disponibles del inventario" className="mb-4" /> : null}
      {saveMutation.isError ? <ApiErrorAlert error={saveMutation.error} action="No se pudo guardar el servicio del taller" className="mb-4" /> : null}
      <WorkshopServiceForm service={service} availableParts={partsQuery.data ?? []} isSaving={saveMutation.isPending} onSave={(payload) => saveMutation.mutate(payload)} />
    </>
  );
}

export function ClientOrdersPage() {
  const { data = [] } = useFallbackQuery(["client-orders"], operationsService.getClientOrders);
  const approvedOrders = data.filter((order) => !isPendingClientApproval(order));
  return (
    <>
      <PageHeader title="Mis órdenes" description="Historial, órdenes activas, estados de pago y entregas." />
      {approvedOrders.length === 0 ? <Card className="p-5 text-sm text-slate-600">No tienes órdenes aprobadas o en proceso.</Card> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {approvedOrders.map((order) => <Link key={order.id} to={`/client/orders/${order.id}`}><ClientOrderStatusCard order={order} /></Link>)}
      </div>
    </>
  );
}

export function ClientOrderDetailPage() {
  const { id = "1" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: order } = useFallbackQuery(["client-order", id], () => operationsService.getClientOrderById(id));
  const { data: requests = [] } = useFallbackQuery(["client-approvals"], getClientPendingApprovals);
  const approveOrderMutation = useMutation({
    mutationFn: () => operationsService.approveClientOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(["client-order", id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ["client-orders"] });
      queryClient.invalidateQueries({ queryKey: ["client-orders-pending-approval"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-client-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-client-invoices"] });
      navigate("/client/orders");
    },
  });
  const rejectOrderMutation = useMutation({
    mutationFn: () => operationsService.rejectClientOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(["client-order", id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ["client-orders"] });
      queryClient.invalidateQueries({ queryKey: ["client-orders-pending-approval"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-client-orders"] });
      navigate("/client/approvals");
    },
  });
  if (!order) return null;
  const cameFromApprovals = location.pathname.startsWith("/client/approvals");
  const orderRequests = order.additionalRequests?.length ? order.additionalRequests : requests.filter((request) => requestBelongsToOrder(request, order));
  const canPayOrder = order.canPay === true || order.status === "WaitingForPayment";
  const payDisabled = !canPayOrder;
  const payButton = (
    <Button
      disabled={payDisabled}
      className={payDisabled ? "cursor-not-allowed bg-gray-300 text-gray-500" : "bg-blue-600 text-white"}
      icon={<CreditCard className="h-4 w-4" />}
    >
      Pagar
    </Button>
  );
  return (
    <>
      <PageHeader
        title={order.code}
        description={`${order.vehicle} · ${order.customer}`}
        actions={
          <>
            <Link to={cameFromApprovals ? "/client/approvals" : "/client/orders"}>
              <Button variant="secondary">{cameFromApprovals ? "Regresar a órdenes por aprobar" : "Regresar a mis órdenes"}</Button>
            </Link>
            {canPayOrder ? <Link to={`/client/payments/new?orderId=${order.id}`}>{payButton}</Link> : payButton}
          </>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <OrderPaymentAlert order={order} />
          <OrderServicesTimeline services={getOrderServices(order)} />
          {order.status === "PendingClientApproval" ? (
            <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <h2 className="font-bold text-slate-900">Aprobación de la orden</h2>
                <p className="mt-1 text-sm text-slate-600">Revisa los servicios registrados y aprueba la orden para que el taller continúe.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  icon={<XCircle className="h-4 w-4" />}
                  isLoading={rejectOrderMutation.isPending}
                  onClick={() => rejectOrderMutation.mutate()}
                >
                  Rechazar
                </Button>
                <Button
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  isLoading={approveOrderMutation.isPending}
                  onClick={() => approveOrderMutation.mutate()}
                >
                  Aprobar orden
                </Button>
              </div>
            </Card>
          ) : null}
          <Card className="p-5"><h2 className="font-bold text-slate-900">Mensajes del Jefe de Taller</h2><p className="mt-2 text-sm text-slate-600">Se recomienda aprobar el cambio de filtro para completar el mantenimiento.</p></Card>
          <Card className="p-5">
            <h2 className="font-bold text-slate-900">Solicitudes de esta orden</h2>
            <div className="mt-3">
              <ClientOrderRequestActionsList requests={orderRequests} emptyMessage="Esta orden no tiene solicitudes pendientes por aprobar." />
            </div>
          </Card>
        </div>
        <Card className="h-fit p-5">
          <h2 className="font-bold text-slate-900">Estado general</h2>
          <div className="mt-4 space-y-3 text-sm">
            <ServiceOrderStatusBadge status={order.status} />
            <p><strong>Total estimado:</strong> {formatCurrency(order.estimatedTotal)}</p>
            <p><strong>Factura:</strong> FV-1054</p>
          </div>
        </Card>
      </div>
    </>
  );
}

export function ClientApprovalsPage() {
  const { data = [] } = useFallbackQuery(["client-orders-pending-approval"], operationsService.getClientOrders);
  const ordersPendingApproval = data.filter(isPendingClientApproval);
  return (
    <>
      <PageHeader title="Órdenes por aprobar" description="Órdenes completas que tienen aprobación pendiente del cliente." />
      {ordersPendingApproval.length === 0 ? <Card className="p-5 text-sm text-slate-600">No tienes órdenes completas pendientes por aprobar.</Card> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {ordersPendingApproval.map((order) => (
          <Link key={order.id} to={`/client/approvals/${order.id}`}>
            <ClientOrderStatusCard order={order} />
          </Link>
        ))}
      </div>
    </>
  );
}

export function ClientOrderRequestsPage() {
  const { data = [] } = useFallbackQuery(["client-approvals"], getClientPendingApprovals);
  return (
    <>
      <PageHeader title="Solicitudes de órdenes" description="Solicitudes adicionales asociadas a una orden específica." />
      <ClientOrderRequestActionsList requests={data} emptyMessage="No tienes solicitudes de órdenes pendientes por aprobar." />
    </>
  );
}

export function ClientPaymentNewPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId") ?? "2";
  const queryClient = useQueryClient();
  const [method, setMethod] = useState("Transferencia");
  const [cardLastFourDigits, setCardLastFourDigits] = useState("1234");
  const [cardHolderName, setCardHolderName] = useState("Carlos Rojas");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [sent, setSent] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const { data: order } = useFallbackQuery(["client-order-payment", orderId], () => operationsService.getClientOrderById(orderId));
  const isCard = method === "Tarjeta";
  const paymentMethodId = method === "Tarjeta" ? 2 : method === "Efectivo" ? 3 : 1;
  const paymentPayload = {
    invoiceId: order?.invoiceId ?? 0,
    serviceOrderId: Number(order?.id ?? orderId),
    paymentMethodId,
    amount: order?.estimatedTotal ?? 620000,
    cardLastFourDigits: isCard ? cardLastFourDigits : null,
    cardHolderName: isCard ? cardHolderName : null,
    cardBrand: isCard ? cardBrand : null,
  };
  const submitPayment = async () => {
    setSent(false);
    setPaymentError("");
    setIsSubmittingPayment(true);
    try {
      await operationsService.submitClientPayment(paymentPayload);
      const updatedOrder = order
        ? {
            ...order,
            status: "PaymentUnderReview",
            canPay: false,
            paymentStatus: "PendingReceptionVerification" as const,
            paymentMessage: "Pago enviado. Tu pago está pendiente de verificación por recepción.",
          }
        : undefined;

      if (updatedOrder) {
        queryClient.setQueryData<ServiceOrder[]>(["client-orders"], (current = []) =>
          current.map((item) => (item.id === updatedOrder.id ? updatedOrder : item)),
        );
        queryClient.setQueryData(["client-order", updatedOrder.id], updatedOrder);
        queryClient.setQueryData(["client-order-payment", updatedOrder.id], updatedOrder);
        queryClient.setQueryData(["client-order", orderId], updatedOrder);
        queryClient.setQueryData(["client-order-payment", orderId], updatedOrder);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["client-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["client-order"] }),
        queryClient.invalidateQueries({ queryKey: ["client-order-payment"] }),
        queryClient.invalidateQueries({ queryKey: ["client-payments"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-client-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-client-invoices"] }),
      ]);
      setSent(true);
    } catch (error) {
      setPaymentError(formatApiError(error, "No se pudo generar el pago"));
    } finally {
      setIsSubmittingPayment(false);
    }
  };
  return (
    <>
      <PageHeader title="Registrar pago" description="El pago queda enviado para verificación por recepción." />
      {sent ? <PaymentSuccessMessage status="PendingReceptionVerification" /> : null}
      {paymentError ? <Card className="mt-5 border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{paymentError}</Card> : null}
      <Card className="mt-5 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Orden" value={order?.code ?? "OT-2026-0020"} />
          <Info label="Cliente" value={order?.customer ?? "Laura Méndez"} />
          <Info label="Total a pagar" value={formatCurrency(order?.estimatedTotal ?? 620000)} />
          <label className="text-sm font-semibold text-slate-700">Método de pago<select className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" value={method} onChange={(event) => setMethod(event.target.value)}><option>Transferencia</option><option>Tarjeta</option><option>Efectivo</option></select></label>
        </div>
        {isCard ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="text-sm font-semibold text-slate-700">Últimos 4 dígitos<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" maxLength={4} value={cardLastFourDigits} onChange={(event) => setCardLastFourDigits(event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Titular<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" value={cardHolderName} onChange={(event) => setCardHolderName(event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Franquicia<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" value={cardBrand} onChange={(event) => setCardBrand(event.target.value)} /></label>
          </div>
        ) : null}
        <div className="mt-5 flex justify-end"><Button onClick={submitPayment} disabled={isSubmittingPayment}>{isSubmittingPayment ? "Enviando..." : "Enviar pago para verificación"}</Button></div>
      </Card>
    </>
  );
}

export function ClientPaymentsPage() {
  const { data = [] } = useFallbackQuery(["client-payments"], getClientPayments);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filteredPayments = data.filter((payment) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [
      payment.customer,
      payment.clientNumber,
      payment.orderCode,
      payment.invoiceNumber,
      payment.method,
      payment.reference,
      getPaymentStatusLabel(payment.status),
      payment.date,
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
  });
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (
    <>
      <PageHeader title="Pagos" description="Historial de pagos registrados y estado de verificación por recepción." />
      <PaymentVerificationTable
        payments={pagedPayments}
        onSelect={(payment) => navigate(`/client/payments/${payment.id}`)}
        toolbar={
          <TableToolbar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Buscar por cliente, orden, factura, referencia o estado"
            showFiltersButton={false}
          />
        }
        footer={<TablePagination page={currentPage} pageSize={pageSize} totalCount={filteredPayments.length} onPageChange={setPage} />}
      />
    </>
  );
}

function PaymentDetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function ClientPaymentDetailPage() {
  const { id } = useParams();
  const query = useQuery({
    queryKey: ["client-payment", id],
    queryFn: () => getClientPaymentById(id ?? ""),
    enabled: Boolean(id),
  });

  if (query.isLoading) return <Card className="p-5 text-sm text-slate-600">Cargando detalle del pago...</Card>;
  if (query.isError) return <ApiErrorAlert error={query.error} action="No se pudo cargar el detalle del pago" />;

  const payment = query.data;
  if (!payment) return <Card className="p-5 text-sm text-slate-600">No se encontró el pago.</Card>;

  return (
    <>
      <PageHeader
        title={`Pago ${payment.reference}`}
        description={`${payment.orderCode} · ${payment.customer}`}
        actions={<Link to="/client/payments"><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <PaymentDetailItem label="Referencia" value={payment.reference} />
            <PaymentDetailItem label="Cliente" value={payment.clientNumber ? `${payment.customer} · Cliente #${payment.clientNumber}` : payment.customer} />
            <PaymentDetailItem label="Orden" value={payment.orderCode} />
            <PaymentDetailItem label="Factura" value={payment.invoiceNumber} />
            <PaymentDetailItem label="Método" value={payment.method} />
            <PaymentDetailItem label="Fecha" value={formatDateTime(payment.date)} />
            <PaymentDetailItem label="Valor" value={formatCurrency(payment.amount)} />
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Estado</p>
              <div className="mt-1">
                <Badge tone={getPaymentStatusTone(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-slate-400">Resumen</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(payment.amount)}</p>
          <p className="mt-2 text-sm text-slate-600">Pago asociado a la factura {payment.invoiceNumber}.</p>
        </Card>
      </div>
    </>
  );
}

export function ClientMessagesPage() {
  const { data = [] } = useFallbackQuery(["client-messages"], operationsService.getClientMessages);
  return <SimpleListPage title="Mensajes" description="Mensajes del Jefe de Taller." items={data} />;
}

export function ClientHistoryPage() {
  return <SimpleListPage title="Historial" description="Órdenes entregadas y facturación histórica." items={["OT-2026-0010 · Entregada · $380.000", "OT-2026-0004 · Entregada · $1.250.000"]} />;
}

export function WarehouseProductsPage({ embedded = false }: { embedded?: boolean }) {
  const role = useAuth((state) => state.role);
  const canEditStock = role === "Admin";
  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [movement, setMovement] = useState<{ product: WarehouseProduct; type: "in" | "out" } | undefined>();
  const { data = [], isError, error } = useQuery({
    queryKey: ["stock-parts", search, stockStatus],
    queryFn: () => getStockParts({ search, stockStatus }),
    staleTime: 60_000,
  });
  useEffect(() => setPage(1), [search, stockStatus]);
  const pagedProducts = useMemo(() => data.slice((page - 1) * pageSize, page * pageSize), [data, page]);
  return (
    <>
      {!embedded ? (
        <PageHeader
          title="Stock operativo"
          description="Cantidades reales disponibles y movimientos de repuestos."
          actions={<Link to="/warehouse/products/new"><Button icon={<Plus className="h-4 w-4" />}>Solicitar reposición</Button></Link>}
        />
      ) : null}
      {isError ? <ApiErrorAlert error={error} action="No se pudo cargar el stock" /> : null}
      <Card className={embedded ? "mt-5 p-4" : "p-4"}>
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Buscar por nombre, categoría, marca o referencia"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={stockStatus} onChange={(event) => setStockStatus(event.target.value)}>
            <option value="">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="low">Bajo stock</option>
            <option value="out">Agotado</option>
          </select>
        </div>
      </Card>
      <div className="mt-4">
        <StockProductsTable
          products={pagedProducts}
          onMovement={(product, type) => setMovement({ product, type })}
          showInventoryActions={canEditStock}
          editReturnPath="/warehouse/products"
          footer={<TablePagination page={page} pageSize={pageSize} totalCount={data.length} onPageChange={setPage} />}
        />
      </div>
      <div className="mt-5">
        <h2 className="mb-3 font-bold text-slate-900">Historial de movimientos</h2>
        <StockMovementsPanel />
      </div>
      <StockMovementModal product={movement?.product} type={movement?.type ?? "in"} onClose={() => setMovement(undefined)} />
    </>
  );
}

export function WarehouseProductFormPage() {
  return (
    <>
      <PageHeader
        title="Solicitar reposición"
        description="Registra el producto, calcula el precio y envía la reposición al Jefe de Almacén."
        actions={<Link to="/warehouse/products"><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>}
      />
      <StockSubmissionForm />
    </>
  );
}

export function WarehouseStockSubmissionsPage() {
  const navigate = useNavigate();
  const { data = [], isError, error } = useFallbackQuery(["warehouse-submissions"], getStockSubmissions);
  return (
    <>
      <PageHeader
        title="Envíos a almacén"
        description="Stock enviado a revisión, rechazado o aprobado por Jefe de Almacén."
      />
      {isError ? <ApiErrorAlert error={error} action="No se pudieron cargar las reposiciones enviadas" /> : null}
      <StockSubmissionList submissions={data} onSelect={(submission) => navigate(`/warehouse/stock-submissions/${submission.submissionId}`)} />
    </>
  );
}

export function WarehouseStockSubmissionDetailPage() {
  const { id = "stk-1" } = useParams();
  const { data } = useFallbackQuery(["warehouse-submission", id], () => getStockSubmissionById(id));
  return (
    <>
      <PageHeader title="Detalle de envío a almacén" description="Estado y comentarios de revisión." />
      {data ? <StockSubmissionCard submission={data} /> : null}
    </>
  );
}

export function InventoryReviewPage({ embedded = false }: { embedded?: boolean }) {
  const { data = [] } = useFallbackQuery(["inventory-review"], getInventoryReviewRequests);
  const navigate = useNavigate();
  return (
    <>
      {!embedded ? <PageHeader title="Revisión de stock" description="Solicitudes de stock pendientes por Jefe de Almacén." /> : null}
      <StockReviewTable submissions={data} onSelect={(submission) => navigate(`/inventory/review/${submission.submissionId}`)} />
    </>
  );
}

export function InventoryReviewDetailPage() {
  const { id = "stk-1" } = useParams();
  const { data } = useFallbackQuery(["inventory-review-detail", id], () => getInventoryReviewRequestById(id));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const approveMutation = useMutation({
    mutationFn: () => approveStockSubmission(id, comment.trim() || "Aprobado por jefe de inventario."),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory-review"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-products"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-history"] }),
        queryClient.invalidateQueries({ queryKey: ["warehouse-submissions"] }),
      ]);
      navigate("/inventory/review");
    },
  });
  const rejectMutation = useMutation({
    mutationFn: () => rejectStockSubmission(id, comment.trim()),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory-review"] }),
        queryClient.invalidateQueries({ queryKey: ["warehouse-submissions"] }),
      ]);
      navigate("/inventory/review");
    },
  });
  const isWorking = approveMutation.isPending || rejectMutation.isPending;
  const mutationError = approveMutation.error ?? rejectMutation.error;
  return (
    <>
      <PageHeader
        title="Detalle revisión de stock"
        description="Aprobar o rechazar solicitud de bodega."
        actions={<Link to="/inventory/review"><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>}
      />
      {data ? <StockSubmissionCard submission={data} /> : null}
      {mutationError ? <ApiErrorAlert error={mutationError} action="No se pudo procesar la revisión de stock" className="mt-4" /> : null}
      {data ? (
        <Card className="mt-4 p-5">
          <label className="block text-sm font-semibold text-slate-700">
            Comentario de revisión
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Escribe una observación para aprobar o el motivo si vas a rechazar."
            />
          </label>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button variant="secondary" isLoading={rejectMutation.isPending} disabled={isWorking || !comment.trim()} onClick={() => rejectMutation.mutate()}>Rechazar</Button>
            <Button isLoading={approveMutation.isPending} disabled={isWorking} onClick={() => approveMutation.mutate()}>Aceptar</Button>
          </div>
        </Card>
      ) : null}
    </>
  );
}

export function InventoryProductsPage() {
  const { data = [] } = useFallbackQuery(["inventory-products"], getInventoryProducts);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filteredProducts = data.filter((product) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [
      product.category,
      product.name,
      product.brand,
      product.referenceCode,
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
  });
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (
    <>
      <PageHeader title="Catálogo maestro de inventario" description="Repuestos aprobados desde stock, precios, stock mínimo y estado del catálogo." />
      <Card className="mb-4 p-4">
        <input
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          placeholder="Buscar por categoría, repuesto, marca o referencia"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </Card>
      <StockProductsTable
        products={pagedProducts}
        showInventoryActions
        footer={<TablePagination page={currentPage} pageSize={pageSize} totalCount={filteredProducts.length} onPageChange={setPage} />}
      />
    </>
  );
}

export function InventoryHistoryPage() {
  const { data = [] } = useFallbackQuery(["inventory-history"], getInventoryHistory);
  const [partSearch, setPartSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [actionSearch, setActionSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filteredMovements = data.filter((movement) => {
    const partTerm = partSearch.trim().toLowerCase();
    const dateTerm = dateSearch.trim().toLowerCase();
    const actionTerm = actionSearch.trim().toLowerCase();
    const partMatches = !partTerm || [movement.partName, movement.partCode].some((value) => String(value).toLowerCase().includes(partTerm));
    const dateMatches = !dateTerm || [movement.createdAt, formatDateTime(movement.createdAt)].some((value) => String(value).toLowerCase().includes(dateTerm));
    const actionMatches = !actionTerm || movement.action.toLowerCase().includes(actionTerm);
    return partMatches && dateMatches && actionMatches;
  });
  const totalPages = Math.max(1, Math.ceil(filteredMovements.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedMovements = filteredMovements.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (
    <>
      <PageHeader title="Historial de inventario" description="Aprobaciones, rechazos y movimientos de stock." />
      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Buscar por repuesto o código"
            value={partSearch}
            onChange={(event) => {
              setPartSearch(event.target.value);
              setPage(1);
            }}
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Buscar por fecha"
            value={dateSearch}
            onChange={(event) => {
              setDateSearch(event.target.value);
              setPage(1);
            }}
          />
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Buscar por acción"
            value={actionSearch}
            onChange={(event) => {
              setActionSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </Card>
      <StockMovementTable
        movements={pagedMovements}
        footer={<TablePagination page={currentPage} pageSize={pageSize} totalCount={filteredMovements.length} onPageChange={setPage} />}
      />
    </>
  );
}

function StockMovementsPanel() {
  const { data = [], isError, error } = useFallbackQuery(["stock-movements"], getStockMovements);
  return (
    <>
      {isError ? <ApiErrorAlert error={error} action="No se pudo cargar el historial de movimientos" /> : null}
      <StockMovementTable movements={data} />
    </>
  );
}

export function ReceptionPaymentsVerificationPage() {
  const { data = [] } = useFallbackQuery(["payments-verification"], getPaymentsPendingReceptionVerification);
  const [selected, setSelected] = useState<ClientPayment | undefined>();
  return (
    <>
      <PageHeader title="Verificación de pagos" description="Recepción aprueba pagos, rechaza novedades y confirma fecha de entrega." />
      <PaymentVerificationTable payments={data} onSelect={setSelected} />
      <PaymentVerificationDrawer open={Boolean(selected)} payment={selected} onClose={() => setSelected(undefined)} />
    </>
  );
}

export function ReceptionDeliveriesPage() {
  const { data = [], isError, error } = useFallbackQuery(["reception-deliveries"], getReceptionApprovedPayments);
  return (
    <>
      {isError ? <ApiErrorAlert error={error} action="No se pudieron cargar las entregas" /> : null}
      <SimpleListPage
        title="Entregas"
        description="Vehículos listos para entrega tras pago verificado."
        items={data.map((payment) => `${payment.orderCode} · ${payment.customer} · Entrega ${payment.deliveryDate ?? "por confirmar"}`)}
      />
    </>
  );
}

function RequestsTable({
  requests,
  className = "",
  title,
  allowReviewActions = true,
  compact = false,
  detailPathPrefix,
}: {
  requests: AdditionalRequest[];
  className?: string;
  title?: string;
  allowReviewActions?: boolean;
  compact?: boolean;
  detailPathPrefix?: string;
}) {
  const [selected, setSelected] = useState<AdditionalRequest | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const queryClient = useQueryClient();
  const refreshRequests = async () => {
    await queryClient.invalidateQueries({ queryKey: ["workshop-chief-requests"] });
  };
  const approveMutation = useMutation({
    mutationFn: ({ requestId, comment }: { requestId: string; comment: string }) =>
      approveRequestByWorkshopChief(requestId, comment.trim() || "Aprobado por jefe de taller."),
    onSuccess: async () => {
      setSelected(undefined);
      await refreshRequests();
    },
  });
  const rejectMutation = useMutation({
    mutationFn: ({ requestId, comment }: { requestId: string; comment: string }) =>
      rejectRequestByWorkshopChief(requestId, comment.trim() || "Rechazado por jefe de taller."),
    onSuccess: async () => {
      setSelected(undefined);
      await refreshRequests();
    },
  });
  const isWorking = approveMutation.isPending || rejectMutation.isPending;
  const mutationError = approveMutation.error ?? rejectMutation.error;

  const approve = (request: AdditionalRequest, comment = "") => approveMutation.mutate({ requestId: request.id, comment });
  const reject = (request: AdditionalRequest, comment = "") => rejectMutation.mutate({ requestId: request.id, comment });
  const filteredRequests = requests.filter((request) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [
      request.createdAt,
      request.mechanic,
      request.orderCode,
      request.customer,
      request.vehicle,
      request.requestType === "Service" ? "Servicio" : "Repuesto",
      request.status,
      request.suggestedService,
      request.suggestedPart,
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
  });
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRequests = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Card className={`overflow-hidden ${className}`}>
      {title ? <div className="border-b border-slate-200 px-4 py-3"><h2 className="font-bold text-slate-900">{title}</h2></div> : null}
      {mutationError ? <ApiErrorAlert error={mutationError} action="No se pudo procesar la solicitud del mecánico" className="m-4" /> : null}
      <TableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder={compact ? "Buscar por mecánico, orden o solicitud" : "Buscar por mecánico, orden, cliente, vehículo, estado o solicitud"}
        showFiltersButton={false}
      />
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          {compact ? (
            <tr>{["Mecánico", "Orden", "Solicitud", allowReviewActions ? "Acciones" : ""].filter(Boolean).map((header) => <th key={header} className="break-words px-3 py-3">{header}</th>)}</tr>
          ) : (
            <tr>{["Fecha", "Mecánico", "Orden", "Cliente", "Vehículo", "Tipo", "Estado", allowReviewActions ? "Acciones" : ""].filter(Boolean).map((header) => <th key={header} className="break-words px-3 py-3">{header}</th>)}</tr>
          )}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pagedRequests.map((request) => (
            <tr key={request.id}>
              {(() => {
                const canReviewRequest = request.status === "PendingWorkshopChiefApproval";
                return (
                  <>
              {!compact ? <td className="break-words px-3 py-3">{request.createdAt}</td> : null}
              <td className="break-words px-3 py-3">{request.mechanic}</td>
              <td className="break-words px-3 py-3">{request.orderCode}</td>
              {compact ? (
                <td className="break-words px-3 py-3">
                  <p className="font-semibold text-slate-900">{request.suggestedService}</p>
                  <p className="mt-1 text-xs text-slate-500">{request.suggestedPart ?? (request.requestType === "Service" ? "Servicio" : "Repuesto")}</p>
                </td>
              ) : (
                <>
                  <td className="break-words px-3 py-3">{request.customer}</td>
                  <td className="break-words px-3 py-3">{request.vehicle}</td>
                  <td className="break-words px-3 py-3">{request.requestType === "Service" ? "Servicio" : "Repuesto"}</td>
                  <td className="px-3 py-3"><AdditionalRequestStatusBadge status={request.status} /></td>
                </>
              )}
              {allowReviewActions ? (
                <td className="px-3 py-3">
                  <div className={compact ? "flex gap-2" : "flex flex-col gap-2"}>
                    {detailPathPrefix ? (
                      <Link className="w-full" to={`${detailPathPrefix}/${request.id}`}>
                        <Button variant="secondary" className="min-h-9 w-full px-2 text-xs">Ver</Button>
                      </Link>
                    ) : (
                      <Button variant="secondary" className="min-h-9 w-full px-2 text-xs" onClick={() => setSelected(request)}>Ver</Button>
                    )}
                    {canReviewRequest ? (
                      <>
                        <Button variant="secondary" className="min-h-9 w-full px-2 text-xs" isLoading={isWorking} onClick={() => approve(request)}>Aprobar</Button>
                        <Button variant="secondary" className="min-h-9 w-full px-2 text-xs" isLoading={isWorking} onClick={() => reject(request)}>Denegar</Button>
                      </>
                    ) : null}
                  </div>
                </td>
              ) : null}
                  </>
                );
              })()}
            </tr>
          ))}
        </tbody>
      </table>
      <TablePagination page={currentPage} pageSize={pageSize} totalCount={filteredRequests.length} onPageChange={setPage} />
      <WorkshopChiefRequestDrawer
        open={Boolean(selected)}
        request={selected}
        onClose={() => setSelected(undefined)}
        onApprove={approve}
        onReject={reject}
        isWorking={isWorking}
      />
    </Card>
  );
}

function RequestDetail({ request }: { request: AdditionalRequest }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Info label="Orden" value={request.orderCode} />
      <Info label="Cliente" value={request.customer} />
      <Info label="Vehículo" value={request.vehicle} />
      <Info label="Mecánico" value={request.mechanic} />
      <Info label="Servicio sugerido" value={request.suggestedService} />
      <Info label="Repuesto sugerido" value={request.suggestedPart ?? "No aplica"} />
      <Info label="Precio estimado" value={formatCurrency(request.estimatedPrice)} />
      <div><p className="text-xs font-bold uppercase text-slate-400">Estado</p><div className="mt-1"><AdditionalRequestStatusBadge status={request.status} /></div></div>
    </div>
  );
}

function StockReviewTable({ submissions, onSelect }: { submissions: StockSubmission[]; onSelect: (submission: StockSubmission) => void }) {
  const [search, setSearch] = useState("");
  const filteredSubmissions = submissions.filter((submission) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [
      submission.submittedAt,
      formatDateTime(submission.submittedAt),
      submission.name,
      submission.referenceCode,
      submission.supplier,
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
  });

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 p-4">
        <input
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          placeholder="Buscar por fecha, producto, código de referencia o proveedor"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="w-[12%] px-3 py-3">Fecha</th>
            <th className="w-[18%] px-3 py-3">Producto</th>
            <th className="w-[14%] px-3 py-3">Código</th>
            <th className="w-[16%] px-3 py-3">Proveedor</th>
            <th className="w-[9%] px-3 py-3">Cant.</th>
            <th className="w-[12%] px-3 py-3">Precio</th>
            <th className="w-[11%] px-3 py-3">Estado</th>
            <th className="w-[8%] px-3 py-3">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredSubmissions.length === 0 ? <tr><td className="px-3 py-5 font-semibold text-slate-500" colSpan={8}>No hay solicitudes de stock para mostrar.</td></tr> : null}
          {filteredSubmissions.map((submission) => (
            <tr key={submission.submissionId}>
              <td className="break-words px-3 py-3">{formatDateTime(submission.submittedAt)}</td>
              <td className="break-words px-3 py-3 font-semibold text-slate-900">{submission.name}</td>
              <td className="break-words px-3 py-3">{submission.referenceCode}</td>
              <td className="break-words px-3 py-3">{submission.supplier}</td>
              <td className="px-3 py-3">{submission.quantity}</td>
              <td className="break-words px-3 py-3">{formatCurrency(submission.salePrice)}</td>
              <td className="px-3 py-3"><StockSubmissionStatusBadge status={submission.status} /></td>
              <td className="px-3 py-3"><Button variant="secondary" className="min-h-9 px-2 text-xs" onClick={() => onSelect(submission)}>Ver</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

const stockSubmissionFilterLabels: Record<StockSubmission["status"], string> = {
  Draft: "Borrador",
  PendingInventoryManagerReview: "Pendiente de revisión",
  RejectedByInventoryManager: "Rechazada",
  ApprovedByInventoryManager: "Aprobada",
  AddedToInventory: "Agregada al inventario",
};

function StockSubmissionList({ submissions, onSelect }: { submissions: StockSubmission[]; onSelect: (submission: StockSubmission) => void }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filteredSubmissions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return submissions.filter((submission) => {
      const matchesStatus = !status || submission.status === status;
      const matchesSearch = !term || [
        submission.submittedAt,
        formatDateTime(submission.submittedAt),
        submission.name,
        submission.referenceCode,
        submission.supplier,
        submission.category,
        submission.brand,
        stockSubmissionFilterLabels[submission.status],
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [search, status, submissions]);
  const pagedSubmissions = useMemo(() => filteredSubmissions.slice((page - 1) * pageSize, page * pageSize), [filteredSubmissions, page]);
  useEffect(() => setPage(1), [search, status]);

  return (
    <Card className="overflow-hidden">
      <TableToolbar
        search={search}
        placeholder="Buscar por producto, referencia, proveedor o estado"
        onSearchChange={setSearch}
        showFiltersButton={false}
      >
        <select
          className="min-h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">Todos los estados</option>
          {Object.entries(stockSubmissionFilterLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </TableToolbar>
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="w-[13%] px-3 py-3">Fecha</th>
            <th className="w-[18%] px-3 py-3">Producto</th>
            <th className="w-[13%] px-3 py-3">Referencia</th>
            <th className="w-[15%] px-3 py-3">Proveedor</th>
            <th className="w-[8%] px-3 py-3">Cant.</th>
            <th className="w-[12%] px-3 py-3">Precio</th>
            <th className="w-[13%] px-3 py-3">Estado</th>
            <th className="w-[8%] px-3 py-3 text-center">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pagedSubmissions.length === 0 ? (
            <tr>
              <td className="px-3 py-8 text-center font-semibold text-slate-500" colSpan={8}>No hay reposiciones enviadas para mostrar.</td>
            </tr>
          ) : null}
          {pagedSubmissions.map((submission) => (
            <tr key={submission.submissionId}>
              <td className="break-words px-3 py-3">{formatDateTime(submission.submittedAt)}</td>
              <td className="break-words px-3 py-3 font-semibold text-slate-900">{submission.name}</td>
              <td className="break-words px-3 py-3">{submission.referenceCode}</td>
              <td className="break-words px-3 py-3">{submission.supplier}</td>
              <td className="px-3 py-3 font-semibold text-slate-900">{submission.quantity}</td>
              <td className="break-words px-3 py-3">{formatCurrency(submission.salePrice)}</td>
              <td className="px-3 py-3"><StockSubmissionStatusBadge status={submission.status} /></td>
              <td className="px-3 py-3 text-center">
                <Button variant="secondary" className="min-h-9 px-3 text-xs" onClick={() => onSelect(submission)}>Ver</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-slate-200 px-4 py-3">
        <TablePagination page={page} pageSize={pageSize} totalCount={filteredSubmissions.length} onPageChange={setPage} />
      </div>
    </Card>
  );
}

function StockSubmissionCard({ submission }: { submission: StockSubmission }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="font-bold text-slate-950">{submission.name}</h3><p className="mt-1 text-sm text-slate-500">{submission.referenceCode} · {submission.supplier}</p></div>
        <StockSubmissionStatusBadge status={submission.status} />
      </div>
      <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
        <Info label="Cantidad" value={String(submission.quantity)} />
        <Info label="Precio proveedor" value={formatCurrency(submission.supplierPrice)} />
        <Info label="Precio venta" value={formatCurrency(submission.salePrice)} />
      </div>
      {submission.inventoryManagerComment ? <p className="mt-3 text-sm text-red-700">{submission.inventoryManagerComment}</p> : null}
    </Card>
  );
}

function SimpleListPage({ title, description, items }: { title: string; description: string; items: string[] }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="p-5">
        <div className="divide-y divide-slate-100">
          {items.length === 0 ? <p className="py-3 text-sm font-semibold text-slate-600">No hay registros para mostrar.</p> : null}
          {items.map((item, index) => <p key={`${item}-${index}`} className="py-3 text-sm font-semibold text-slate-700">{item}</p>)}
        </div>
      </Card>
    </>
  );
}

function DiagnosticStatusBadge({ status }: { status: MechanicDiagnostic["status"] }) {
  const label = status === "Approved" ? "Aprobado" : status === "Rejected" ? "Desaprobado" : "Pendiente";
  const tone = status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : status === "Rejected" ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200";
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-bold ${tone}`}>{label}</span>;
}

function DiagnosticTable({ diagnostics, detailPathPrefix }: { diagnostics: MechanicDiagnostic[]; detailPathPrefix?: string }) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Orden</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Vehículo</th>
            <th className="px-4 py-3">Mecánico</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {diagnostics.length === 0 ? <tr><td className="px-4 py-5 font-semibold text-slate-500" colSpan={7}>No hay diagnósticos para mostrar.</td></tr> : null}
          {diagnostics.map((diagnostic) => (
            <tr key={diagnostic.id}>
              <td className="px-4 py-3 font-semibold text-slate-700">{formatDateTime(diagnostic.submittedAt)}</td>
              <td className="px-4 py-3 font-bold text-slate-900">{diagnostic.orderCode}</td>
              <td className="px-4 py-3">{diagnostic.customer}</td>
              <td className="px-4 py-3">{diagnostic.vehicle}</td>
              <td className="px-4 py-3">{diagnostic.mechanic}</td>
              <td className="px-4 py-3"><DiagnosticStatusBadge status={diagnostic.status} /></td>
              <td className="px-4 py-3">{detailPathPrefix ? <Link to={`${detailPathPrefix}/${diagnostic.id}`}><Button variant="secondary">Ver</Button></Link> : <Link to={`/service-orders/${diagnostic.serviceOrderId}`}><Button variant="secondary">Ver orden</Button></Link>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
