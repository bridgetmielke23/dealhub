'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DealCardGrid from '@/components/DealCardGrid';
import Header from '@/components/Header';
import { Deal } from '@/types/deal';
import { ChevronUp, ChevronDown, List, Map as MapIcon, MapPin, Loader2, Search, X } from 'lucide-react';
import { useUserLocation } from '@/lib/useLocation';
import { motion } from 'framer-motion';

// Dynamically load the MapView component from /components/MapView
const MapView = dynamic(() => import('../components/MapView'), {
  ssr: false, // important: only render the map in the browser
});

export default function HomePage() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDealsExpanded, setIsDealsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { location, loading: locationLoading, error: locationError, permissionDenied, requestLocation } = useUserLocation();

  useEffect(() => {
    fetchDeals();
  }, [location]);

  useEffect(() => {
    // Filter deals based on search query
    if (!searchQuery.trim()) {
      setFilteredDeals(deals);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = deals.filter((deal) => {
      const storeName = deal.storeName.toLowerCase();
      const title = deal.title.toLowerCase();
      const description = (deal.description || '').toLowerCase();
      const category = deal.category.toLowerCase();
      const city = deal.location.city.toLowerCase();
      const state = deal.location.state.toLowerCase();
      
      // Check for keywords like "free"
      const isFree = query.includes('free') && (title.includes('free') || description.includes('free'));
      
      return (
        storeName.includes(query) ||
        title.includes(query) ||
        description.includes(query) ||
        category.includes(query) ||
        city.includes(query) ||
        state.includes(query) ||
        isFree
      );
    });
    
    setFilteredDeals(filtered);
  }, [searchQuery, deals]);

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
        setFilteredDeals(result.data);
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
    <div className="min-h-screen bg-white flex flex-col relative">
      <Header />
      {/* Floating Search Bar - Airbnb style */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
      >
          <div className="bg-white rounded-full shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4">
              <Search size={20} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for deals, restaurants, 'free', or locations..."
                className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm"
              />
              {searchQuery && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={18} className="text-gray-400" />
                </motion.button>
              )}
            </div>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="px-6 pb-4 border-t border-gray-100"
              >
                <p className="text-sm text-gray-600">
                  Found <span className="font-semibold text-rose-600">{filteredDeals.length}</span> {filteredDeals.length === 1 ? 'deal' : 'deals'}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Map Section - Full screen seamless like Airbnb */}
        <div 
          className={`transition-all duration-500 ease-in-out ${
            isDealsExpanded ? 'pb-4' : 'flex-1'
          }`}
        >
          <div className="relative h-full w-full">
            {/* Map Controls - Floating */}
            <div className="absolute top-24 left-4 z-30 flex flex-col gap-2">
              {!location && !locationLoading && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={requestLocation}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow text-sm font-medium border border-gray-200"
                >
                  <MapPin size={18} className="text-rose-500" />
                  <span className="hidden sm:inline">Use My Location</span>
                </motion.button>
              )}
              {location && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-lg text-sm font-medium border border-emerald-200 bg-emerald-50">
                  <MapPin size={18} className="text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700">Location Active</span>
                </div>
              )}
              {locationLoading && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-lg text-sm border border-gray-200">
                  <Loader2 size={18} className="animate-spin text-gray-600" />
                  <span className="hidden sm:inline text-gray-600">Getting location...</span>
                </div>
              )}
            </div>

            {/* Toggle Button - Floating */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDealsPanel}
              className="absolute bottom-6 right-6 z-30 flex items-center gap-2 px-5 py-3 bg-white rounded-full shadow-xl hover:shadow-2xl transition-shadow font-medium border border-gray-200"
            >
              {isDealsExpanded ? (
                <>
                  <MapIcon size={20} />
                  <span className="hidden sm:inline">Show Map</span>
                </>
              ) : (
                <>
                  <List size={20} />
                  <span className="hidden sm:inline">Show List</span>
                </>
              )}
            </motion.button>

            {/* Map Container - Full screen */}
            <div 
              className={`transition-all duration-500 ease-in-out w-full ${
                isDealsExpanded ? 'h-[300px]' : 'h-[calc(100vh-80px)]'
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
                  deals={filteredDeals} 
                  selectedDeal={selectedDeal} 
                  onDealSelect={setSelectedDeal}
                  userLocation={location}
                />
              )}
            </div>

            {/* Permission Denied Banner */}
            {permissionDenied && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30 px-4 py-3 bg-amber-50 border border-amber-200 rounded-full text-sm text-amber-800 shadow-lg"
              >
                Location permission denied. Enable location access to see deals near you.
              </motion.div>
            )}
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
                    {filteredDeals.length} {filteredDeals.length === 1 ? 'Deal' : 'Deals'} {searchQuery ? 'Found' : 'Available'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isDealsExpanded 
                      ? 'Click on a deal card to view it on the map' 
                      : 'Tap to explore all deals'}
                    {searchQuery && ` • Searching for "${searchQuery}"`}
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
              {filteredDeals.length === 0 && searchQuery ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">No deals found for &quot;{searchQuery}&quot;</p>
                  <p className="text-gray-400 text-sm">Try searching for a restaurant name, category, or keyword like &quot;free&quot;</p>
                </div>
              ) : (
                <DealCardGrid 
                  deals={filteredDeals} 
                  selectedDeal={selectedDeal}
                  onDealSelect={(deal) => {
                    setSelectedDeal(deal);
                    // Optionally collapse deals panel when a deal is selected
                    // setIsDealsExpanded(false);
                  }}
                />
              )}
            </div>
          </div>

          {/* Collapsed Preview - Show first few deals */}
          {!isDealsExpanded && (
            <div className="px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar scroll-smooth">
                {filteredDeals.slice(0, 4).map((deal, index) => (
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
              {filteredDeals.length > 4 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-gray-500 mt-4 font-medium"
                >
                  +{filteredDeals.length - 4} more deals • Tap to explore all
                </motion.p>
              )}
              {filteredDeals.length === 0 && searchQuery && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-gray-400 mt-4"
                >
                  No deals match your search
                </motion.p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
