import { Link, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  History,
  MessageSquare,
  Package,
  PackageCheck,
  PackageSearch,
  Plus,
  Send,
  Wrench,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";
import { Card } from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Badge } from "../../../shared/components/ui/Badge";
import { formatCurrency } from "../../../shared/utils/formatters";
import { mockOrderServices } from "../../../shared/mocks/operationsMocks";
import { AdditionalRequest, ClientPayment, StockSubmission } from "../../../shared/types/domain";
import {
  AdditionalRequestStatusBadge,
  ClientApprovalCard,
  ClientApprovalActionCard,
  ClientOrderStatusCard,
  InventoryProductTable,
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
  getMechanicOrderById,
  getMechanicOrders,
  getMechanicRequests,
  getClientPayments,
  getPaymentsPendingReceptionVerification,
  getStockSubmissionById,
  getStockSubmissions,
  getWarehouseProducts,
  getWorkshopChiefRequestById,
  getWorkshopChiefRequests,
  getWorkshopServices,
  approveRequestByClient,
  rejectRequestByClient,
} from "../services/operationsService";

function useFallbackQuery<T>(queryKey: string[], queryFn: () => Promise<T>) {
  return useQuery({ queryKey, queryFn, staleTime: 60_000 });
}

export function WorkshopChiefDashboardPage() {
  const { data = [] } = useFallbackQuery(["workshop-chief-requests"], getWorkshopChiefRequests);
  const pending = data.filter((item) => item.status === "PendingWorkshopChiefApproval").length;
  return (
    <>
      <PageHeader title="Dashboard Jefe de Taller" description="Solicitudes técnicas, órdenes activas y servicios configurados." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Solicitudes pendientes de revisión" value={String(pending)} tone="amber" icon={AlertTriangle} />
        <MetricCard label="Solicitudes aprobadas hoy" value="4" tone="green" icon={CheckCircle2} />
        <MetricCard label="Solicitudes rechazadas hoy" value="1" tone="red" icon={XCircle} />
        <MetricCard label="Solicitudes pendientes por cliente" value={String(data.filter((item) => item.status === "PendingClientApproval").length)} tone="blue" icon={Send} />
        <MetricCard label="Órdenes activas en taller" value="12" tone="indigo" icon={Wrench} />
        <MetricCard label="Servicios activos" value="10" tone="green" icon={ClipboardList} />
      </div>
      <RequestsTable requests={data} className="mt-5" />
    </>
  );
}

