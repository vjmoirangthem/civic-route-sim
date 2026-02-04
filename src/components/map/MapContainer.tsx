import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSimulation } from '@/context/SimulationContext';
import { mapCenter, mapZoom } from '@/data/sampleData';
import { Citizen } from '@/types';

interface MapContainerProps {
  showCitizens?: boolean;
  showTrucks?: boolean;
  showRoutes?: boolean;
  highlightCitizen?: Citizen | null;
  onCitizenClick?: (citizen: Citizen) => void;
  className?: string;
  primaryTruckId?: string; // Filter to show only this truck (for citizen view)
}

const MapContainer: React.FC<MapContainerProps> = ({
  showCitizens = true,
  showTrucks = true,
  showRoutes = true,
  highlightCitizen,
  onCitizenClick,
  className = '',
  primaryTruckId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  const { trucks, routes, citizens } = useSimulation();

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: mapCenter,
      zoom: mapZoom,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add/update routes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !showRoutes) return;

    const map = mapRef.current;

    routes.forEach((route) => {
      const sourceId = `route-${route.id}`;
      const layerId = `route-layer-${route.id}`;

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route.coordinates,
            },
          },
        });

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#2D9C7B',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });
      }
    });
  }, [routes, mapLoaded, showRoutes]);

  // Update truck markers - filter by primaryTruckId if specified
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !showTrucks) return;

    // Filter trucks if primaryTruckId is set
    const trucksToShow = primaryTruckId 
      ? trucks.filter(t => t.id === primaryTruckId)
      : trucks;

    // Remove markers for trucks that shouldn't be shown anymore
    Object.keys(markersRef.current).forEach(markerId => {
      if (markerId.startsWith('truck-')) {
        const truckId = markerId.replace('truck-', '');
        const shouldShow = trucksToShow.some(t => t.id === truckId);
        if (!shouldShow) {
          markersRef.current[markerId].remove();
          delete markersRef.current[markerId];
        }
      }
    });

    trucksToShow.forEach((truck) => {
      const markerId = `truck-${truck.id}`;
      
      if (markersRef.current[markerId]) {
        // Update existing marker position
        markersRef.current[markerId].setLngLat(truck.currentPosition);
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'truck-marker';
        el.innerHTML = `
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #E67E22 0%, #D35400 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(230, 126, 34, 0.4);
            border: 3px solid white;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(truck.currentPosition)
          .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family: Inter, sans-serif; padding: 8px;">
              <strong>${truck.name}</strong><br/>
              Speed: ${truck.speed} km/h<br/>
              Status: ${truck.status}
            </div>
          `))
          .addTo(mapRef.current!);

        markersRef.current[markerId] = marker;
      }
    });
  }, [trucks, mapLoaded, showTrucks, primaryTruckId]);

  // Add citizen markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !showCitizens) return;

    citizens.forEach((citizen) => {
      const markerId = `citizen-${citizen.id}`;
      const isHighlighted = highlightCitizen?.id === citizen.id;

      // Remove existing marker if highlighting changed
      if (markersRef.current[markerId]) {
        markersRef.current[markerId].remove();
        delete markersRef.current[markerId];
      }

      const statusColors: Record<string, string> = {
        pending: '#F39C12',
        approaching: '#3498DB',
        collected: '#27AE60',
        missed: '#E74C3C',
      };

      const el = document.createElement('div');
      el.className = 'citizen-marker';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="
          width: ${isHighlighted ? '32px' : '24px'};
          height: ${isHighlighted ? '32px' : '24px'};
          background: ${statusColors[citizen.status]};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          border: ${isHighlighted ? '3px solid white' : '2px solid white'};
          transition: all 0.2s ease;
        ">
          <svg width="${isHighlighted ? '16' : '12'}" height="${isHighlighted ? '16' : '12'}" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([citizen.longitude, citizen.latitude])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: Inter, sans-serif; padding: 8px;">
            <strong>${citizen.name}</strong><br/>
            ${citizen.address}<br/>
            <span style="color: ${statusColors[citizen.status]}; font-weight: 500;">
              ${citizen.status.charAt(0).toUpperCase() + citizen.status.slice(1)}
            </span>
          </div>
        `))
        .addTo(mapRef.current!);

      if (onCitizenClick) {
        el.addEventListener('click', () => onCitizenClick(citizen));
      }

      markersRef.current[markerId] = marker;
    });

    // Center on highlighted citizen
    if (highlightCitizen && mapRef.current) {
      mapRef.current.flyTo({
        center: [highlightCitizen.longitude, highlightCitizen.latitude],
        zoom: 16,
        duration: 1000,
      });
    }
  }, [citizens, mapLoaded, showCitizens, highlightCitizen, onCitizenClick]);

  return (
    <div
      ref={mapContainerRef}
      className={`map-container ${className}`}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    />
  );
};

export default MapContainer;
