import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { LoadingState } from "../../../shared/components/feedback/LoadingState";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { formatCurrency, formatDate } from "../../../shared/utils/formatters";
import { getPaymentStatusLabel, getPaymentStatusTone } from "../../../shared/utils/statusLabels";
import { invoicesService } from "../services/invoicesService";

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function InvoiceDetailPage() {
  const { id } = useParams();
  const query = useQuery({
    queryKey: ["invoice-detail", id],
    queryFn: () => invoicesService.getById(id ?? ""),
    enabled: Boolean(id),
  });

  if (query.isLoading) return <LoadingState />;

  if (query.isError) {
    return <ApiErrorAlert error={query.error} action="No se pudo cargar el detalle de la factura" />;
  }

  const invoice = query.data;
  if (!invoice) return <Card className="p-5 text-sm text-slate-600">No se encontró la factura.</Card>;

  return (
    <>
      <PageHeader
        title={`Factura ${invoice.number}`}
        description={`${invoice.orderCode} · ${invoice.customer}`}
        actions={<Link to="/invoices"><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <DetailItem label="Número" value={invoice.number} />
            <DetailItem label="Cliente" value={invoice.customer} />
            <DetailItem label="Orden" value={invoice.orderCode} />
            <DetailItem label="Fecha" value={formatDate(invoice.date)} />
            <DetailItem label="Subtotal" value={formatCurrency(invoice.subtotal)} />
            <DetailItem label="Impuestos" value={formatCurrency(invoice.taxes)} />
            <DetailItem label="Total" value={formatCurrency(invoice.total)} />
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Estado de pago</p>
              <div className="mt-1">
                <Badge tone={getPaymentStatusTone(invoice.paymentStatus)}>{getPaymentStatusLabel(invoice.paymentStatus)}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-slate-400">Resumen</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(invoice.total)}</p>
          <p className="mt-2 text-sm text-slate-600">Factura asociada a la orden {invoice.orderCode}.</p>
        </Card>
      </div>
    </>
  );
}
