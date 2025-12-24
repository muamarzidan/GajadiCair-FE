import { useEffect,  useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  latitude: number;
  longitude: number;
  radius?: number; // Radius in meters
  onLocationChange: (lat: number, lng: number) => void;
}

// Component to update map center when props change
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (center[0] && center[1]) {
      map.flyTo(center, 15, {
        duration: 1.5
      });
    }
  }, [center, map]);
  
  return null;
}

// Component to handle map clicks
function LocationMarker({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : <Marker position={position} draggable={true} eventHandlers={{
    dragend: (e) => {
      const marker = e.target;
      const pos = marker.getLatLng();
      setPosition(pos);
      onLocationChange(pos.lat, pos.lng);
    },
  }} />;
}

export const MapPicker = ({ latitude, longitude, radius = 100, onLocationChange }: MapPickerProps) => {
  const [center, setCenter] = useState<[number, number]>([latitude || -6.2088, longitude || 106.8456]);

  useEffect(() => {
    if (latitude && longitude) {
      setCenter([latitude, longitude]);
    }
  }, [latitude, longitude]);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        {latitude && longitude && (
          <>
            <Marker position={[latitude, longitude]} draggable={true} eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                onLocationChange(pos.lat, pos.lng);
              },
            }} />
            <Circle
              center={[latitude, longitude]}
              radius={radius}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.2,
                weight: 2,
              }}
            />
          </>
        )}
        <LocationMarker onLocationChange={onLocationChange} />
      </MapContainer>
      <div className="absolute top-2 left-2 bg-white px-3 py-2 rounded-md shadow-md z-[1000] text-xs">
        <p className="font-semibold">Klik peta untuk memilih lokasi</p>
        <p className="text-muted-foreground">atau drag marker yang ada</p>
      </div>
    </div>
  );
};
