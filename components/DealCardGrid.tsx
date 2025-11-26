"use client";

import { Deal } from "@/types/deal";
import DealCard from "./DealCard";
import { motion } from "framer-motion";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      {deals.map((deal, index) => (
        <motion.div
          key={deal.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <DealCard 
            deal={deal} 
            isSelected={selectedDeal?.id === deal.id}
            onSelect={onDealSelect ? () => onDealSelect(deal) : undefined}
          />
        </motion.div>
      ))}
    </div>
  );
}

