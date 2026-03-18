'use client';

import { Suspense, lazy, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const ReactGlobe = lazy(() => import('react-globe.gl'));
const globeFallback = (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--page-bg)] text-xs font-mono text-[var(--text-3)]">
      Инициализация глобальной сети...
    </div>
);

interface GlobeProps {
  selectedCountryId?: string | null;
  selectedLocation?: [number, number] | null;
  serverInfo?: { city: string; country: string; flagCode: string } | null;
  theme?: 'dark' | 'light';
  focusToken?: number;
}

interface HoveredCountry {
  code: string;
  name: string;
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

const getFlagImageUrl = (code?: string, width = 40) =>
  code && code.length === 2 ? `https://flagcdn.com/w${width}/${code.toLowerCase()}.png` : '';

const Starfield = memo(({ isVisible }: { isVisible: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const stars: { x: number; y: number; size: number; opacity: number; speed: number }[] = [];
    const starCount = Math.floor((w * h) / 4000);

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.5,
        opacity: Math.random(),
        speed: 0.005 + Math.random() * 0.015,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#fff';

      stars.forEach((star) => {
        star.opacity += star.speed;
        if (star.opacity > 1 || star.opacity < 0) {
          star.speed = -star.speed;
        }

        ctx.globalAlpha = star.opacity * 0.8;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
});

Starfield.displayName = 'Starfield';


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
              flagCode: serverInfo?.flagCode || '',
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
        ambientLight.intensity = theme === 'light' ? 0.75 : 0.4;
      }
      
      if (dirLight) {
        dirLight.intensity = theme === 'light' ? 1.8 : 2;
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
      {/* Dynamic Starfield for Night Theme */}
      <Starfield isVisible={theme === 'dark'} />

      {/* Background Overlays - Centralized base layer */}
      {theme === 'light' ? (
        <>
          {/* Vibrant Daylight atmosphere */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
            style={{
              background: `
                radial-gradient(circle at 14% 10%, rgba(255, 247, 230, 0.72) 0%, rgba(255, 247, 230, 0.32) 14%, rgba(255, 247, 230, 0) 34%),
                radial-gradient(circle at 60% 45%, rgba(135, 206, 235, 0.22) 0%, rgba(135, 206, 235, 0.08) 22%, rgba(255, 255, 255, 0) 45%),
                linear-gradient(180deg, #bae6fd 0%, #e0f2fe 38%, #f8fafc 100%)
              `,
            }}
          />

          {/* Sun Glow Overlay */}
          <div className="pointer-events-none absolute left-0 top-0 h-[50vh] w-[50vw] bg-[radial-gradient(circle_at_0%_0%,rgba(255,251,235,0.4)_0%,transparent_70%)] blur-[100px] animate-[daylightDrift_30s_ease-in-out_infinite]" />

          {/* Left-side readability veil */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[42%] bg-[linear-gradient(90deg,rgba(240,249,255,0.96)_0%,rgba(240,249,255,0.72)_48%,rgba(240,249,255,0.12)_86%,transparent_100%)]" />

          {/* Globe halo enhancement */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_58%_48%,rgba(135,206,235,0.22)_0%,rgba(135,206,235,0.08)_28%,rgba(255,255,255,0)_52%)]" />

          {/* Soft cloud-like glows */}
          <div className="pointer-events-none absolute left-[15%] top-[20%] h-[18rem] w-[32rem] rounded-full bg-white/20 blur-[120px] animate-pulse" />
          <div className="pointer-events-none absolute right-[10%] bottom-[15%] h-[24rem] w-[40rem] rounded-full bg-sky-200/20 blur-[140px] animate-[atmospherePulse_22s_ease-in-out_infinite]" />

          {/* Bottom depth band */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] bg-[linear-gradient(180deg,rgba(224,242,254,0)_0%,rgba(186,230,253,0.15)_35%,rgba(125,211,252,0.35)_100%)]" />

          {/* Orbit accents */}
          <div className="pointer-events-none absolute right-[-6%] top-[12%] h-[26rem] w-[26rem] rounded-full border border-[rgba(45,156,219,0.14)] opacity-60 [mask-image:linear-gradient(180deg,black,transparent)]" />

          {/* Vignette */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_240px_rgba(30,58,88,0.08)]" />
        </>
      ) : (
        <>
          {/* Celestial Night atmosphere */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_46%,rgba(136,174,255,0.14)_0%,rgba(7,10,18,0)_32%,rgba(2,6,23,0.36)_62%,rgba(2,6,23,1)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.1)_0%,rgba(3,7,18,0.0)_40%,rgba(3,7,18,1)_100%)]" />
          
          {/* Deep Space Glows */}
          <div className="pointer-events-none absolute left-[-10%] top-[-5%] h-[40rem] w-[40rem] rounded-full bg-indigo-500/10 blur-[160px] animate-[atmospherePulse_25s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute right-[-5%] bottom-[-10%] h-[35rem] w-[35rem] rounded-full bg-purple-500/5 blur-[140px] animate-pulse" />
          
          {/* Cosmic Dust */}
          <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_80%,rgba(124,58,237,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
        </>
      )}

      <Suspense fallback={globeFallback}>
        <ReactGlobe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          animateIn={false}
          globeImageUrl={theme === 'light' ? '/globe/earth-blue-marble.jpg' : '/globe/earth-night.jpg'}
          bumpImageUrl="/globe/earth-topology.png"
          showAtmosphere
          atmosphereColor={theme === 'light' ? 'rgba(125, 211, 252, 0.45)' : '#84a9ff'}
          atmosphereAltitude={theme === 'light' ? 0.065 : 0.11}
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
                ${d.flagCode ? `<img class="signal-node__flag-image" src="${getFlagImageUrl(d.flagCode, 32)}" alt="" />` : ''}
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
      </Suspense>

      {hoveredCountry ? (
        <div
          ref={hoverLabelRef}
          className="pointer-events-none fixed left-0 top-0 z-[60]"
          style={{ transform: 'translate3d(-9999px,-9999px,0)' }}
        >
          <div className={`country-hover-pill ${theme === 'light' ? 'is-light' : 'is-dark'}`}>
            {hoveredCountry.code ? (
              <img
                className="country-hover-pill__flag-image"
                src={getFlagImageUrl(hoveredCountry.code, 32)}
                alt=""
                width={18}
                height={14}
                loading="lazy"
              />
            ) : null}
            <span className="country-hover-pill__name">{hoveredCountry.name}</span>
          </div>
        </div>
      ) : null}
    </div>

  );
}

export default memo(Globe);
