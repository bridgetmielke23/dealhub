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
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 touch-manipulation ${
        isSelected ? 'ring-2 ring-rose-500 shadow-xl scale-[1.02]' : ''
      }`}
      onClick={handleDealClick}
    >
      {/* Image Container - Airbnb style */}
      <div className="relative h-48 sm:h-64 overflow-hidden group">
        <motion.img
          src={currentDeal?.image || deal.image}
          alt={currentDeal?.title || deal.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {currentDeal?.badge && <DealBadge type={currentDeal.badge} />}
          {deal.badge && deal.badge !== currentDeal?.badge && (
            <DealBadge type={deal.badge} />
          )}
        </div>

        {/* Discount Badge - Enhanced */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="absolute top-4 right-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg"
        >
          {currentDeal?.discount || deal.discount}% OFF
        </motion.div>

        {/* Multiple Deals Indicator */}
        {hasMultipleDeals && (
          <DealCarousel
            totalDeals={dealsArray.length}
            currentIndex={currentDealIndex}
            onIndexChange={setCurrentDealIndex}
          />
        )}
      </div>

      {/* Content - Airbnb style */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
              {deal.storeName}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {currentDeal?.title || deal.title}
            </p>
          </div>
        </div>

        {/* Price - Enhanced */}
        {(currentDeal?.originalPrice && currentDeal?.discountedPrice) || (deal.originalPrice && deal.discountedPrice) ? (
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-gray-400 line-through text-sm">
              ${(currentDeal?.originalPrice || deal.originalPrice || 0).toFixed(2)}
            </span>
            <span className="text-gray-900 font-bold text-xl">
              ${(currentDeal?.discountedPrice || deal.discountedPrice || 0).toFixed(2)}
            </span>
            <span className="text-rose-600 font-semibold text-sm">
              Save ${((currentDeal?.originalPrice || deal.originalPrice || 0) - (currentDeal?.discountedPrice || deal.discountedPrice || 0)).toFixed(2)}
            </span>
          </div>
        ) : null}

        {/* Location & Expires - Combined */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-gray-600 text-sm">
            <MapPin size={16} className="text-gray-400" />
            <span className="line-clamp-1">
              {deal.location.city}, {deal.location.state}
            </span>
            {deal.distance && (
              <span className="text-gray-400">• {deal.distance.toFixed(1)} km away</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Clock size={16} className="text-gray-400" />
            <span>
              Expires {new Date(currentDeal?.expiresAt || deal.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Action Buttons - Enhanced for Mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-4 border-t border-gray-100">
          {onSelect && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShowOnMap}
              className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-full text-sm font-semibold transition-all touch-manipulation ${
                isSelected
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              <Map size={16} />
              <span>{isSelected ? 'On Map' : 'Show on Map'}</span>
            </motion.button>
          )}
          {(currentDeal?.partnerAppName || deal.partnerAppName) && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                const url = currentDeal?.partnerAppUrl || deal.partnerAppUrl;
                if (url) {
                  window.open(url, "_blank", "noopener,noreferrer");
                }
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-semibold active:shadow-lg transition-all touch-manipulation"
            >
              <ExternalLink size={16} />
              <span>Get Deal</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