export function WarehouseChiefDashboardPage() {
  const { data: products = [] } = useFallbackQuery(["warehouse-products"], getWarehouseProducts);
  const { data: submissions = [] } = useFallbackQuery(["warehouse-submissions"], getStockSubmissions);
  return (
    <>
      <PageHeader title="Dashboard Jefe de Bodega" description="Registro de productos, envíos a almacén y control de bajo stock." actions={<Link to="/warehouse/products/new"><Button icon={<Plus className="h-4 w-4" />}>Agregar producto</Button></Link>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Productos registrados" value={String(products.length)} tone="blue" icon={Package} />
        <MetricCard label="Stock pendiente por revisión" value={String(submissions.filter((item) => item.status === "PendingInventoryManagerReview").length)} tone="amber" icon={PackageSearch} />
        <MetricCard label="Stock rechazado" value={String(submissions.filter((item) => item.status === "RejectedByInventoryManager").length)} tone="red" icon={XCircle} />
        <MetricCard label="Stock aprobado" value={String(submissions.filter((item) => item.status === "ApprovedByInventoryManager").length)} tone="green" icon={PackageCheck} />
        <MetricCard label="Productos bajo stock" value={String(products.filter((item) => item.quantity <= item.minimumStock).length)} tone="amber" icon={AlertTriangle} />
      </div>
      <WarehouseProductsPage embedded />
    </>
  );
}

export function InventoryManagerDashboardPage() {
  const { data: review = [] } = useFallbackQuery(["inventory-review"], getInventoryReviewRequests);
  const { data: products = [] } = useFallbackQuery(["inventory-products"], getInventoryProducts);
  return (
    <>
      <PageHeader title="Dashboard Jefe de Almacén" description="Aprobación de stock e inventario oficial." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Solicitudes pendientes" value={String(review.length)} tone="amber" icon={PackageSearch} />
        <MetricCard label="Solicitudes aprobadas hoy" value="3" tone="green" icon={CheckCircle2} />
        <MetricCard label="Solicitudes rechazadas hoy" value="1" tone="red" icon={XCircle} />
        <MetricCard label="Productos en inventario" value={String(products.length)} tone="blue" icon={Package} />
        <MetricCard label="Productos bajo stock" value={String(products.filter((item) => item.quantity <= item.minimumStock).length)} tone="amber" icon={AlertTriangle} />
      </div>
      <InventoryReviewPage embedded />
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
  const { data: order } = useFallbackQuery(["mechanic-order", id], () => getMechanicOrderById(id));
  const { data: requests = [] } = useFallbackQuery(["mechanic-requests"], getMechanicRequests);
  if (!order) return null;
  return (
    <>
      <PageHeader
        title={order.code}
        description={`${order.customer} · ${order.vehicle} · Estado general de la orden`}
        actions={
          <>
            <Button variant="secondary">Registrar trabajo</Button>
            <Button onClick={() => setRequestOpen(true)}>Solicitar servicio adicional</Button>
            <Button variant="secondary" onClick={() => setRequestOpen(true)}>Solicitar repuesto adicional</Button>
          </>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <OrderServicesTimeline services={mockOrderServices} />
          <Card className="p-5">
            <h2 className="font-bold text-slate-900">Historial de trabajo</h2>
            <p className="mt-2 text-sm text-slate-600">Diagnóstico inicial, cambio de aceite y revisión de frenos registrados.</p>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold text-slate-900">Comentarios del Jefe de Taller</h2>
            <p className="mt-2 text-sm text-slate-600">Validar evidencia fotográfica antes de reenviar solicitudes rechazadas.</p>
          </Card>
          <RequestsTable requests={requests} />
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
  return (
    <>
      <PageHeader title="Mis solicitudes" description="Solicitudes adicionales enviadas al Jefe de Taller y su respuesta." />
      <RequestsTable requests={data} />
    </>
  );
}

export function WorkshopChiefRequestsPage() {
  const { data = [] } = useFallbackQuery(["workshop-chief-requests"], getWorkshopChiefRequests);
  return (
    <>
      <PageHeader title="Solicitudes de mecánicos" description="Aprueba, deniega o envía solicitudes adicionales al cliente." />
      <RequestsTable requests={data} />
    </>
  );
}

export function WorkshopChiefRequestDetailPage() {
  const { id } = useParams();
  const { data: request } = useFallbackQuery(["workshop-chief-request", id ?? "req-1"], () => getWorkshopChiefRequestById(id ?? "req-1"));
  return (
    <>
      <PageHeader title="Detalle de solicitud técnica" description="Revisión de Jefe de Taller." />
      <Card className="p-5">
        {request ? <RequestDetail request={request} /> : null}
      </Card>
    </>
  );
}

export function WorkshopServicesPage() {
  const { data = [] } = useFallbackQuery(["workshop-services"], getWorkshopServices);
  return (
    <>
      <PageHeader title="Servicios del taller" description="Servicios base creados por el Jefe de Taller con cálculo de repuestos y mano de obra." actions={<Link to="/workshop/services/new"><Button icon={<Plus className="h-4 w-4" />}>Crear servicio</Button></Link>} />
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
  const { data = [] } = useFallbackQuery(["workshop-services"], getWorkshopServices);
  const service = data.find((item) => item.id === id);
  return (
    <>
      <PageHeader title={id ? "Editar servicio del taller" : "Nuevo servicio del taller"} description="Asocia repuestos, define porcentaje de mano de obra y calcula el precio final." />
      <WorkshopServiceForm service={service} />
    </>
  );
}

export function ClientOrdersPage() {
  const { data = [] } = useFallbackQuery(["client-orders"], operationsService.getClientOrders);
  return (
    <>
      <PageHeader title="Mis órdenes" description="Historial, órdenes activas, estados de pago y entregas." />
      <div className="grid gap-4 lg:grid-cols-2">
        {data.map((order) => <Link key={order.id} to={`/client/orders/${order.id}`}><ClientOrderStatusCard order={order} /></Link>)}
      </div>
    </>
  );
}

export function ClientOrderDetailPage() {
  const { id = "1" } = useParams();
  const { data: order } = useFallbackQuery(["client-order", id], () => operationsService.getClientOrderById(id));
  const { data: requests = [] } = useFallbackQuery(["client-approvals"], getClientPendingApprovals);
  if (!order) return null;
  const payDisabled = order.canPay === false;
  const canNavigateToPayment = order.canPay === true;
  const payButton = (
    <Button
      disabled={!order.canPay}
      className={!order.canPay ? "cursor-not-allowed bg-gray-300 text-gray-500" : "bg-blue-600 text-white"}
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
            <Link to="/client/orders"><Button variant="secondary">Regresar a mis órdenes</Button></Link>
            {canNavigateToPayment && !payDisabled ? <Link to={`/client/payments/new?orderId=${order.id}`}>{payButton}</Link> : payButton}
          </>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <OrderPaymentAlert order={order} />
          <OrderServicesTimeline services={mockOrderServices} />
          <Card className="p-5"><h2 className="font-bold text-slate-900">Mensajes del Jefe de Taller</h2><p className="mt-2 text-sm text-slate-600">Se recomienda aprobar el cambio de filtro para completar el mantenimiento.</p></Card>
          <Card className="p-5"><h2 className="font-bold text-slate-900">Solicitudes adicionales</h2><div className="mt-3 space-y-3">{requests.map((request) => <ClientApprovalCard key={request.id} request={request} />)}</div></Card>
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
  const { data = [] } = useFallbackQuery(["client-approvals"], getClientPendingApprovals);
  const queryClient = useQueryClient();
  const [hiddenRequestIds, setHiddenRequestIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const refreshClientViews = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["client-approvals"] }),
      queryClient.invalidateQueries({ queryKey: ["client-orders"] }),
    ]);
  };
  const approveMutation = useMutation({
    mutationFn: approveRequestByClient,
    onSuccess: async (response) => {
      if (response.status === "AddedToOrder" || response.status === "ApprovedByClient") {
        setHiddenRequestIds((current) => [...current, response.id]);
      }
      setMessage("Servicio aprobado. Se añadirá a tu orden activa.");
      await refreshClientViews();
    },
  });
  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => rejectRequestByClient(requestId),
    onSuccess: async (response) => {
      if (response.status === "RejectedByClient") {
        setHiddenRequestIds((current) => [...current, response.id]);
      }
      setMessage("Rechazo confirmado. No se añadirá a tu orden.");
      await refreshClientViews();
    },
  });
  const visibleRequests = data.filter((request) => !hiddenRequestIds.includes(request.id) && request.status !== "AddedToOrder" && request.status !== "RejectedByClient");
  return (
    <>
      <PageHeader title="Órdenes por aprobar" description="Servicios adicionales aprobados por el Jefe de Taller y pendientes por cliente." />
      {message ? <Card className="mb-4 border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{message}</Card> : null}
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

export function ClientPaymentNewPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId") ?? "2";
  const [method, setMethod] = useState("Transferencia");
  const [cardLastFourDigits, setCardLastFourDigits] = useState("1234");
  const [cardHolderName, setCardHolderName] = useState("Carlos Rojas");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [sent, setSent] = useState(false);
  const { data: order } = useFallbackQuery(["client-order-payment", orderId], () => operationsService.getClientOrderById(orderId));
  const isCard = method === "Tarjeta";
  const paymentMethodId = method === "Tarjeta" ? 2 : method === "Efectivo" ? 3 : 1;
  const paymentPayload = {
    invoiceId: order?.invoiceId ?? 12,
    paymentMethodId,
    amount: order?.estimatedTotal ?? 620000,
    cardLastFourDigits: isCard ? cardLastFourDigits : null,
    cardHolderName: isCard ? cardHolderName : null,
    cardBrand: isCard ? cardBrand : null,
  };
  const submitPayment = async () => {
    await operationsService.submitClientPayment(paymentPayload);
    setSent(true);
  };
  return (
    <>
      <PageHeader title="Registrar pago" description="El pago queda enviado para verificación por recepción." />
      {sent ? <PaymentSuccessMessage status="PendingReceptionVerification" /> : null}
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
        <div className="mt-5 flex justify-end"><Button onClick={submitPayment}>Enviar pago para verificación</Button></div>
      </Card>
    </>
  );
}

export function ClientPaymentsPage() {
  const { data = [] } = useFallbackQuery(["client-payments"], getClientPayments);
  return (
    <>
      <PageHeader title="Pagos" description="Historial de pagos registrados y estado de verificación por recepción." />
      <PaymentVerificationTable payments={data} onSelect={() => undefined} />
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
  const { data = [] } = useFallbackQuery(["warehouse-products"], getWarehouseProducts);
  return (
    <>
      {!embedded ? <PageHeader title="Productos" description="Productos registrados por Jefe de Bodega antes de inventario oficial." actions={<Link to="/warehouse/products/new"><Button icon={<Plus className="h-4 w-4" />}>Registrar producto</Button></Link>} /> : null}
      <div className={embedded ? "mt-5" : ""}><InventoryProductTable products={data} /></div>
    </>
  );
}

export function WarehouseProductFormPage() {
  return (
    <>
      <PageHeader title="Registrar producto" description="Calcula precio de venta y envía stock a revisión del Jefe de Almacén." />
      <StockSubmissionForm />
    </>
  );
}

export function WarehouseStockSubmissionsPage() {
  const { data = [] } = useFallbackQuery(["warehouse-submissions"], getStockSubmissions);
  return (
    <>
      <PageHeader title="Envíos a almacén" description="Stock enviado a revisión, rechazado o aprobado por Jefe de Almacén." />
      <StockSubmissionList submissions={data} />
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
  const [selected, setSelected] = useState<StockSubmission | undefined>();
  return (
    <>
      {!embedded ? <PageHeader title="Revisión de stock" description="Solicitudes de stock pendientes por Jefe de Almacén." /> : null}
      <StockReviewTable submissions={data} onSelect={setSelected} />
      <StockSubmissionReviewDrawer open={Boolean(selected)} submission={selected} onClose={() => setSelected(undefined)} />
    </>
  );
}

export function InventoryReviewDetailPage() {
  const { id = "stk-1" } = useParams();
  const { data } = useFallbackQuery(["inventory-review-detail", id], () => getInventoryReviewRequestById(id));
  return (
    <>
      <PageHeader title="Detalle revisión de stock" description="Aprobar o rechazar solicitud de bodega." />
      {data ? <StockSubmissionCard submission={data} /> : null}
    </>
  );
}

export function InventoryProductsPage() {
  const { data = [] } = useFallbackQuery(["inventory-products"], getInventoryProducts);
  return (
    <>
      <PageHeader title="Inventario oficial" description="Productos aprobados por Jefe de Almacén." />
      <InventoryProductTable products={data} />
    </>
  );
}

export function InventoryHistoryPage() {
  const { data = [] } = useFallbackQuery(["inventory-history"], getInventoryHistory);
  return (
    <>
      <PageHeader title="Historial de inventario" description="Aprobaciones, rechazos y movimientos de stock." />
      <StockSubmissionList submissions={data} />
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
  const { data = [] } = useFallbackQuery(["payments-verification"], getPaymentsPendingReceptionVerification);
  return <SimpleListPage title="Entregas" description="Vehículos listos para entrega tras pago verificado." items={data.filter((payment) => payment.status === "Approved").map((payment) => `${payment.orderCode} · ${payment.customer} · Entrega ${payment.deliveryDate ?? "por confirmar"}`)} />;
}

function RequestsTable({ requests, className = "" }: { requests: AdditionalRequest[]; className?: string }) {
  const [selected, setSelected] = useState<AdditionalRequest | undefined>();
  return (
    <Card className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>{["Fecha", "Mecánico", "Orden", "Cliente", "Vehículo", "Tipo de solicitud", "Estado", "Prioridad", "Acciones"].map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="px-4 py-3">{request.createdAt}</td>
              <td className="px-4 py-3">{request.mechanic}</td>
              <td className="px-4 py-3">{request.orderCode}</td>
              <td className="px-4 py-3">{request.customer}</td>
              <td className="px-4 py-3">{request.vehicle}</td>
              <td className="px-4 py-3">{request.requestType === "Service" ? "Servicio" : "Repuesto"}</td>
              <td className="px-4 py-3"><AdditionalRequestStatusBadge status={request.status} /></td>
              <td className="px-4 py-3"><Badge tone={request.priority === "Alta" ? "red" : request.priority === "Media" ? "amber" : "slate"}>{request.priority}</Badge></td>
              <td className="px-4 py-3"><div className="flex gap-2"><Button variant="secondary" onClick={() => setSelected(request)}>Ver detalle</Button><Button variant="secondary">Aprobar</Button><Button variant="ghost">Denegar</Button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
      <WorkshopChiefRequestDrawer open={Boolean(selected)} request={selected} onClose={() => setSelected(undefined)} />
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
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Fecha", "Jefe de bodega", "Producto", "Código referencia", "Proveedor", "Cantidad", "Precio proveedor", "Precio venta", "Estado", "Acciones"].map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {submissions.map((submission) => (
            <tr key={submission.submissionId}>
              <td className="px-4 py-3">{submission.submittedAt}</td>
              <td className="px-4 py-3">{submission.warehouseChief}</td>
              <td className="px-4 py-3">{submission.name}</td>
              <td className="px-4 py-3">{submission.referenceCode}</td>
              <td className="px-4 py-3">{submission.supplier}</td>
              <td className="px-4 py-3">{submission.quantity}</td>
              <td className="px-4 py-3">{formatCurrency(submission.supplierPrice)}</td>
              <td className="px-4 py-3">{formatCurrency(submission.salePrice)}</td>
              <td className="px-4 py-3"><StockSubmissionStatusBadge status={submission.status} /></td>
              <td className="px-4 py-3"><Button variant="secondary" onClick={() => onSelect(submission)}>Ver detalle</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function StockSubmissionList({ submissions }: { submissions: StockSubmission[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {submissions.map((submission) => <StockSubmissionCard key={submission.submissionId} submission={submission} />)}
    </div>
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
          {items.map((item) => <p key={item} className="py-3 text-sm font-semibold text-slate-700">{item}</p>)}
        </div>
      </Card>
    </>
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
