'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const ReactGlobe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050505] text-xs font-mono text-emerald-500/50">
      Инициализация глобальной сети...
    </div>
  ),
});

interface GlobeProps {
  selectedCountryId?: string | null;
  selectedLocation?: [number, number] | null;
  serverInfo?: { city: string; country: string; flag: string } | null;
  theme?: 'dark' | 'light';
  focusToken?: number;
}

interface HoveredCountry {
  code: string;
  name: string;
  flag: string;
}

type GlobeCountryFeature = {
  properties?: Record<string, any> & {
    __countryCode?: string;
    __isSelected?: boolean;
  };
};

const getCountryCode = (properties: Record<string, any>) =>
  properties.ISO_A2 || properties['ISO3166-1-Alpha-2'] || properties.POSTAL || '';

const getCountryName = (properties: Record<string, any>) =>
  properties.NAME || properties.ADMIN || properties.name || 'Country';

const countryCodeToFlag = (code?: string) => {
  if (!code || code.length !== 2) return '';

  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0))
  );
};

function Globe({
  selectedCountryId,
  selectedLocation,
  serverInfo,
  theme = 'dark',
  focusToken = 0,
}: GlobeProps) {
  const globeRef = useRef<any>(null);
  const hoverLabelRef = useRef<HTMLDivElement>(null);
  const pointerPositionRef = useRef({ x: -9999, y: -9999 });
  const hoverClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsCleanupRef = useRef<(() => void) | null>(null);
  const isCameraTransitioningRef = useRef(false);
  const isDraggingRef = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [countries, setCountries] = useState<GlobeCountryFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<HoveredCountry | null>(null);

  const clearHoveredCountry = useCallback(() => {
    if (hoverClearTimeoutRef.current) {
      clearTimeout(hoverClearTimeoutRef.current);
      hoverClearTimeoutRef.current = null;
    }

    setHoveredCountry(null);
  }, []);

  const scheduleHoveredCountryClear = useCallback(() => {
    if (hoverClearTimeoutRef.current) {
      return;
    }

    hoverClearTimeoutRef.current = setTimeout(() => {
      setHoveredCountry(null);
      hoverClearTimeoutRef.current = null;
    }, 24);
  }, []);

  const scheduleCameraTransitionEnd = useCallback((duration: number) => {
    if (cameraTransitionTimeoutRef.current) {
      clearTimeout(cameraTransitionTimeoutRef.current);
    }

    isCameraTransitioningRef.current = true;
    cameraTransitionTimeoutRef.current = setTimeout(() => {
      isCameraTransitioningRef.current = false;
      cameraTransitionTimeoutRef.current = null;
    }, duration + 80);
  }, []);

  const moveCamera = useCallback(
    (location: [number, number] | null) => {
      if (!globeRef.current) {
        return;
      }

      const duration = location ? 1400 : 1800;

      clearHoveredCountry();
      scheduleCameraTransitionEnd(duration);

      if (location) {
        globeRef.current.pointOfView(
          {
            lat: location[0],
            lng: location[1],
            altitude: 0.72,
          },
          duration
        );
        return;
      }

      globeRef.current.pointOfView({ altitude: 2.2 }, duration);
    },
    [clearHoveredCountry, scheduleCameraTransitionEnd]
  );

  useEffect(() => {
    let isCancelled = false;

    const loadCountries = async () => {
      try {
        const res = await fetch('/globe/countries.geojson', { cache: 'force-cache' });
        const data = await res.json();

        if (!isCancelled) {
          setCountries(data?.features || []);
        }
      } catch {
        if (!isCancelled) {
          setCountries([]);
        }
      }
    };

    loadCountries();

    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      isCancelled = true;
      clearHoveredCountry();
      if (cameraTransitionTimeoutRef.current) {
        clearTimeout(cameraTransitionTimeoutRef.current);
        cameraTransitionTimeoutRef.current = null;
      }
      controlsCleanupRef.current?.();
      controlsCleanupRef.current = null;
      window.removeEventListener('resize', handleResize);
    };
  }, [clearHoveredCountry]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      moveCamera(selectedLocation ?? null);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [focusToken, moveCamera, selectedLocation]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      clearHoveredCountry();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [clearHoveredCountry, selectedCountryId]);

  useEffect(() => {
    if (!hoveredCountry || !hoverLabelRef.current) {
      return;
    }

    hoverLabelRef.current.style.transform = `translate3d(${pointerPositionRef.current.x}px, ${pointerPositionRef.current.y}px, 0)`;
  }, [hoveredCountry]);

  const selectedCountryCode = selectedCountryId?.toLowerCase() ?? null;
  const hoveredCountryCode = hoveredCountry?.code.toLowerCase() ?? null;

  const countryPolygons = useMemo(
    () =>
      countries.map((feature: GlobeCountryFeature) => {
        const countryCode = getCountryCode(feature.properties || {}).toLowerCase();
        const isSelected = countryCode === selectedCountryCode;

        return {
          ...feature,
          properties: {
            ...(feature.properties || {}),
            __countryCode: countryCode,
            __isSelected: isSelected,
          },
        };
      }),
    [countries, selectedCountryCode]
  );

  const markerData = useMemo(
    () =>
      selectedLocation
        ? [
            {
              lat: selectedLocation[0],
              lng: selectedLocation[1],
              city: serverInfo?.city || '',
              country: serverInfo?.country || '',
              flag: serverInfo?.flag || '',
            },
          ]
        : [],
    [selectedLocation, serverInfo]
  );

  const moveHoverLabel = (event: React.MouseEvent<HTMLDivElement>) => {
    pointerPositionRef.current = {
      x: event.clientX + 18,
      y: event.clientY - 22,
    };

    if (!hoverLabelRef.current) {
      return;
    }

    hoverLabelRef.current.style.transform = `translate3d(${pointerPositionRef.current.x}px, ${pointerPositionRef.current.y}px, 0)`;
  };

  const handlePolygonHover = useCallback(
    (polygon: any, prevPolygon: any) => {
      if (polygon === prevPolygon) {
        return;
      }

      if (isCameraTransitioningRef.current || isDraggingRef.current) {
        clearHoveredCountry();
        return;
      }

      if (!polygon?.properties) {
        scheduleHoveredCountryClear();
        return;
      }

      if (hoverClearTimeoutRef.current) {
        clearTimeout(hoverClearTimeoutRef.current);
        hoverClearTimeoutRef.current = null;
      }

      const code = getCountryCode(polygon.properties);
      setHoveredCountry((current) => {
        if (current?.code === code) {
          return current;
        }

        return {
          code,
          name: getCountryName(polygon.properties),
          flag: countryCodeToFlag(code),
        };
      });
    },
    [clearHoveredCountry, scheduleHoveredCountryClear]
  );

  const polygonCapColor = useCallback(
    (polygon: GlobeCountryFeature) => {
      const isSelected = polygon.properties?.__isSelected;

      if (!isSelected) {
        return 'rgba(0,0,0,0)';
      }

      return theme === 'light' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(190, 242, 230, 0.075)';
    },
    [theme]
  );

  const polygonStrokeColor = useCallback(
    (polygon: GlobeCountryFeature) => {
      const countryCode = polygon.properties?.__countryCode ?? '';

      if (polygon.properties?.__isSelected) {
        return theme === 'light' ? '#059669' : '#c8fff0';
      }

      if (countryCode === hoveredCountryCode) {
        return theme === 'light' ? '#10b981' : '#e9fff8';
      }

      return theme === 'light' ? 'rgba(71,85,105,0.28)' : 'rgba(214,228,245,0.14)';
    },
    [hoveredCountryCode, theme]
  );

  const polygonAltitude = useCallback(
    (polygon: GlobeCountryFeature) =>
      polygon.properties?.__isSelected ? 0.008 : 0.001,
    []
  );

  const handleGlobeReady = useCallback(() => {
    if (!globeRef.current) {
      return;
    }

    const controls = globeRef.current.controls();
    controls.autoRotate = false;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 180;
    controls.maxDistance = 560;

    const handleStart = () => {
      isDraggingRef.current = true;
      clearHoveredCountry();
    };

    const handleEnd = () => {
      requestAnimationFrame(() => {
        isDraggingRef.current = false;
      });
    };

    controlsCleanupRef.current?.();
    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);
    controlsCleanupRef.current = () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
    };

    moveCamera(selectedLocation ?? null);
  }, [clearHoveredCountry, moveCamera, selectedLocation]);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-auto"
      onMouseMove={moveHoverLabel}
      onMouseLeave={() => {
        clearHoveredCountry();
      }}
    >
      <ReactGlobe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        animateIn={false}
        globeImageUrl="/globe/earth-night.jpg"
        bumpImageUrl="/globe/earth-topology.png"
        showAtmosphere
        atmosphereColor={theme === 'light' ? '#9db9ff' : '#84a9ff'}
        atmosphereAltitude={0.11}
        polygonsData={countryPolygons}
        polygonCapColor={polygonCapColor}
        polygonSideColor={() => 'rgba(0,0,0,0)'}
        polygonStrokeColor={polygonStrokeColor}
        polygonAltitude={polygonAltitude}
        polygonCapCurvatureResolution={8}
        polygonsTransitionDuration={0}
        htmlElementsData={markerData}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          el.className = 'signal-node';
          el.innerHTML = `
            <div class="signal-node__pulse"></div>
            <div class="signal-node__core"></div>
            <div class="signal-node__label ${theme === 'light' ? 'is-light' : 'is-dark'}">
              ${d.flag ? `<span class="signal-node__flag">${d.flag}</span>` : ''}
              <div class="signal-node__copy">
                <span class="signal-node__eyebrow">Active Node</span>
                <span class="signal-node__city">${d.city}</span>
                <span class="signal-node__country">${d.country}</span>
              </div>
            </div>
          `;
          return el;
        }}
        onPolygonHover={handlePolygonHover}
        onGlobeReady={handleGlobeReady}
      />

      {hoveredCountry ? (
        <div
          ref={hoverLabelRef}
          className="pointer-events-none fixed left-0 top-0 z-[60]"
          style={{ transform: 'translate3d(-9999px,-9999px,0)' }}
        >
          <div className={`country-hover-pill ${theme === 'light' ? 'is-light' : 'is-dark'}`}>
            {hoveredCountry.flag ? (
              <span className="country-hover-pill__flag">{hoveredCountry.flag}</span>
            ) : null}
            <span className="country-hover-pill__name">{hoveredCountry.name}</span>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_46%,rgba(136,174,255,0.11)_0%,rgba(7,10,18,0)_26%,rgba(2,6,23,0.28)_54%,rgba(1,3,8,0.62)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.04)_0%,rgba(3,7,18,0.0)_32%,rgba(2,6,12,0.42)_100%)]" />
    </div>
  );
}

export default memo(Globe);
