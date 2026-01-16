// src/components/common/StatsCards.tsx
import { StatItem } from "@/types/common"

interface StatsCardsProps {
    stats: StatItem[]
}

export default function StatsCards({ stats }: StatsCardsProps) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        yellow: "bg-yellow-50 text-yellow-600",
        red: "bg-red-50 text-red-600",
        purple: "bg-purple-50 text-purple-600",
    }

    return (
        <div className="flex flex-1 gap-4 overflow-x-auto pb-2 md:pb-0">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="flex min-w-[200px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-transform hover:scale-[1.02]"
                >
                    <div
                        className={`flex size-10 items-center justify-center rounded-full ${colorStyles[stat.color] || colorStyles.blue}`}
                    >
                        {stat.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            {stat.label}
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                            {stat.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}