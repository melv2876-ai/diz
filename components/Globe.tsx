'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
const ReactGlobe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center text-emerald-500/50 font-mono text-xs gap-4">
      <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      Инициализация глобальной сети...
    </div>
  )
});

interface GlobeProps {
  selectedCountryId?: string | null;
  selectedLocation?: [number, number] | null;
  serverInfo?: { city: string; country: string; flag: string } | null;
}

export default function Globe({ selectedCountryId, selectedLocation, serverInfo }: GlobeProps) {
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [countries, setCountries] = useState({ features: [] });
  const [globeImageUrl, setGlobeImageUrl] = useState('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg');
  const [bumpImageUrl, setBumpImageUrl] = useState('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png');

  useEffect(() => {
    const checkImage = (url: string) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    };

    const validateTextures = async () => {
      const isPrimaryOk = await checkImage(globeImageUrl);
      if (!isPrimaryOk) {
        setGlobeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg');
        setBumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png');
      }
    };

    validateTextures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const geoUrls = [
      'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
      'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
      'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json' // This is TopoJSON, but we'll try it as a last resort if we add TopoJSON support, or just stick to GeoJSON for now
    ];

    const loadGeoData = async (index = 0) => {
      if (index >= geoUrls.length) {
        console.error('🌐 Globe Debug: All GeoJSON sources failed. The globe will render without country outlines.');
        // Fallback to empty features so the app doesn't crash
        setCountries({ features: [] });
        return;
      }

      const currentUrl = geoUrls[index];
      console.log(`🌐 Globe Debug: Attempting to load countries from source ${index + 1}/${geoUrls.length}: ${currentUrl}`);

      try {
        const res = await fetch(currentUrl, {
          mode: 'cors',
          credentials: 'omit'
        });

        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        
        // Handle TopoJSON if it's the world-atlas source
        let geoData = data;
        if (data.type === 'Topology') {
          // If we ever use TopoJSON, we'd need topojson-client here.
          // For now, we'll just throw an error if it's not GeoJSON.
          throw new Error('Received TopoJSON instead of GeoJSON');
        }

        if (!geoData || !geoData.features) {
          throw new Error('Invalid GeoJSON format received (missing features array)');
        }

        setCountries(geoData);
        console.log(`✅ Globe Debug: Successfully loaded countries from source ${index + 1}`);
      } catch (err) {
        console.warn(`⚠️ Globe Debug: Source ${index + 1} failed. Error:`, err);
        // Small delay before trying next source to avoid rapid-fire failures
        setTimeout(() => loadGeoData(index + 1), 200);
      }
    };

    loadGeoData();

    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (globeRef.current && selectedLocation) {
      // Professional cinematic zoom-in to the country
      globeRef.current.pointOfView({
        lat: selectedLocation[0],
        lng: selectedLocation[1],
        altitude: 0.7 // Slightly closer to see city marker clearly
      }, 1500);
    } else if (globeRef.current && !selectedLocation) {
      globeRef.current.pointOfView({ altitude: 2.5 }, 2000);
    }
  }, [selectedLocation]);

  // Data for the city marker
  const markerData = selectedLocation ? [{
    lat: selectedLocation[0],
    lng: selectedLocation[1],
    label: serverInfo?.city || ''
  }] : [];

  return (
    <div className="fixed inset-0 z-0 pointer-events-auto">
      <ReactGlobe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        
        // Realistic Planet Textures
        globeImageUrl={globeImageUrl}
        bumpImageUrl={bumpImageUrl}
        
        // Atmosphere styling
        showAtmosphere={true}
        atmosphereColor="#10b981"
        atmosphereAltitude={0.15}

        // Country Polygons (Outlines)
        polygonsData={countries.features}
        polygonCapColor={(d: any) => 
          d.properties.ISO_A2.toLowerCase() === selectedCountryId?.toLowerCase() 
            ? 'rgba(16, 185, 129, 0.12)' 
            : 'rgba(0, 0, 0, 0)'
        }
        polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
        polygonStrokeColor={(d: any) => 
          d.properties.ISO_A2.toLowerCase() === selectedCountryId?.toLowerCase() 
            ? '#10b981' 
            : 'rgba(255, 255, 255, 0.05)'
        }
        
        // City Markers
        htmlElementsData={markerData}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          el.innerHTML = `
            <div class="city-marker-container">
              <div class="marker-pulse"></div>
              <div class="marker-core"></div>
              <div class="marker-label">
                <div class="label-content">
                  <span class="flag-icon">${serverInfo?.flag || ''}</span>
                  <div class="label-text">
                    <span class="status-text">Active Node</span>
                    <span class="city-text">${d.label}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
          
          const style = document.createElement('style');
          style.innerHTML = `
            .city-marker-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              position: relative;
            }
            .marker-core {
              width: 10px;
              height: 10px;
              background: #10b981;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 20px #10b981;
              z-index: 2;
            }
            .marker-pulse {
              position: absolute;
              width: 24px;
              height: 24px;
              background: rgba(16, 185, 129, 0.3);
              border-radius: 50%;
              animation: pulse 2s ease-out infinite;
              z-index: 1;
            }
            .marker-label {
              position: absolute;
              left: 20px;
              top: -10px;
              background: rgba(255, 255, 255, 0.05);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.1);
              padding: 6px 12px;
              border-radius: 14px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.5);
              pointer-events: none;
            }
            .label-content {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .flag-icon {
              font-size: 18px;
            }
            .label-text {
              display: flex;
              flex-direction: column;
            }
            .status-text {
              color: #10b981;
              font-size: 8px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              line-height: 1;
              margin-bottom: 2px;
            }
            .city-text {
              color: white;
              font-size: 12px;
              font-weight: bold;
              white-space: nowrap;
              line-height: 1;
            }
            @keyframes pulse {
              0% { transform: scale(0.5); opacity: 1; }
              100% { transform: scale(3); opacity: 0; }
            }
          `;
          el.appendChild(style);
          return el;
        }}
        
        onGlobeReady={() => {
          if (globeRef.current) {
            globeRef.current.controls().autoRotate = false;
            globeRef.current.controls().enableZoom = true;
            globeRef.current.controls().enablePan = false;
            globeRef.current.controls().minDistance = 150;
            globeRef.current.controls().maxDistance = 600;
          }
        }}
      />
      
      {/* Vignette for better UI contrast */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.4)_100%)]" />
    </div>
  );
}
