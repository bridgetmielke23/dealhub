"use client";

import { Deal } from "@/types/deal";
import { motion } from "framer-motion";
import { MapPin, Clock, ExternalLink, Map } from "lucide-react";
import { useState } from "react";
import DealBadge from "./DealBadge";
import DealCarousel from "./DealCarousel";

interface DealCardProps {
  deal: Deal;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function DealCard({ deal, isSelected = false, onSelect }: DealCardProps) {
  const [currentDealIndex, setCurrentDealIndex] = useState(0);
  const dealsArray = deal.deals && deal.deals.length > 0 ? deal.deals : [];
  const hasMultipleDeals = dealsArray.length > 1;
  const currentDeal = hasMultipleDeals ? dealsArray[currentDealIndex] : deal;

  const handleDealClick = (e: React.MouseEvent) => {
    // Only open partner app if clicking on the card itself, not on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    const url = currentDeal?.partnerAppUrl || deal.partnerAppUrl;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleShowOnMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect();
      // Scroll to map
      const mapElement = document.querySelector('[data-map-container]');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary-500 shadow-lg' : ''
      }`}
      onClick={handleDealClick}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={currentDeal?.image || deal.image}
          alt={currentDeal?.title || deal.title}
          className="w-full h-full object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {currentDeal?.badge && <DealBadge type={currentDeal.badge} />}
          {deal.badge && deal.badge !== currentDeal?.badge && (
            <DealBadge type={deal.badge} />
          )}
        </div>

        {/* Discount Badge */}
        <div className="absolute top-3 right-3 bg-accent-500 text-white px-3 py-1 rounded-full font-bold text-sm">
          {currentDeal?.discount || deal.discount}% OFF
        </div>

        {/* Multiple Deals Indicator */}
        {hasMultipleDeals && (
          <DealCarousel
            totalDeals={dealsArray.length}
            currentIndex={currentDealIndex}
            onIndexChange={setCurrentDealIndex}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
              {deal.storeName}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
              {currentDeal?.title || deal.title}
            </p>
          </div>
        </div>

        {/* Price */}
        {(currentDeal?.originalPrice && currentDeal?.discountedPrice) || (deal.originalPrice && deal.discountedPrice) ? (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-400 line-through text-sm">
              ${(currentDeal?.originalPrice || deal.originalPrice || 0).toFixed(2)}
            </span>
            <span className="text-primary-600 font-bold text-lg">
              ${(currentDeal?.discountedPrice || deal.discountedPrice || 0).toFixed(2)}
            </span>
          </div>
        ) : null}

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
          <MapPin size={14} />
          <span className="line-clamp-1">
            {deal.location.city}, {deal.location.state}
          </span>
          {deal.distance && (
            <span className="ml-1">• {deal.distance.toFixed(1)} km</span>
          )}
        </div>

        {/* Expires */}
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <Clock size={12} />
          <span>
            Ends {new Date(currentDeal?.expiresAt || deal.expiresAt).toLocaleDateString()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          {onSelect && (
            <button
              onClick={handleShowOnMap}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              }`}
            >
              <Map size={14} />
              <span>{isSelected ? 'On Map' : 'Show on Map'}</span>
            </button>
          )}
          {(currentDeal?.partnerAppName || deal.partnerAppName) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = currentDeal?.partnerAppUrl || deal.partnerAppUrl;
                if (url) {
                  window.open(url, "_blank", "noopener,noreferrer");
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-primary-600 text-sm font-medium hover:bg-primary-50 transition-colors"
            >
              <ExternalLink size={14} />
              <span>View in {(currentDeal?.partnerAppName || deal.partnerAppName)}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

