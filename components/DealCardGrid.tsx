"use client";

import { Deal } from "@/types/deal";
import DealCard from "./DealCard";

interface DealCardGridProps {
  deals: Deal[];
  selectedDeal?: Deal | null;
  onDealSelect?: (deal: Deal | null) => void;
}

export default function DealCardGrid({ deals, selectedDeal, onDealSelect }: DealCardGridProps) {
  if (deals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No deals found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {deals.map((deal) => (
        <DealCard 
          key={deal.id} 
          deal={deal} 
          isSelected={selectedDeal?.id === deal.id}
          onSelect={onDealSelect ? () => onDealSelect(deal) : undefined}
        />
      ))}
    </div>
  );
}

