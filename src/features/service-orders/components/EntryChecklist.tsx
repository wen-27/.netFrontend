const items = ["Luces", "Llantas", "Espejos", "Documentos", "Herramientas", "Rayones/golpes", "Nivel de combustible", "Objetos dentro del vehículo"];

export function EntryChecklist() {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {items.map((item) => (
        <label key={item} className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm font-semibold text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
          {item}
        </label>
      ))}
    </div>
  );
}
