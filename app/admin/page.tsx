'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Upload, Search, Loader2, Check, Globe, AlertCircle } from 'lucide-react';
import { Deal, DealCategory, DealItem } from '@/types/deal';
import { searchStoreLocations, LocationResult } from '@/lib/geocoding';
import { searchAllStoreLocations, OverpassLocation } from '@/lib/overpass';

export default function AdminPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [storeLocations, setStoreLocations] = useState<(LocationResult | OverpassLocation)[]>([]);
  const [searchingLocations, setSearchingLocations] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<Set<number>>(new Set());
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchMode, setSearchMode] = useState<'local' | 'nationwide'>('local');
  const [searchProgress, setSearchProgress] = useState<string>('');
  const [nationwideFilter, setNationwideFilter] = useState({ state: '', city: '' });
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Store-level data
  const [storeData, setStoreData] = useState({
    storeName: '',
    category: 'restaurant' as DealCategory,
    storeLogo: '',
  });
  
  // Multiple deals per store
  const [storeDeals, setStoreDeals] = useState<Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    discount: number;
    originalPrice?: number;
    discountedPrice?: number;
    startDate: Date;
    endDate: Date;
    partnerAppUrl?: string;
    partnerAppName?: string;
  }>>([]);
  
  // Form state for adding/editing a single deal
  const [currentDeal, setCurrentDeal] = useState<{
    title: string;
    description: string;
    image: string;
    discount: number;
    originalPrice?: number;
    discountedPrice?: number;
    startDate: Date;
    endDate: Date;
    partnerAppUrl?: string;
    partnerAppName?: string;
  } | null>(null);
  
  const [editingDealIndex, setEditingDealIndex] = useState<number | null>(null);
  
  // Helper to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  };
  
  // Helper to get date from input (returns Date object)
  const getDateFromInput = (dateString: string): Date => {
    return new Date(dateString + 'T00:00:00');
  };

  useEffect(() => {
    // Check if password is stored in localStorage
    const storedPassword = localStorage.getItem('admin_password');
    if (storedPassword) {
      setAdminPassword(storedPassword);
      setIsAuthenticated(true);
      fetchDeals();
    }
  }, []);

  const handleLogin = () => {
    if (adminPassword) {
      localStorage.setItem('admin_password', adminPassword);
      setIsAuthenticated(true);
      fetchDeals();
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate store data
    if (!storeData.storeName.trim()) {
      alert('Please enter a store name');
      return;
    }
    
    if (storeDeals.length === 0) {
      alert('Please add at least one deal');
      return;
    }
    
    if (selectedLocations.size === 0) {
      alert('Please select at least one location');
      return;
    }
    
    if (!confirm(`Create ${storeDeals.length} deal(s) for ${selectedLocations.size} location(s)? This will create ${storeDeals.length * selectedLocations.size} total deal records.`)) {
      return;
    }
    
    try {
      const selectedIndices = Array.from(selectedLocations);
      let successCount = 0;
      let errorCount = 0;

      for (const index of selectedIndices) {
        const location = storeLocations[index];
        const address = 'address' in location ? location.address : location.address || '';
        const city = 'city' in location ? location.city : location.city || '';
        const state = 'state' in location ? location.state : location.state || '';
        const zipCode = 'zipCode' in location ? location.zipCode : location.zipCode || '';
        
        // Convert store deals to DealItem format
        const dealItems: DealItem[] = storeDeals.map(deal => ({
          id: deal.id,
          title: deal.title,
          description: deal.description,
          image: deal.image,
          discount: deal.discount,
          originalPrice: deal.originalPrice,
          discountedPrice: deal.discountedPrice,
          expiresAt: deal.endDate,
          partnerAppUrl: deal.partnerAppUrl,
          partnerAppName: deal.partnerAppName,
        }));
        
        // Use the first deal as the main deal data
        const mainDeal = storeDeals[0];
        
        const dealData = {
          storeName: storeData.storeName,
          category: storeData.category,
          storeLogo: storeData.storeLogo || undefined,
          title: mainDeal.title,
          description: mainDeal.description,
          image: mainDeal.image,
          discount: mainDeal.discount,
          originalPrice: mainDeal.originalPrice,
          discountedPrice: mainDeal.discountedPrice,
          location: {
            lat: location.lat,
            lng: location.lng,
            address: address as string,
            city: city as string,
            state: state as string,
            zipCode: zipCode as string,
          },
          expiresAt: mainDeal.endDate,
          deals: dealItems,
          views: 0,
          clicks: 0,
          partnerAppUrl: mainDeal.partnerAppUrl,
          partnerAppName: mainDeal.partnerAppName,
        };

        try {
          const headers: HeadersInit = { 'Content-Type': 'application/json' };
          if (adminPassword) {
            headers['Authorization'] = `Bearer ${adminPassword}`;
          }
          
          const response = await fetch('/api/deals', {
            method: 'POST',
            headers,
            body: JSON.stringify(dealData),
          });

          const result = await response.json();
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to create deal for location ${index}:`, result.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error creating deal for location ${index}:`, error);
        }
      }

      alert(`Created ${successCount} location(s) successfully with ${storeDeals.length} deal(s) each. ${errorCount > 0 ? `${errorCount} failed.` : ''}`);
      await fetchDeals();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating deals:', error);
      alert('Failed to create some deals');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      const headers: HeadersInit = {};
      if (adminPassword) {
        headers['Authorization'] = `Bearer ${adminPassword}`;
      }
      
      const response = await fetch(`/api/deals/${id}`, {
        method: 'DELETE',
        headers,
      });
      const result = await response.json();
      if (result.success) {
        await fetchDeals();
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert('Failed to delete deal');
    }
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    // For editing, we'll need to populate the form with existing deal data
    // This is a simplified version - you may want to enhance this
    setStoreData({
      storeName: deal.storeName,
      category: deal.category,
      storeLogo: deal.storeLogo || '',
    });
    // Convert deal.deals array to storeDeals format
    if (deal.deals && deal.deals.length > 0) {
      const convertedDeals = deal.deals.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        image: d.image || deal.image,
        discount: d.discount,
        originalPrice: d.originalPrice,
        discountedPrice: d.discountedPrice,
        startDate: new Date(d.expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: d.expiresAt,
        partnerAppUrl: d.partnerAppUrl,
        partnerAppName: d.partnerAppName,
      }));
      setStoreDeals(convertedDeals);
    } else {
      // If no deals array, create one from the main deal
      setStoreDeals([{
        id: deal.id,
        title: deal.title,
        description: deal.description,
        image: deal.image,
        discount: deal.discount,
        originalPrice: deal.originalPrice,
        discountedPrice: deal.discountedPrice,
        startDate: new Date(deal.expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: deal.expiresAt,
        partnerAppUrl: deal.partnerAppUrl,
        partnerAppName: deal.partnerAppName,
      }]);
    }
    setShowForm(true);
  };

  // Deal management functions
  const addDeal = () => {
    if (!currentDeal || !currentDeal.title || !currentDeal.image) {
      alert('Please fill in at least title and image for the deal');
      return;
    }
    
    if (currentDeal.endDate < currentDeal.startDate) {
      alert('End date must be after start date');
      return;
    }
    
    if (editingDealIndex !== null) {
      // Update existing deal
      const updated = [...storeDeals];
      updated[editingDealIndex] = { ...currentDeal, id: updated[editingDealIndex].id };
      setStoreDeals(updated);
      setEditingDealIndex(null);
    } else {
      // Add new deal
      setStoreDeals([...storeDeals, { ...currentDeal, id: Date.now().toString() }]);
    }
    
    // Reset current deal form
    setCurrentDeal({
      title: '',
      description: '',
      image: '',
      discount: 0,
      originalPrice: undefined,
      discountedPrice: undefined,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      partnerAppUrl: undefined,
      partnerAppName: undefined,
    });
  };
  
  // Initialize currentDeal when adding a new deal
  const startAddingDeal = () => {
    if (!currentDeal) {
      setCurrentDeal({
        title: '',
        description: '',
        image: '',
        discount: 0,
        originalPrice: undefined,
        discountedPrice: undefined,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        partnerAppUrl: undefined,
        partnerAppName: undefined,
      });
    }
  };
  
  const editDeal = (index: number) => {
    setCurrentDeal({ ...storeDeals[index] });
    setEditingDealIndex(index);
  };
  
  const removeDeal = (index: number) => {
    if (confirm('Remove this deal?')) {
      setStoreDeals(storeDeals.filter((_, i) => i !== index));
    }
  };
  
  const resetForm = () => {
    setStoreData({
      storeName: '',
      category: 'restaurant',
      storeLogo: '',
    });
    setStoreDeals([]);
    setCurrentDeal(null);
    setEditingDealIndex(null);
    setStoreSearchQuery('');
    setStoreLocations([]);
    setSelectedLocations(new Set());
  };

  const handleSearchLocations = async () => {
    if (!storeSearchQuery.trim()) {
      alert('Please enter a store name to search');
      return;
    }

    setSearchingLocations(true);
    setStoreLocations([]);
    setSelectedLocations(new Set());
    setSearchProgress('');

    try {
      if (searchMode === 'nationwide') {
        // Search ALL locations nationwide using Overpass API
        setSearchProgress('Searching all locations nationwide... This may take 30-60 seconds. Please wait...');
        
        try {
          const locations = await searchAllStoreLocations(storeSearchQuery.trim(), {
            state: nationwideFilter.state?.trim() || undefined,
            city: nationwideFilter.city?.trim() || undefined,
          });
          
          setStoreLocations(locations);
          
          if (locations.length === 0) {
            setSearchProgress('No locations found. Try:');
            alert(`No locations found for "${storeSearchQuery}".\n\nTips:\n- Use the exact brand name (e.g., "Starbucks", "McDonald\'s", "Walmart")\n- Try without special characters\n- Check spelling\n- Some smaller chains may not be in the database`);
          } else {
            setSearchProgress(`✓ Found ${locations.length} location${locations.length === 1 ? '' : 's'}!`);
            if (locations.length > 500) {
              alert(`Found ${locations.length} locations! This is a large number. Consider filtering by state/city to narrow results.`);
            }
          }
        } catch (error) {
          console.error('Overpass search error:', error);
          setSearchProgress('Search failed. Please try again or use a different search term.');
          alert(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try:\n- A different store name\n- Checking your internet connection\n- Using the Local search mode instead`);
        }
      } else {
        // Local search using Nominatim
        const city = nationwideFilter.city || '';
        const state = nationwideFilter.state || '';
        
        setSearchProgress('Searching locations...');
        const locations = await searchStoreLocations(storeSearchQuery, city, state);
        setStoreLocations(locations);
        setSearchProgress(`Found ${locations.length} locations`);
        
        if (locations.length === 0) {
          alert('No locations found. Try a different search term or add city/state to narrow results.');
        }
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      alert('Failed to search locations. Please try again.');
      setSearchProgress('');
    } finally {
      setSearchingLocations(false);
      setTimeout(() => setSearchProgress(''), 3000);
    }
  };

  // Login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Login</h1>
          <p className="text-gray-600 mb-6">
            Enter your admin password to access the deal management panel.
          </p>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Admin Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Login
            </button>
            <p className="text-xs text-gray-500 text-center">
              Set ADMIN_PASSWORD in your environment variables
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deal Management</h1>
            <p className="text-gray-600 mt-1">Manage all deals in your system</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingDeal(null);
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Add New Deal
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">
              {editingDeal ? 'Edit Deal' : 'Add Deals to Store'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Store Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Store Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Store/Brand Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={storeData.storeName}
                      onChange={(e) =>
                        setStoreData({ ...storeData, storeName: e.target.value })
                      }
                      placeholder="e.g., Starbucks, McDonald's, Walmart"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={storeData.category}
                      onChange={(e) =>
                        setStoreData({
                          ...storeData,
                          category: e.target.value as DealCategory,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="restaurant">Restaurant</option>
                      <option value="grocery">Grocery</option>
                      <option value="gas">Gas Station</option>
                      <option value="coffee">Coffee</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Store Logo URL (optional)
                    </label>
                    <input
                      type="url"
                      value={storeData.storeLogo}
                      onChange={(e) =>
                        setStoreData({ ...storeData, storeLogo: e.target.value })
                      }
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Deal Management */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 2: Add Deals ({storeDeals.length} added)
                </h3>
                
                {/* List of added deals */}
                {storeDeals.length > 0 && (
                  <div className="mb-6 space-y-3">
                    {storeDeals.map((deal, index) => (
                      <div key={deal.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{deal.title}</div>
                            <div className="text-sm text-gray-600 mt-1">{deal.description}</div>
                            <div className="text-xs text-gray-500 mt-2">
                              {formatDateForInput(deal.startDate)} - {formatDateForInput(deal.endDate)} | {deal.discount}% off
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => editDeal(index)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDeal(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add/Edit Deal Form */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">
                      {editingDealIndex !== null ? 'Edit Deal' : 'Add New Deal'}
                    </h4>
                    {!currentDeal && (
                      <button
                        type="button"
                        onClick={startAddingDeal}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={16} className="inline mr-1" />
                        New Deal
                      </button>
                    )}
                  </div>
                  {currentDeal && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deal Title *
                      </label>
                      <input
                        type="text"
                        value={currentDeal?.title || ''}
                        onChange={(e) =>
                          setCurrentDeal({
                            ...currentDeal!,
                            title: e.target.value,
                            description: currentDeal?.description || '',
                            image: currentDeal?.image || '',
                            discount: currentDeal?.discount || 0,
                            originalPrice: currentDeal?.originalPrice,
                            discountedPrice: currentDeal?.discountedPrice,
                            startDate: currentDeal?.startDate || new Date(),
                            endDate: currentDeal?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            partnerAppUrl: currentDeal?.partnerAppUrl,
                            partnerAppName: currentDeal?.partnerAppName,
                          })
                        }
                        placeholder="e.g., Buy One Get One Free"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={currentDeal?.description || ''}
                        onChange={(e) =>
                          setCurrentDeal({
                            ...currentDeal!,
                            description: e.target.value,
                            title: currentDeal?.title || '',
                            image: currentDeal?.image || '',
                            discount: currentDeal?.discount || 0,
                            originalPrice: currentDeal?.originalPrice,
                            discountedPrice: currentDeal?.discountedPrice,
                            startDate: currentDeal?.startDate || new Date(),
                            endDate: currentDeal?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            partnerAppUrl: currentDeal?.partnerAppUrl,
                            partnerAppName: currentDeal?.partnerAppName,
                          })
                        }
                        rows={2}
                        placeholder="Deal description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL *
                      </label>
                      <input
                        type="url"
                        value={currentDeal?.image || ''}
                        onChange={(e) =>
                          setCurrentDeal({
                            ...currentDeal!,
                            image: e.target.value,
                            title: currentDeal?.title || '',
                            description: currentDeal?.description || '',
                            discount: currentDeal?.discount || 0,
                            originalPrice: currentDeal?.originalPrice,
                            discountedPrice: currentDeal?.discountedPrice,
                            startDate: currentDeal?.startDate || new Date(),
                            endDate: currentDeal?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            partnerAppUrl: currentDeal?.partnerAppUrl,
                            partnerAppName: currentDeal?.partnerAppName,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (%) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={currentDeal?.discount || 0}
                        onChange={(e) =>
                          setCurrentDeal({
                            ...currentDeal!,
                            discount: parseFloat(e.target.value) || 0,
                            title: currentDeal?.title || '',
                            description: currentDeal?.description || '',
                            image: currentDeal?.image || '',
                            originalPrice: currentDeal?.originalPrice,
                            discountedPrice: currentDeal?.discountedPrice,
                            startDate: currentDeal?.startDate || new Date(),
                            endDate: currentDeal?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            partnerAppUrl: currentDeal?.partnerAppUrl,
                            partnerAppName: currentDeal?.partnerAppName,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(currentDeal?.startDate)}
                        onChange={(e) => {
                          const newStart = getDateFromInput(e.target.value);
                          setCurrentDeal({
                            ...currentDeal!,
                            startDate: newStart,
                            endDate: currentDeal?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            title: currentDeal?.title || '',
                            description: currentDeal?.description || '',
                            image: currentDeal?.image || '',
                            discount: currentDeal?.discount || 0,
                            originalPrice: currentDeal?.originalPrice,
                            discountedPrice: currentDeal?.discountedPrice,
                            partnerAppUrl: currentDeal?.partnerAppUrl,
                            partnerAppName: currentDeal?.partnerAppName,
                          });
                        }}
                        min={formatDateForInput(new Date())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(currentDeal?.endDate)}
                        onChange={(e) =>
                          setCurrentDeal({
                            ...currentDeal!,
                            endDate: getDateFromInput(e.target.value),
                            startDate: currentDeal?.startDate || new Date(),
                            title: currentDeal?.title || '',
                            description: currentDeal?.description || '',
                            image: currentDeal?.image || '',
                            discount: currentDeal?.discount || 0,
                            originalPrice: currentDeal?.originalPrice,
                            discountedPrice: currentDeal?.discountedPrice,
                            partnerAppUrl: currentDeal?.partnerAppUrl,
                            partnerAppName: currentDeal?.partnerAppName,
                          })
                        }
                        min={formatDateForInput(currentDeal?.startDate || new Date())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <button
                        type="button"
                        onClick={addDeal}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {editingDealIndex !== null ? 'Update Deal' : 'Add Deal'}
                      </button>
                      {editingDealIndex !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentDeal({
                              title: '',
                              description: '',
                              image: '',
                              discount: 0,
                              originalPrice: undefined,
                              discountedPrice: undefined,
                              startDate: new Date(),
                              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                              partnerAppUrl: undefined,
                              partnerAppName: undefined,
                            });
                            setEditingDealIndex(null);
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </div>

              {/* Step 3: Location Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 3: Select Locations ({selectedLocations.size} selected)
                </h3>
                
                {/* Store Location Search */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Search size={18} className="text-blue-600" />
                        <span className="font-medium text-blue-900">Find Store Locations Automatically (Free)</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => setSearchMode('local')}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            searchMode === 'local'
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Local
                        </button>
                        <button
                          type="button"
                          onClick={() => setSearchMode('nationwide')}
                          className={`px-3 py-1 rounded text-sm transition-colors flex items-center gap-1 ${
                            searchMode === 'nationwide'
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Globe size={14} />
                          Nationwide
                        </button>
                      </div>
                    </div>
                    
                    {searchMode === 'nationwide' && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle size={16} className="text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <strong>Nationwide Search:</strong> Enter the exact store/brand name (e.g., Starbucks, McDonald&apos;s, Walmart). 
                            This will find ALL locations across the US. Search may take 30-60 seconds. You can filter by state/city below.
                          </div>
                        </div>
                      </div>
                    )}

                    {searchMode === 'nationwide' && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Filter by State (optional, e.g., NY, CA)"
                          value={nationwideFilter.state}
                          onChange={(e) => setNationwideFilter({ ...nationwideFilter, state: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Filter by City (optional)"
                          value={nationwideFilter.city}
                          onChange={(e) => setNationwideFilter({ ...nationwideFilter, city: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder={searchMode === 'nationwide' 
                          ? "Enter exact brand name (e.g., Starbucks, McDonald's, Walmart)" 
                          : "Enter store name (e.g., Starbucks, Whole Foods)"}
                        value={storeSearchQuery}
                        onChange={(e) => setStoreSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearchLocations();
                          }
                        }}
                        disabled={searchingLocations}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={handleSearchLocations}
                        disabled={!storeSearchQuery.trim() || searchingLocations}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {searchingLocations ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            {searchMode === 'nationwide' ? <Globe size={16} /> : <Search size={16} />}
                            {searchMode === 'nationwide' ? 'Find All Locations' : 'Find Locations'}
                          </>
                        )}
                      </button>
                    </div>

                    {searchProgress && (
                      <div className="mb-3 p-2 bg-blue-100 border border-blue-300 rounded text-sm text-blue-800">
                        {searchProgress}
                      </div>
                    )}
                    
                    {storeLocations.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Found {storeLocations.length} locations
                          </span>
                          <div className="flex items-center gap-2">
                            {storeLocations.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectedLocations.size === storeLocations.length) {
                                    setSelectedLocations(new Set());
                                  } else {
                                    const allIndices = new Set(storeLocations.map((_, i) => i));
                                    setSelectedLocations(allIndices);
                                    // No need to auto-fill - we just select locations
                                  }
                                }}
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                              >
                                {selectedLocations.size === storeLocations.length ? 'Deselect All' : 'Select All'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setStoreLocations([]);
                                setSelectedLocations(new Set());
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                        <div className={`overflow-y-auto space-y-2 ${
                          storeLocations.length > 10 ? 'max-h-60' : 'max-h-96'
                        }`}>
                          {storeLocations.map((loc, index) => {
                            const address = (('address' in loc ? loc.address : loc.address) || '') as string;
                            const city = (('city' in loc ? loc.city : loc.city) || '') as string;
                            const state = (('state' in loc ? loc.state : loc.state) || '') as string;
                            const zipCode = (('zipCode' in loc ? loc.zipCode : loc.zipCode) || '') as string;
                            const displayName = ('displayName' in loc ? (loc as any).displayName : (loc as any).displayName) || ((loc as any).name || '');
                            
                            return (
                              <div
                                key={index}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedLocations.has(index)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => {
                                  const newSelected = new Set(selectedLocations);
                                  if (newSelected.has(index)) {
                                    newSelected.delete(index);
                                  } else {
                                    newSelected.add(index);
                                  }
                                  setSelectedLocations(newSelected);
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                    selectedLocations.has(index)
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-gray-300'
                                  }`}>
                                    {selectedLocations.has(index) && (
                                      <Check size={12} className="text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                      {displayName.split(',')[0] || 'Unknown'}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {address && `${address}, `}{city}{city && state ? ', ' : ''}{state} {zipCode}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {selectedLocations.size > 0 && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                            <div className="font-medium mb-1">
                              {selectedLocations.size} location(s) selected
                            </div>
                            {selectedLocations.size === 1 ? (
                              <div className="text-xs">Form will use this location.</div>
                            ) : (
                              <div className="text-xs">
                                Click &quot;Create Deal&quot; to create deals for all {selectedLocations.size} locations at once!
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  disabled={storeDeals.length === 0 || selectedLocations.size === 0}
                >
                  Create {storeDeals.length} Deal(s) for {selectedLocations.size} Location(s)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingDeal(null);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Deals List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">All Deals ({deals.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Store
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Expires
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={deal.image}
                            alt={deal.storeName}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {deal.storeName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {deal.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{deal.title}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-primary-600 font-semibold">
                          {deal.discount}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin size={14} />
                          {deal.location.city}, {deal.location.state}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {new Date(deal.expiresAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                        {new Date(deal.expiresAt) < new Date() && (
                          <div className="text-xs text-red-600 mt-1">Expired</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(deal)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(deal.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

