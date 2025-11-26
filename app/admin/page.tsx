'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Upload, Search, Loader2, Check, Globe, AlertCircle } from 'lucide-react';
import { Deal, DealCategory } from '@/types/deal';
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
  const [formData, setFormData] = useState<Partial<Deal>>({
    storeName: '',
    category: 'restaurant',
    title: '',
    description: '',
    image: '',
    discount: 0,
    originalPrice: 0,
    discountedPrice: 0,
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    partnerAppUrl: '',
    partnerAppName: '',
  });

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
    
    // If multiple locations are selected, create deals for all of them
    if (selectedLocations.size > 1 && !editingDeal) {
      if (!confirm(`Create ${selectedLocations.size} deals for all selected locations?`)) {
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
          
          const dealData = {
            ...formData,
            location: {
              lat: location.lat,
              lng: location.lng,
              address: address,
              city: city,
              state: state,
              zipCode: zipCode,
            },
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
            }
          } catch (error) {
            errorCount++;
            console.error(`Error creating deal for location ${index}:`, error);
          }
        }

        alert(`Created ${successCount} deal(s) successfully. ${errorCount > 0 ? `${errorCount} failed.` : ''}`);
        await fetchDeals();
        setShowForm(false);
        resetForm();
      } catch (error) {
        console.error('Error creating deals:', error);
        alert('Failed to create some deals');
      }
      return;
    }

    // Single deal creation/update
    try {
      const url = editingDeal
        ? `/api/deals/${editingDeal.id}`
        : '/api/deals';
      const method = editingDeal ? 'PUT' : 'POST';

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (adminPassword) {
        headers['Authorization'] = `Bearer ${adminPassword}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        await fetchDeals();
        setShowForm(false);
        setEditingDeal(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving deal:', error);
      alert('Failed to save deal');
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
    setFormData(deal);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      storeName: '',
      category: 'restaurant',
      title: '',
      description: '',
      image: '',
      discount: 0,
      originalPrice: 0,
      discountedPrice: 0,
      location: {
        lat: 40.7589,
        lng: -73.9851,
        address: '',
        city: '',
        state: '',
        zipCode: '',
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      partnerAppUrl: '',
      partnerAppName: '',
    });
    setStoreSearchQuery('');
    setStoreLocations([]);
    setSelectedLocations(new Set());
  };

  const handleSearchLocations = async () => {
    if (!storeSearchQuery.trim()) return;

    setSearchingLocations(true);
    setStoreLocations([]);
    setSelectedLocations(new Set());
    setSearchProgress('');

    try {
      if (searchMode === 'nationwide') {
        // Search ALL locations nationwide using Overpass API
        setSearchProgress('Searching all locations nationwide... This may take a moment.');
        
        const locations = await searchAllStoreLocations(storeSearchQuery, {
          state: nationwideFilter.state || undefined,
          city: nationwideFilter.city || undefined,
        });
        
        setStoreLocations(locations);
        setSearchProgress(`Found ${locations.length} locations!`);
        
        if (locations.length === 0) {
          alert('No locations found. Try a different search term or check the brand name spelling.');
        } else if (locations.length > 500) {
          alert(`Found ${locations.length} locations! This is a large number. Consider filtering by state/city.`);
        }
      } else {
        // Local search using Nominatim
        const city = formData.location?.city || nationwideFilter.city || '';
        const state = formData.location?.state || nationwideFilter.state || '';
        
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
            <h2 className="text-2xl font-semibold mb-4">
              {editingDeal ? 'Edit Deal' : 'Add New Deal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.storeName}
                    onChange={(e) =>
                      setFormData({ ...formData, storeName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
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
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
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
                    required
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalPrice: parseFloat(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discounted Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountedPrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountedPrice: parseFloat(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  
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
                      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <strong>Nationwide Search:</strong> This will find ALL locations of the store across the entire US. 
                            This may return hundreds or thousands of locations. You can filter by state/city below.
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
                          ? "Enter brand name (e.g., Dunkin, Starbucks, Shell)" 
                          : "Enter store name (e.g., Starbucks, Whole Foods)"}
                        value={storeSearchQuery}
                        onChange={(e) => setStoreSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearchLocations();
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    // Auto-fill form with first location when selecting all
                                    if (storeLocations.length > 0) {
                                      const firstLoc = storeLocations[0];
                                      const address = ('address' in firstLoc ? firstLoc.address : firstLoc.address) || '';
                                      const city = ('city' in firstLoc ? firstLoc.city : firstLoc.city) || '';
                                      const state = ('state' in firstLoc ? firstLoc.state : firstLoc.state) || '';
                                      const zipCode = ('zipCode' in firstLoc ? firstLoc.zipCode : firstLoc.zipCode) || '';
                                      
                                      setFormData({
                                        ...formData,
                                        location: {
                                          lat: firstLoc.lat,
                                          lng: firstLoc.lng,
                                          address: address as string,
                                          city: city as string,
                                          state: state as string,
                                          zipCode: zipCode as string,
                                        },
                                      });
                                    }
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
                                  
                                  // Auto-fill form with first selected location
                                  if (newSelected.size === 1) {
                                    const firstIndex = Array.from(newSelected)[0];
                                    const selectedLoc = storeLocations[firstIndex];
                                    const selAddress = (('address' in selectedLoc ? selectedLoc.address : selectedLoc.address) || '') as string;
                                    const selCity = (('city' in selectedLoc ? selectedLoc.city : selectedLoc.city) || '') as string;
                                    const selState = (('state' in selectedLoc ? selectedLoc.state : selectedLoc.state) || '') as string;
                                    const selZipCode = (('zipCode' in selectedLoc ? selectedLoc.zipCode : selectedLoc.zipCode) || '') as string;
                                    
                                    setFormData({
                                      ...formData,
                                      location: {
                                        lat: selectedLoc.lat,
                                        lng: selectedLoc.lng,
                                        address: selAddress,
                                        city: selCity,
                                        state: selState,
                                        zipCode: selZipCode,
                                      },
                                    });
                                  }
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

                  {/* Manual Location Entry (Fallback) */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 mb-2">
                      Or enter location manually
                    </summary>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={formData.location?.address || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: {
                                ...formData.location!,
                                address: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.location?.city || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: {
                                ...formData.location!,
                                city: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.location?.state || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: {
                                ...formData.location!,
                                state: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={formData.location?.zipCode || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: {
                                ...formData.location!,
                                zipCode: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={formData.location?.lat || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: {
                                ...formData.location!,
                                lat: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={formData.location?.lng || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: {
                                ...formData.location!,
                                lng: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingDeal 
                    ? 'Update Deal' 
                    : selectedLocations.size > 1 
                      ? `Create ${selectedLocations.size} Deals` 
                      : 'Create Deal'}
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

