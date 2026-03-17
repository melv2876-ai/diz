'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const ReactGlobe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--page-bg)] text-xs font-mono text-[var(--text-3)]">
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

      return theme === 'light' ? 'rgba(45, 156, 219, 0.1)' : 'rgba(190, 242, 230, 0.075)';
    },
    [theme]
  );

  const polygonStrokeColor = useCallback(
    (polygon: GlobeCountryFeature) => {
      const countryCode = polygon.properties?.__countryCode ?? '';

      if (polygon.properties?.__isSelected) {
        return theme === 'light' ? '#1b6c99' : '#c8fff0';
      }

      if (countryCode === hoveredCountryCode) {
        return theme === 'light' ? '#2d9cdb' : '#e9fff8';
      }

      return theme === 'light' ? 'rgba(27,108,153,0.18)' : 'rgba(214,228,245,0.14)';
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
    controls.enableRotate = true;
    controls.rotateSpeed = 0.8;
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

    // Fine-tune lighting for depth
    const scene = globeRef.current.scene();
    if (scene) {
      const ambientLight = scene.children.find((c: any) => c.type === 'AmbientLight');
      const dirLight = scene.children.find((c: any) => c.type === 'DirectionalLight');
      
      if (ambientLight) {
        ambientLight.intensity = theme === 'light' ? 0.58 : 0.4;
      }
      
      if (dirLight) {
        dirLight.intensity = theme === 'light' ? 1.6 : 2;
        dirLight.position.set(-1.35, 1.18, 1.14);
      }
    }

    controlsCleanupRef.current?.();
    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);
    controlsCleanupRef.current = () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
    };

    moveCamera(selectedLocation ?? null);
  }, [clearHoveredCountry, moveCamera, selectedLocation, theme]);

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-auto"
      onMouseMove={moveHoverLabel}
      onMouseLeave={() => {
        clearHoveredCountry();
      }}
    >
      {/* Background Overlays - Centralized base layer */}
      {theme === 'light' ? (
        <>
          {/* Daylight atmosphere */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 14% 10%, rgba(255, 247, 230, 0.72) 0%, rgba(255, 247, 230, 0.32) 14%, rgba(255, 247, 230, 0) 34%),
                radial-gradient(circle at 60% 45%, rgba(113, 181, 226, 0.16) 0%, rgba(113, 181, 226, 0.08) 18%, rgba(255, 255, 255, 0) 38%),
                linear-gradient(180deg, #ebf3f9 0%, #d9e6f0 36%, #adc3d5 72%, #8aa5bb 100%)
              `,
            }}
          />

          {/* Left-side readability veil */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[36%] bg-[linear-gradient(90deg,rgba(244,249,253,0.92)_0%,rgba(236,244,249,0.68)_42%,rgba(217,229,238,0.12)_82%,transparent_100%)]" />

          {/* Globe halo */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_58%_48%,rgba(97,174,223,0.18)_0%,rgba(97,174,223,0.06)_22%,rgba(255,255,255,0)_48%)]" />

          {/* Daylight structure */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[34vh] bg-[linear-gradient(180deg,rgba(235,244,250,0.64)_0%,rgba(228,238,246,0.24)_58%,transparent_100%)]" />
          <div className="pointer-events-none absolute -left-[12%] -top-[10%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,247,233,0.42)_0%,rgba(238,247,253,0.18)_42%,transparent_74%)] blur-[96px] animate-[daylightDrift_24s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute left-[38%] top-[12%] h-[24rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(180,211,233,0.24)_0%,rgba(180,211,233,0.08)_40%,transparent_72%)] blur-[84px]" />
          <div className="pointer-events-none absolute right-[-14%] bottom-[-12%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(94,133,169,0.22)_0%,rgba(161,190,215,0.12)_38%,transparent_74%)] blur-[92px]" />

          {/* Bottom depth band */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] bg-[linear-gradient(180deg,rgba(224,234,242,0)_0%,rgba(170,190,208,0.12)_30%,rgba(97,123,149,0.28)_100%)]" />

          {/* Orbit accents */}
          <div className="pointer-events-none absolute right-[-6%] top-[12%] h-[26rem] w-[26rem] rounded-full border border-[rgba(45,156,219,0.14)] opacity-60 [mask-image:linear-gradient(180deg,black,transparent)]" />

          {/* Vignette */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_220px_rgba(19,39,61,0.12)]" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_46%,rgba(136,174,255,0.11)_0%,rgba(7,10,18,0)_26%,rgba(2,6,23,0.28)_54%,rgba(1,3,8,0.62)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.04)_0%,rgba(3,7,18,0.0)_32%,rgba(2,6,12,0.42)_100%)]" />
        </>
      )}

      <ReactGlobe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        animateIn={false}
        globeImageUrl={theme === 'light' ? '/globe/earth-blue-marble.jpg' : '/globe/earth-night.jpg'}
        bumpImageUrl="/globe/earth-topology.png"
        showAtmosphere
        atmosphereColor={theme === 'light' ? 'rgba(116, 183, 224, 0.4)' : '#84a9ff'}
        atmosphereAltitude={theme === 'light' ? 0.055 : 0.11}
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
    </div>

  );
}

export default memo(Globe);
