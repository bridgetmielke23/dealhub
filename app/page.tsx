'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DealCardGrid from '@/components/DealCardGrid';
import Header from '@/components/Header';
import { Deal } from '@/types/deal';
import { ChevronUp, ChevronDown, List, Map as MapIcon, MapPin, Loader2 } from 'lucide-react';
import { useUserLocation } from '@/lib/useLocation';

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find the Best Deals Near You
          </h1>
          <p className="text-gray-600">
            Discover amazing deals on restaurants, gas stations, grocery stores, and coffee shops
          </p>
        </div>

        {/* Map Section - Resizes based on deals panel state */}
        <div 
          className={`transition-all duration-500 ease-in-out px-4 sm:px-6 lg:px-8 ${
            isDealsExpanded ? 'pb-4' : 'pb-2 flex-1'
          }`}
        >
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Map View</h2>
                  <p className="text-sm text-gray-500">Click on markers to see deal details</p>
                </div>
                <div className="flex items-center gap-2">
                  {!location && !locationLoading && (
                    <button
                      onClick={requestLocation}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <MapPin size={16} />
                      <span className="hidden sm:inline">Use My Location</span>
                    </button>
                  )}
                  {location && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                      <MapPin size={16} />
                      <span className="hidden sm:inline">Location Active</span>
                    </div>
                  )}
                  {locationLoading && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="hidden sm:inline">Getting location...</span>
                    </div>
                  )}
                  <button
                    onClick={toggleDealsPanel}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
                  </button>
                </div>
              </div>
              {permissionDenied && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  Location permission denied. Enable location access to see deals near you.
                </div>
              )}
            </div>
            <div 
              className={`transition-all duration-500 ease-in-out ${
                isDealsExpanded ? 'h-[300px]' : 'h-[calc(100vh-250px)] min-h-[500px]'
              }`}
              data-map-container
            >
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-2 text-primary-600" size={32} />
                    <p className="text-gray-600">Loading deals...</p>
                  </div>
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

        {/* Collapsible Deals List Panel */}
        <div
          className={`bg-white rounded-t-3xl shadow-2xl transition-all duration-500 ease-in-out overflow-hidden ${
            isDealsExpanded 
              ? 'h-[calc(100vh-400px)] min-h-[500px]' 
              : 'h-[120px]'
          }`}
        >
          {/* Drag Handle / Header */}
          <div 
            className="cursor-pointer select-none"
            onClick={toggleDealsPanel}
          >
            <div className="px-6 pt-4 pb-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    All Deals ({deals.length})
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isDealsExpanded 
                      ? 'Click "Show on Map" on a deal card to view it on the map' 
                      : 'Slide up to see all deals'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isDealsExpanded ? (
                    <ChevronDown size={24} className="text-gray-500" />
                  ) : (
                    <ChevronUp size={24} className="text-gray-500" />
                  )}
                </div>
              </div>
            </div>
            {/* Visual drag indicator */}
            <div className="flex justify-center py-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>

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
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                {deals.slice(0, 4).map((deal) => (
                  <div
                    key={deal.id}
                    className="flex-shrink-0 w-48 bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDeal(deal);
                      setIsDealsExpanded(true);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={deal.image}
                        alt={deal.storeName}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {deal.storeName}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{deal.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-600 font-bold text-sm">
                        {deal.discount}% OFF
                      </span>
                      {deal.originalPrice && deal.discountedPrice && (
                        <span className="text-gray-600 text-xs">
                          ${deal.discountedPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {deals.length > 4 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  +{deals.length - 4} more deals - Slide up to see all
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
