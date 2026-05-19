'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ListingPublic } from '@rentnear/types';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

// Fix for default marker icons in Leaflet when using Webpack/Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface ListingsMapProps {
  listings: ListingPublic[];
}

export default function ListingsMap({ listings }: ListingsMapProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-neutral-100 animate-pulse" />;

  // Center map on the first listing, or fallback to a default location (e.g., India center)
  const first = listings[0];
  const defaultCenter: [number, number] = first && first.lat !== null && first.lng !== null
    ? [first.lat, first.lng]
    : [20.5937, 78.9629]; // Center of India

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={listings.length > 0 ? 12 : 5} 
      className="w-full h-full z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {listings.map((listing) => {
        if (listing.lat === null || listing.lng === null) return null;
        
        return (
          <Marker 
            key={listing.id} 
            position={[listing.lat, listing.lng]} 
            icon={customIcon}
          >
            <Popup className="listing-popup">
              <div 
                className="w-48 cursor-pointer overflow-hidden rounded-lg group"
                onClick={() => router.push(`/listings/${listing.id}`)}
              >
                <div className="relative h-32 w-full bg-neutral-200">
                  {listing.media?.[0] ? (
                    <img 
                      src={listing.media[0].url} 
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-400">No Image</div>
                  )}
                  {listing.rating > 0 && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-neutral-900 backdrop-blur-sm shadow-sm">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {listing.rating.toFixed(1)}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-white">
                  <h3 className="font-semibold text-neutral-900 truncate">{listing.title}</h3>
                  <p className="mt-1 font-bold text-primary-600">
                    ₹{listing.pricePerDay} <span className="text-xs font-normal text-neutral-500">/day</span>
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
