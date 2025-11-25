"use client";

import { Deal } from "@/types/deal";
import { MapPin, Clock, ExternalLink, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DealBadge from "./DealBadge";
import { trackDealClick } from "@/lib/monetization";

interface DealDetailPageProps {
  deal: Deal;
}

export default function DealDetailPage({ deal }: DealDetailPageProps) {
  const router = useRouter();
  const currentDeal = deal.deals[0] || deal;

  const handleClick = () => {
    trackDealClick(deal.id, deal.partnerAppName);
    const url = currentDeal.partnerAppUrl || deal.partnerAppUrl;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to deals</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl overflow-hidden shadow-lg"
        >
          {/* Hero Image */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={currentDeal.image || deal.image}
              alt={currentDeal.title || deal.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              {currentDeal.badge && <DealBadge type={currentDeal.badge} />}
            </div>
            <div className="absolute top-4 right-4 bg-accent-500 text-white px-4 py-2 rounded-full font-bold text-lg">
              {currentDeal.discount}% OFF
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {deal.storeName}
            </h1>
            <h2 className="text-xl text-gray-700 mb-6">
              {currentDeal.title || deal.title}
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {currentDeal.description || deal.description}
            </p>

            {/* Price */}
            {currentDeal.originalPrice && currentDeal.discountedPrice && (
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-gray-400 line-through text-lg">
                    ${currentDeal.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-primary-600 font-bold text-2xl ml-3">
                    ${currentDeal.discountedPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-accent-600 font-semibold">
                  Save ${(currentDeal.originalPrice - currentDeal.discountedPrice).toFixed(2)}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="text-primary-600" size={20} />
                <div>
                  <div className="font-medium">{deal.location.address}</div>
                  <div className="text-sm text-gray-500">
                    {deal.location.city}, {deal.location.state} {deal.location.zipCode}
                  </div>
                  {deal.distance && (
                    <div className="text-sm text-gray-500">
                      {deal.distance.toFixed(1)} km away
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="text-primary-600" size={20} />
                <div>
                  <div className="font-medium">Deal expires</div>
                  <div className="text-sm text-gray-500">
                    {new Date(currentDeal.expiresAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleClick}
              className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>Get Deal in {(currentDeal.partnerAppName || deal.partnerAppName) || "Partner App"}</span>
              <ExternalLink size={20} />
            </button>

            {/* Additional Deals from Same Store */}
            {deal.deals.length > 1 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-semibold mb-4">More Deals at {deal.storeName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {deal.deals.slice(1).map((additionalDeal) => (
                    <div
                      key={additionalDeal.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
                      onClick={() => {
                        trackDealClick(deal.id, deal.partnerAppName);
                        if (additionalDeal.partnerAppUrl) {
                          window.open(additionalDeal.partnerAppUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{additionalDeal.title}</h4>
                        {additionalDeal.badge && <DealBadge type={additionalDeal.badge} />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{additionalDeal.description}</p>
                      <div className="text-primary-600 font-semibold">
                        {additionalDeal.discount}% OFF
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

