import { cn } from "../../utils/cn";

type Tab = {
  label: string;
  value: string;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onChange: (value: string) => void;
};

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={cn(
            "border-b-2 px-3 py-2 text-sm font-semibold",
            activeTab === tab.value ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800",
          )}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
