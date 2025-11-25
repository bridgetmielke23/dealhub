"use client";

import { Deal } from "@/types/deal";
import { motion } from "framer-motion";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { useRef, useEffect } from "react";
import DealBadge from "./DealBadge";

interface DealCardListProps {
  deals: Deal[];
  selectedDealId: string | null;
  onDealSelect: (dealId: string) => void;
  onDealClick?: (deal: Deal) => void;
  hoveredDealId?: string | null;
}

export default function DealCardList({
  deals,
  selectedDealId,
  onDealSelect,
  onDealClick,
  hoveredDealId,
}: DealCardListProps) {
  const selectedRef = useRef<HTMLDivElement>(null);

  // Scroll to selected deal
  useEffect(() => {
    if (selectedDealId && selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedDealId]);

  if (deals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No deals found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4 p-4">
        {deals.map((deal, index) => {
          const dealsArray = deal.deals && deal.deals.length > 0 ? deal.deals : [];
          const currentDeal = dealsArray.length > 0 ? dealsArray[0] : deal;
          const isSelected = selectedDealId === deal.id;
          const isHovered = hoveredDealId === deal.id;

          return (
            <motion.div
              key={deal.id}
              ref={isSelected ? selectedRef : null}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => {
                onDealSelect(deal.id);
                if (onDealClick) {
                  onDealClick(deal);
                }
              }}
              className={`
                bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer
                transition-all duration-200
                ${isSelected ? "ring-2 ring-primary-600 shadow-lg" : ""}
                ${isHovered ? "shadow-md scale-[1.02]" : ""}
                hover:shadow-lg
              `}
            >
              {/* Horizontal layout: Image on left, content on right */}
              <div className="flex">
                {/* Image */}
                <div className="relative w-64 h-48 flex-shrink-0">
                  <img
                    src={currentDeal?.image || deal.image}
                    alt={currentDeal?.title || deal.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {currentDeal?.badge && <DealBadge type={currentDeal.badge} />}
                    {deal.badge && deal.badge !== currentDeal?.badge && (
                      <DealBadge type={deal.badge} />
                    )}
                  </div>

                  {/* Discount Badge */}
                  <div className="absolute top-2 right-2 bg-accent-500 text-white px-2 py-1 rounded-full font-bold text-xs">
                    {currentDeal?.discount || deal.discount}% OFF
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {deal.storeName}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {currentDeal?.title || deal.title}
                    </p>

                    {/* Price */}
                    {(currentDeal?.originalPrice && currentDeal?.discountedPrice) ||
                    (deal.originalPrice && deal.discountedPrice) ? (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-400 line-through text-sm">
                          ${(currentDeal?.originalPrice || deal.originalPrice || 0).toFixed(2)}
                        </span>
                        <span className="text-primary-600 font-bold">
                          ${(currentDeal?.discountedPrice || deal.discountedPrice || 0).toFixed(2)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    {/* Location */}
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <MapPin size={12} />
                      <span className="line-clamp-1">
                        {deal.location.city}, {deal.location.state}
                      </span>
                      {deal.distance && (
                        <span className="ml-1">• {deal.distance.toFixed(1)} km</span>
                      )}
                    </div>

                    {/* Expires */}
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock size={12} />
                      <span>
                        Ends {new Date(currentDeal?.expiresAt || deal.expiresAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Partner App Link */}
                    {(currentDeal?.partnerAppName || deal.partnerAppName) && (
                      <div className="flex items-center gap-1 text-primary-600 text-xs font-medium pt-1">
                        <ExternalLink size={12} />
                        <span>View in {(currentDeal?.partnerAppName || deal.partnerAppName)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

