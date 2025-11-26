'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Deal } from '@/types/deal';

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  deals: Deal[];
  selectedDeal: Deal | null;
  onDealSelect: (deal: Deal | null) => void;
  userLocation?: { lat: number; lng: number } | null;
}

// Component to handle map centering when selectedDeal or userLocation changes
function MapController({ 
  selectedDeal, 
  userLocation 
}: { 
  selectedDeal: Deal | null;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedDeal) {
      map.setView([selectedDeal.location.lat, selectedDeal.location.lng], 15, {
        animate: true,
        duration: 0.5,
      });
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedDeal, userLocation, map]);

  return null;
}

export default function MapView({ deals, selectedDeal, onDealSelect, userLocation }: MapViewProps) {
  // Calculate center point based on all deals (average of all coordinates)
  const center: [number, number] = useMemo(() => {
    if (deals.length === 0) {
      return [40.7589, -73.9851]; // Default to NYC
    }
    
    const avgLat = deals.reduce((sum, deal) => sum + deal.location.lat, 0) / deals.length;
    const avgLng = deals.reduce((sum, deal) => sum + deal.location.lng, 0) / deals.length;
    
    return [avgLat, avgLng];
  }, [deals]);

  // Calculate appropriate zoom level
  const zoom = useMemo(() => {
    if (deals.length === 0) return 13;
    if (deals.length === 1) return 15;
    return 12;
  }, [deals.length]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      className="rounded-none"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController selectedDeal={selectedDeal} userLocation={userLocation} />
      
      {/* User Location Marker */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={L.divIcon({
            className: 'user-location-marker',
            html: `<div style="
              background-color: #10b981;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        >
          <Popup>Your Location</Popup>
        </Marker>
      )}
      
      {deals.map((deal) => {
        const isSelected = selectedDeal?.id === deal.id;
        // Create custom icon with different colors for selected/unselected
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background-color: ${isSelected ? '#dc2626' : '#3b82f6'};
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
            ">${deal.discount}%</div>
          </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        });

        return (
          <Marker
            key={deal.id}
            position={[deal.location.lat, deal.location.lng]}
            icon={icon}
            eventHandlers={{
              click: () => {
                onDealSelect(deal);
              },
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg mb-1">{deal.storeName}</h3>
                <p className="text-sm text-gray-600 mb-2">{deal.title}</p>
                <p className="text-xs text-gray-500 mb-1">
                  <strong>Discount:</strong> {deal.discount}% OFF
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Location:</strong> {deal.location.address}, {deal.location.city}, {deal.location.state}
                </p>
                {deal.originalPrice && deal.discountedPrice && (
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="line-through">${deal.originalPrice.toFixed(2)}</span>
                    {' '}
                    <span className="text-green-600 font-semibold">${deal.discountedPrice.toFixed(2)}</span>
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
