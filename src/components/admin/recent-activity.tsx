import React from "react";
import { Building2, MessageSquare, Clock, ArrowUpRight, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ActivityItem {
  id: string;
  type: "property" | "inquiry";
  title: string;
  subtitle: string;
  status?: string;
  timestamp: string;
  link?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-[#141414] p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#d4af37]" />
            Recent Activity
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Latest property listings and buyer/client inquiries
          </p>
        </div>
        <span className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-medium text-[#d4af37] border border-[#d4af37]/20">
          Live Updates
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg bg-white/5 p-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-white/10" />
                <div className="h-3 w-1/2 rounded bg-white/5" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-400">
            No recent activity recorded yet.
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="group flex items-start gap-4 rounded-lg border border-transparent bg-white/[0.02] p-3.5 transition-all duration-200 hover:border-[#d4af37]/30 hover:bg-white/[0.05]"
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  item.type === "property"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}
              >
                {item.type === "property" ? (
                  <Building2 className="h-4 w-4" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-white group-hover:text-[#d4af37] transition-colors">
                    {item.title}
                  </p>
                  {item.status && (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                      <Tag className="h-2.5 w-2.5" />
                      {item.status}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-zinc-400 mt-0.5">{item.subtitle}</p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }) : "Recently"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
