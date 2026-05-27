import { useState } from "react";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { Button } from "../../../shared/components/ui/Button";
import { cn } from "../../../shared/utils/cn";
import { CatalogTable } from "../components/CatalogTable";

const catalogs = [
  ["Marcas de vehículo", "/api/vehiclebrands"],
  ["Modelos", "/api/vehiclemodels"],
  ["Tipos de vehículo", "/api/vehicletypes"],
  ["Tipos de servicio", "/api/serviceTypes"],
  ["Estados de orden", "/api/orderstatuses"],
  ["Categorías de repuestos", "/api/partcategories"],
  ["Marcas de repuestos", "/api/partbrands"],
  ["Métodos de pago", "/api/paymentmethods"],
  ["Estados de pago", "/api/paymentstatuses"],
  ["Estados de factura", "/api/invoicestatuses"],
  ["Tipos de tarjeta", "/api/cardtypes"],
  ["Tipos de documento", "/api/documenttypes"],
  ["Géneros", "/api/genders"],
  ["Países", "/api/countries"],
  ["Departamentos", "/api/departments"],
  ["Ciudades", "/api/cities"],
  ["Especialidades mecánicas", "/api/mechanicspecialties"],
  ["Barrios", "/api/neighborhoods"],
  ["Tipos de vía", "/api/streettypes"],
  ["Direcciones", "/api/addresses"],
  ["Proveedores", "/api/suppliers"],
  ["Inventario de ingreso", "/api/vehicleentryinventory"],
  ["Roles de persona", "/api/personroles"],
] as Array<[string, string]>;

export function CatalogsPage() {
  const [active, setActive] = useState(catalogs[0]);
  return (
    <>
      <PageHeader title="Catálogos" description="Administración centralizada de datos maestros del taller." actions={<Button>Nuevo registro</Button>} />
      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-2">
          {catalogs.map((catalog) => (
            <button key={catalog[1]} onClick={() => setActive(catalog)} className={cn("block w-full rounded-md px-3 py-2 text-left text-sm font-semibold", active[1] === catalog[1] ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50")}>
              {catalog[0]}
            </button>
          ))}
        </aside>
        <CatalogTable endpoint={active[1]} />
      </div>
    </>
  );
}
