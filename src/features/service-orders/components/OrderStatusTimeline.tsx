import { Badge } from "../../../shared/components/ui/Badge";

const events = ["Nueva", "En revisión", "En progreso", "Completada"];

export function OrderStatusTimeline() {
  return (
    <div className="space-y-3">
      {events.map((event, index) => (
        <div key={event} className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span>
          <Badge tone={index === events.length - 1 ? "green" : "blue"}>{event}</Badge>
        </div>
      ))}
    </div>
  );
}
