'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DealCardGrid from '@/components/DealCardGrid';
import Header from '@/components/Header';
import { Deal } from '@/types/deal';
import { MapPin, Loader2 } from 'lucide-react';
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
  // Mobile-first: default to list view on mobile, split on desktop
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const { location, loading: locationLoading, error: locationError, permissionDenied, requestLocation } = useUserLocation();

  // Set default view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop: default to split view
        if (viewMode === 'list') {
          setViewMode('split');
        }
      } else {
        // Mobile: default to list view
        if (viewMode === 'split') {
          setViewMode('list');
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} resultCount={filteredDeals.length} />
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Mobile: View Toggle Bar - Sticky at top */}
        <div className="lg:hidden sticky top-[73px] z-40 bg-white border-b border-gray-200 px-3 py-2.5 flex items-center justify-between shadow-sm">
          <div className="text-sm font-semibold text-gray-900">
            {filteredDeals.length} {filteredDeals.length === 1 ? 'Deal' : 'Deals'}
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors touch-manipulation min-h-[36px] ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 active:bg-gray-200'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors touch-manipulation min-h-[36px] ${
                viewMode === 'map' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 active:bg-gray-200'
              }`}
            >
              Map
            </button>
          </div>
        </div>

        {/* Map View - Mobile: Full screen when selected, Desktop: Split */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div className={`relative transition-all duration-300 ${
            // Mobile: full screen, Desktop: split or full
            viewMode === 'split' 
              ? 'hidden lg:block lg:w-1/2' 
              : 'w-full'
          } h-[calc(100vh-73px)] lg:h-[calc(100vh-80px)]`}>
            {/* Map Controls - Floating */}
            <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
              {!location && !locationLoading && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={requestLocation}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-full shadow-lg active:shadow-xl transition-shadow text-xs sm:text-sm font-medium border border-gray-200 touch-manipulation min-h-[44px]"
                >
                  <MapPin size={18} className="text-rose-500" />
                  <span className="hidden sm:inline">Use My Location</span>
                  <span className="sm:hidden">Location</span>
                </motion.button>
              )}
              {location && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-full shadow-lg text-xs sm:text-sm font-medium border border-emerald-200 bg-emerald-50 min-h-[44px]">
                  <MapPin size={18} className="text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700">Location Active</span>
                  <span className="sm:hidden text-emerald-700">Active</span>
                </div>
              )}
              {locationLoading && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-full shadow-lg text-xs sm:text-sm border border-gray-200 min-h-[44px]">
                  <Loader2 size={18} className="animate-spin text-gray-600" />
                  <span className="hidden sm:inline text-gray-600">Getting location...</span>
                  <span className="sm:hidden text-gray-600">Loading...</span>
                </div>
              )}
            </div>

            {/* Desktop: View Toggle Buttons */}
            <div className="hidden lg:flex absolute top-4 right-4 z-30 gap-2 bg-white rounded-full shadow-lg p-1 border border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('split')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  viewMode === 'split' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Split
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Map
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100"
              >
                List
              </motion.button>
            </div>

            {/* Map Container */}
            <div className="h-full w-full" data-map-container>
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
                className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 px-4 py-3 bg-amber-50 border border-amber-200 rounded-full text-sm text-amber-800 shadow-lg"
              >
                Location permission denied. Enable location access to see deals near you.
              </motion.div>
            )}
          </div>
        )}

        {/* Deals List Panel - Right side or full screen */}
        {(viewMode === 'split' || viewMode === 'list') && (
          <div className={`bg-white border-l border-gray-200 transition-all duration-300 overflow-hidden ${
            viewMode === 'split' ? 'hidden lg:block lg:w-1/2' : 'w-full'
          } h-[calc(100vh-73px)] lg:h-[calc(100vh-80px)]`}>
            {/* Desktop: List Header */}
            <div className="hidden lg:block px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {filteredDeals.length} {filteredDeals.length === 1 ? 'Deal' : 'Deals'} {searchQuery ? 'Found' : 'Available'}
                  </h2>
                  {searchQuery && (
                    <p className="text-sm text-gray-500 mt-1">
                      Searching for &quot;{searchQuery}&quot;
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Deals Content - Scrollable */}
            <div className="h-full lg:h-[calc(100vh-180px)] overflow-y-auto overscroll-contain">
              <div className="px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
                {filteredDeals.length === 0 && searchQuery ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-2">No deals found for &quot;{searchQuery}&quot;</p>
                    <p className="text-gray-400 text-sm">Try searching for a restaurant name, category, or keyword like &quot;free&quot;</p>
                  </div>
                ) : filteredDeals.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No deals available</p>
                  </div>
                ) : (
                  <DealCardGrid 
                    deals={filteredDeals} 
                    selectedDeal={selectedDeal}
                  onDealSelect={(deal) => {
                    setSelectedDeal(deal);
                    // On mobile, switch to map view when deal is selected
                    if (viewMode === 'list') {
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        setViewMode('map');
                      } else {
                        setViewMode('split');
                      }
                    }
                  }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
