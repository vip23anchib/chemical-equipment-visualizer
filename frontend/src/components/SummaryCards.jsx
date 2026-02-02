import { Activity, Gauge, Thermometer, Box, TrendingUp, AlertTriangle } from "lucide-react";

const cards = [
  {
    key: "total_equipment",
    label: "Total Equipment",
    icon: Box,
    format: (v) => v,
    gradient: "from-indigo-500 to-violet-500",
    iconBg: "rgba(99, 102, 241, 0.15)",
    iconColor: "#818cf8",
  },
  {
    key: "average_flowrate",
    label: "Avg Flowrate",
    icon: Activity,
    format: (v) => `${v} m³/h`,
    gradient: "from-cyan-500 to-blue-500",
    iconBg: "rgba(6, 182, 212, 0.15)",
    iconColor: "#22d3ee",
  },
  {
    key: "average_pressure",
    label: "Avg Pressure",
    icon: Gauge,
    format: (v) => `${v} bar`,
    gradient: "from-amber-500 to-orange-500",
    iconBg: "rgba(245, 158, 11, 0.15)",
    iconColor: "#fbbf24",
  },
  {
    key: "average_temperature",
    label: "Avg Temperature",
    icon: Thermometer,
    format: (v) => `${v}°C`,
    gradient: "from-rose-500 to-pink-500",
    iconBg: "rgba(244, 63, 94, 0.15)",
    iconColor: "#fb7185",
  },
];

export default function SummaryCards({ summary, warnings = [] }) {
  // Check if any warnings apply to this card
  const getWarningForCard = (cardKey) => {
    if (!warnings || warnings.length === 0) return null;
    
    if (cardKey === "average_pressure") {
      return warnings.find(w => w.type === 'pressure_high');
    }
    if (cardKey === "average_temperature") {
      return warnings.find(w => w.type === 'temperature_out_of_range');
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = summary[card.key];
        const cardWarning = getWarningForCard(card.key);

        return (
          <div
            key={card.key}
            className={`card group animate-fade-up ${cardWarning ? 'ring-1 ring-amber-500/50' : ''}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-400 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-white mb-2">
                  {card.format(value)}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">+2.5%</span>
                  <span className="text-slate-500">vs last upload</span>
                </div>
                
                {/* Warning Badge */}
                {cardWarning && (
                  <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-300">{cardWarning.message}</span>
                  </div>
                )}
              </div>
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
                style={{ background: card.iconBg }}
              >
                <Icon className="w-6 h-6" style={{ color: card.iconColor }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
