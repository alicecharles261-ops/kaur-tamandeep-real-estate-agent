import React from "react";
import { Building2, CheckCircle2, DollarSign, Home, EyeOff, Star, FileEdit, MessageSquare } from "lucide-react";

export interface DashboardMetrics {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  leasedListings: number;
  draftListings: number;
  featuredListings: number;
  hiddenListings: number;
  totalInquiries: number;
}

interface OverviewCardsProps {
  metrics: DashboardMetrics;
  loading?: boolean;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ metrics, loading }) => {
  const cards = [
    {
      title: "Total Listings",
      value: metrics.totalListings,
      icon: Building2,
      description: "All properties in database",
      color: "from-amber-500/20 to-amber-900/10 border-amber-500/30 text-amber-400",
    },
    {
      title: "Active Listings",
      value: metrics.activeListings,
      icon: CheckCircle2,
      description: "For sale & for lease",
      color: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400",
    },
    {
      title: "Sold Listings",
      value: metrics.soldListings,
      icon: DollarSign,
      description: "Completed property sales",
      color: "from-blue-500/20 to-blue-900/10 border-blue-500/30 text-blue-400",
    },
    {
      title: "Leased Listings",
      value: metrics.leasedListings,
      icon: Home,
      description: "Successfully leased",
      color: "from-purple-500/20 to-purple-900/10 border-purple-500/30 text-purple-400",
    },
    {
      title: "Draft Listings",
      value: metrics.draftListings,
      icon: FileEdit,
      description: "In-progress drafts",
      color: "from-zinc-500/20 to-zinc-900/10 border-zinc-500/30 text-zinc-400",
    },
    {
      title: "Featured Listings",
      value: metrics.featuredListings,
      icon: Star,
      description: "Promoted on homepage",
      color: "from-yellow-500/20 to-yellow-900/10 border-yellow-500/30 text-yellow-400",
    },
    {
      title: "Hidden Listings",
      value: metrics.hiddenListings,
      icon: EyeOff,
      description: "Unpublished properties",
      color: "from-rose-500/20 to-rose-900/10 border-rose-500/30 text-rose-400",
    },
    {
      title: "Total Contact Inquiries",
      value: metrics.totalInquiries,
      icon: MessageSquare,
      description: "Messages received",
      color: "from-[#d4af37]/20 to-[#d4af37]/5 border-[#d4af37]/30 text-[#d4af37]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${card.color} p-5 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#d4af37]/5`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                {card.title}
              </span>
              <div className="rounded-lg bg-black/40 p-2 text-current">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-3xl font-serif font-bold text-white">
                {loading ? (
                  <span className="inline-block h-8 w-12 animate-pulse rounded bg-white/10" />
                ) : (
                  card.value
                )}
              </div>
            </div>

            <p className="mt-2 text-xs text-zinc-400">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
};
