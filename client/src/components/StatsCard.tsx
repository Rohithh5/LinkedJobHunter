import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  icon: "paper-plane" | "reply" | "calendar-check" | "chart-line";
}

const StatsCard = ({ title, value, change, icon }: StatsCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-border/20 p-4 hover:border-accent transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
          {icon === "paper-plane" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
          {icon === "reply" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          )}
          {icon === "calendar-check" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4" />
            </svg>
          )}
          {icon === "chart-line" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          )}
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">
        {typeof value === 'number' && icon === 'chart-line' ? `${value}%` : value}
      </p>
      {change && (
        <p className="text-xs text-muted-foreground/80 mt-1">
          <span className={cn(
            change.trend === "up" && "text-green-500",
            change.trend === "down" && "text-red-500"
          )}>
            {change.trend === "up" ? "↑" : change.trend === "down" ? "↓" : ""}
            {` ${Math.abs(change.value)}%`}
          </span>
          {" from last week"}
        </p>
      )}
    </div>
  );
};

export default StatsCard;
