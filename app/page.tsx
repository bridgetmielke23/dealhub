'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DealCardGrid from '@/components/DealCardGrid';
import Header from '@/components/Header';
import { Deal } from '@/types/deal';
import { ChevronUp, ChevronDown, List, Map as MapIcon, MapPin, Loader2 } from 'lucide-react';
import { useUserLocation } from '@/lib/useLocation';
import { motion } from 'framer-motion';

// Dynamically load the MapView component from /components/MapView
const MapView = dynamic(() => import('../components/MapView'), {
  ssr: false, // important: only render the map in the browser
});

export default function HomePage() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDealsExpanded, setIsDealsExpanded] = useState(false);
  const { location, loading: locationLoading, error: locationError, permissionDenied, requestLocation } = useUserLocation();

  useEffect(() => {
    fetchDeals();
  }, [location]);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      let url = '/api/deals?';
      if (location) {
        url += `lat=${location.lat}&lng=${location.lng}&maxDistance=50&sort=closest`;
      }
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setDeals(result.data);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDealsPanel = () => {
    setIsDealsExpanded(!isDealsExpanded);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Hero Section - Airbnb style */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              Find the Best Deals
              <br />
              <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                Near You
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Discover amazing deals on restaurants, gas stations, grocery stores, and coffee shops. 
              Save money on your everyday purchases.
            </p>
          </motion.div>
        </div>

        {/* Map Section - Resizes based on deals panel state */}
        <div 
          className={`transition-all duration-500 ease-in-out px-4 sm:px-6 lg:px-8 ${
            isDealsExpanded ? 'pb-4' : 'pb-2 flex-1'
          }`}
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full border border-gray-100">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Map View</h2>
                  <p className="text-sm text-gray-500">Click on markers to see deal details</p>
                </div>
                <div className="flex items-center gap-2">
                  {!location && !locationLoading && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={requestLocation}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full hover:shadow-lg transition-shadow text-sm font-medium"
                    >
                      <MapPin size={16} />
                      <span className="hidden sm:inline">Use My Location</span>
                    </motion.button>
                  )}
                  {location && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
                      <MapPin size={16} />
                      <span className="hidden sm:inline">Location Active</span>
                    </div>
                  )}
                  {locationLoading && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="hidden sm:inline">Getting location...</span>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleDealsPanel}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium shadow-md"
                  >
                    {isDealsExpanded ? (
                      <>
                        <MapIcon size={18} />
                        <span className="hidden sm:inline">Focus Map</span>
                      </>
                    ) : (
                      <>
                        <List size={18} />
                        <span className="hidden sm:inline">Show Deals</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
              {permissionDenied && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800"
                >
                  Location permission denied. Enable location access to see deals near you.
                </motion.div>
              )}
            </div>
            <div 
              className={`transition-all duration-500 ease-in-out ${
                isDealsExpanded ? 'h-[300px]' : 'h-[calc(100vh-250px)] min-h-[500px]'
              }`}
              data-map-container
            >
              {loading ? (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <Loader2 className="animate-spin mx-auto mb-3 text-rose-500" size={40} />
                    <p className="text-gray-600 font-medium">Loading amazing deals...</p>
                  </motion.div>
                </div>
              ) : (
                <MapView 
                  deals={deals} 
                  selectedDeal={selectedDeal} 
                  onDealSelect={setSelectedDeal}
                  userLocation={location}
                />
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Deals List Panel - Airbnb style */}
        <div
          className={`bg-white rounded-t-3xl shadow-2xl transition-all duration-500 ease-in-out overflow-hidden border-t border-gray-100 ${
            isDealsExpanded 
              ? 'h-[calc(100vh-400px)] min-h-[500px]' 
              : 'h-[140px]'
          }`}
        >
          {/* Drag Handle / Header */}
          <motion.div 
            className="cursor-pointer select-none"
            onClick={toggleDealsPanel}
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
          >
            <div className="px-6 pt-5 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {deals.length} {deals.length === 1 ? 'Deal' : 'Deals'} Available
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isDealsExpanded 
                      ? 'Click on a deal card to view it on the map' 
                      : 'Tap to explore all deals'}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isDealsExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <ChevronUp size={24} className="text-gray-400" />
                </motion.div>
              </div>
            </div>
            {/* Visual drag indicator */}
            <div className="flex justify-center py-3">
              <div className="w-14 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
          </motion.div>

          {/* Deals Content - Scrollable when expanded */}
          <div 
            className={`transition-all duration-500 ease-in-out overflow-y-auto ${
              isDealsExpanded ? 'opacity-100 h-[calc(100%-100px)]' : 'opacity-0 h-0 overflow-hidden'
            }`}
          >
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <DealCardGrid 
                deals={deals} 
                selectedDeal={selectedDeal}
                onDealSelect={(deal) => {
                  setSelectedDeal(deal);
                  // Optionally collapse deals panel when a deal is selected
                  // setIsDealsExpanded(false);
                }}
              />
            </div>
          </div>

          {/* Collapsed Preview - Show first few deals */}
          {!isDealsExpanded && (
            <div className="px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar scroll-smooth">
                {deals.slice(0, 4).map((deal, index) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="flex-shrink-0 w-56 bg-white rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all border border-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDeal(deal);
                      setIsDealsExpanded(true);
                    }}
                  >
                    <div className="relative mb-3">
                      <img
                        src={deal.image}
                        alt={deal.storeName}
                        className="w-full h-32 rounded-lg object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-rose-500 text-white px-2 py-1 rounded-lg font-bold text-xs">
                        {deal.discount}% OFF
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 truncate mb-1">
                        {deal.storeName}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mb-2">{deal.title}</p>
                      {deal.originalPrice && deal.discountedPrice && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 line-through text-xs">
                            ${deal.originalPrice.toFixed(2)}
                          </span>
                          <span className="text-rose-600 font-bold text-sm">
                            ${deal.discountedPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              {deals.length > 4 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-gray-500 mt-4 font-medium"
                >
                  +{deals.length - 4} more deals • Tap to explore all
                </motion.p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
