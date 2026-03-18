'use client';

import { Suspense, lazy, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { resolveFlagMeta } from '@/lib/flags';

const ReactGlobe = lazy(() => import('react-globe.gl'));
const HOVER_HIDE_DELAY_MS = 72;
const MAX_RENDERER_PIXEL_RATIO = 1.2;
const GLOBE_RENDERER_CONFIG = {
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance',
} as const;

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
  flagClassName: string;
}

type GlobeCountryFeature = {
  properties?: Record<string, any> & {
    __countryCode?: string;
    __countryName?: string;
    __flagClassName?: string;
    __isSelected?: boolean;
  };
};

const getCountryName = (properties: Record<string, any>) =>
  properties.NAME || properties.ADMIN || properties.name || 'Country';

const getCountryMeta = (properties: Record<string, any>) => {
  const name = getCountryName(properties);
  const { code, className } = resolveFlagMeta({
    code: properties.ISO_A2 || properties['ISO3166-1-Alpha-2'],
    postalCode: properties.POSTAL,
    countryName: name,
  });

  return {
    code: code || '',
    name,
    flagClassName: className,
  };
};

const Starfield = memo(({ isVisible }: { isVisible: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stars: { x: number; y: number; size: number; opacity: number; speed: number }[] = [];
    const starCount = Math.floor((w * h) / (prefersReducedMotion ? 14000 : 12000));

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

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(draw);
      }
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
  type InteractionMode = 'idle' | 'hover' | 'dragging' | 'transitioning';

  const globeRef = useRef<any>(null);
  const hoverLabelRef = useRef<HTMLDivElement>(null);
  const pointerPositionRef = useRef({ x: -9999, y: -9999 });
  const hoverClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsCleanupRef = useRef<(() => void) | null>(null);
  const hoverLabelFrameRef = useRef<number | null>(null);
  const hoveredCountryRef = useRef<HoveredCountry | null>(null);
  const isCameraTransitioningRef = useRef(false);
  const isDraggingRef = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [countries, setCountries] = useState<GlobeCountryFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<HoveredCountry | null>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('idle');

  const syncInteractionMode = useCallback((nextMode: InteractionMode) => {
    setInteractionMode((currentMode) => (currentMode === nextMode ? currentMode : nextMode));
  }, []);

  const syncHoveredCountry = useCallback((nextCountry: HoveredCountry | null) => {
    const currentCountry = hoveredCountryRef.current;

    if (
      currentCountry?.code === nextCountry?.code &&
      currentCountry?.name === nextCountry?.name
    ) {
      return;
    }

    hoveredCountryRef.current = nextCountry;
    setHoveredCountry(nextCountry);

    if (nextCountry) {
      if (!isCameraTransitioningRef.current && !isDraggingRef.current) {
        syncInteractionMode('hover');
      }
      return;
    }

    if (!isCameraTransitioningRef.current && !isDraggingRef.current) {
      syncInteractionMode('idle');
    }
  }, [syncInteractionMode]);

  const flushHoverLabelPosition = useCallback(() => {
    hoverLabelFrameRef.current = null;

    if (!hoverLabelRef.current || !hoveredCountryRef.current) {
      return;
    }

    hoverLabelRef.current.style.transform = `translate3d(${pointerPositionRef.current.x}px, ${pointerPositionRef.current.y}px, 0)`;
  }, []);

  const scheduleHoverLabelPosition = useCallback(() => {
    if (hoverLabelFrameRef.current !== null) {
      return;
    }

    hoverLabelFrameRef.current = window.requestAnimationFrame(flushHoverLabelPosition);
  }, [flushHoverLabelPosition]);

  const clearHoveredCountry = useCallback(() => {
    if (hoverClearTimeoutRef.current) {
      clearTimeout(hoverClearTimeoutRef.current);
      hoverClearTimeoutRef.current = null;
    }

    syncHoveredCountry(null);
  }, [syncHoveredCountry]);

  const scheduleHoveredCountryClear = useCallback(() => {
    if (hoverClearTimeoutRef.current) {
      return;
    }

    hoverClearTimeoutRef.current = setTimeout(() => {
      hoverClearTimeoutRef.current = null;
      syncHoveredCountry(null);
    }, HOVER_HIDE_DELAY_MS);
  }, [syncHoveredCountry]);

  const scheduleCameraTransitionEnd = useCallback((duration: number) => {
    if (cameraTransitionTimeoutRef.current) {
      clearTimeout(cameraTransitionTimeoutRef.current);
    }

    isCameraTransitioningRef.current = true;
    syncInteractionMode('transitioning');
    cameraTransitionTimeoutRef.current = setTimeout(() => {
      isCameraTransitioningRef.current = false;
      cameraTransitionTimeoutRef.current = null;

      if (isDraggingRef.current) {
        syncInteractionMode('dragging');
        return;
      }

      syncInteractionMode(hoveredCountryRef.current ? 'hover' : 'idle');
    }, duration + 80);
  }, [syncInteractionMode]);

  const moveCamera = useCallback(
    (location: [number, number] | null) => {
      if (!globeRef.current) {
        return;
      }

      const duration = location ? 1220 : 1480;

      clearHoveredCountry();
      scheduleCameraTransitionEnd(duration);

      if (location) {
        globeRef.current.pointOfView(
          {
            lat: location[0],
            lng: location[1],
            altitude: 0.74,
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
    let resizeFrameId: number | null = null;

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
      if (resizeFrameId !== null) {
        return;
      }

      resizeFrameId = window.requestAnimationFrame(() => {
        resizeFrameId = null;
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      });
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
      if (hoverLabelFrameRef.current !== null) {
        window.cancelAnimationFrame(hoverLabelFrameRef.current);
        hoverLabelFrameRef.current = null;
      }
      if (resizeFrameId !== null) {
        window.cancelAnimationFrame(resizeFrameId);
      }
      controlsCleanupRef.current?.();
      controlsCleanupRef.current = null;
      window.removeEventListener('resize', handleResize);
    };
  }, [clearHoveredCountry]);

  useLayoutEffect(() => {
    moveCamera(selectedLocation ?? null);
  }, [focusToken, moveCamera, selectedLocation]);

  useLayoutEffect(() => {
    clearHoveredCountry();
  }, [clearHoveredCountry, selectedCountryId]);

  useEffect(() => {
    if (!hoveredCountry || !hoverLabelRef.current) {
      return;
    }

    scheduleHoverLabelPosition();
  }, [hoveredCountry, scheduleHoverLabelPosition]);

  const selectedCountryCode = selectedCountryId?.toLowerCase() ?? null;
  const hoveredCountryCode = hoveredCountry?.code.toLowerCase() ?? null;
  const hoveredFlagClassName = hoveredCountry?.flagClassName ?? '';
  const selectedServerFlagMeta = useMemo(
    () =>
      resolveFlagMeta({
        code: serverInfo?.flagCode ?? selectedCountryId ?? null,
        countryName: serverInfo?.country ?? null,
      }),
    [selectedCountryId, serverInfo?.country, serverInfo?.flagCode]
  );

  const countryPolygons = useMemo(
    () =>
      countries.map((feature: GlobeCountryFeature) => {
        const countryMeta = getCountryMeta(feature.properties || {});
        const countryCode = countryMeta.code.toLowerCase();
        const isSelected = countryCode === selectedCountryCode;

        return {
          ...feature,
          properties: {
            ...(feature.properties || {}),
            __countryCode: countryCode,
            __countryName: countryMeta.name,
            __flagClassName: countryMeta.flagClassName,
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
              id: `${selectedServerFlagMeta.code || 'node'}-${focusToken}`,
              lat: selectedLocation[0],
              lng: selectedLocation[1],
              city: serverInfo?.city || '',
              country: serverInfo?.country || '',
              flagClassName: selectedServerFlagMeta.className,
            },
          ]
        : [],
    [focusToken, selectedLocation, selectedServerFlagMeta.className, selectedServerFlagMeta.code, serverInfo?.city, serverInfo?.country]
  );

  const markerThemeClassName = theme === 'light' ? 'is-light' : 'is-dark';

  const renderMarkerElement = useCallback(
    (d: any) => {
      const el = document.createElement('div');
      el.className = 'signal-node';
      el.dataset.markerId = d.id;
      el.innerHTML = `
        <div class="signal-node__pulse"></div>
        <div class="signal-node__pulse signal-node__pulse--delayed"></div>
        <div class="signal-node__halo"></div>
        <div class="signal-node__core"></div>
        <div class="signal-node__label ${markerThemeClassName}">
          ${d.flagClassName ? `<span class="signal-node__flag-icon ${d.flagClassName}"></span>` : ''}
          <div class="signal-node__copy">
            <span class="signal-node__eyebrow">Active Node</span>
            <span class="signal-node__city">${d.city}</span>
            <span class="signal-node__country">${d.country}</span>
          </div>
        </div>
      `;
      return el;
    },
    [markerThemeClassName]
  );

  const moveHoverLabel = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    pointerPositionRef.current = {
      x: event.clientX + 18,
      y: event.clientY - 22,
    };

    if (!hoverLabelRef.current || !hoveredCountryRef.current) {
      return;
    }

    scheduleHoverLabelPosition();
  }, [scheduleHoverLabelPosition]);

  const handlePolygonHover = useCallback(
    (polygon: any, prevPolygon: any) => {
      if (polygon === prevPolygon) {
        return;
      }

      if (isCameraTransitioningRef.current || isDraggingRef.current) {
        scheduleHoveredCountryClear();
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

      const countryMeta = getCountryMeta(polygon.properties);
      const code = polygon.properties.__countryCode ?? countryMeta.code;
      const name = polygon.properties.__countryName ?? countryMeta.name;
      const flagClassName = polygon.properties.__flagClassName ?? countryMeta.flagClassName;
      const currentCountry = hoveredCountryRef.current;

      if (currentCountry?.code === code && currentCountry?.name === name) {
        return;
      }

      syncHoveredCountry({
        code,
        name,
        flagClassName,
      });
    },
    [scheduleHoveredCountryClear, syncHoveredCountry]
  );

  const polygonCapColor = useCallback(
    (polygon: GlobeCountryFeature) => {
      const isSelected = polygon.properties?.__isSelected;
      const isHovered = (polygon.properties?.__countryCode ?? '') === hoveredCountryCode;

      if (isSelected) {
        return theme === 'light' ? 'rgba(45, 156, 219, 0.16)' : 'rgba(110, 231, 183, 0.14)';
      }

      if (isHovered) {
        return theme === 'light' ? 'rgba(45, 156, 219, 0.07)' : 'rgba(233, 255, 248, 0.05)';
      }

      return 'rgba(0,0,0,0)';
    },
    [theme]
  );

  const polygonStrokeColor = useCallback(
    (polygon: GlobeCountryFeature) => {
      if (polygon.properties?.__isSelected) {
        return theme === 'light' ? '#1b6c99' : '#c8fff0';
      }

      if ((polygon.properties?.__countryCode ?? '') === hoveredCountryCode) {
        return theme === 'light' ? '#2d9cdb' : '#f2fff9';
      }

      return theme === 'light' ? 'rgba(27,108,153,0.24)' : 'rgba(214,228,245,0.18)';
    },
    [hoveredCountryCode, theme]
  );

  const polygonSideColor = useCallback(
    (polygon: GlobeCountryFeature) => {
      if (polygon.properties?.__isSelected) {
        return theme === 'light' ? 'rgba(45, 156, 219, 0.12)' : 'rgba(110, 231, 183, 0.11)';
      }

      if ((polygon.properties?.__countryCode ?? '') === hoveredCountryCode) {
        return theme === 'light' ? 'rgba(45, 156, 219, 0.06)' : 'rgba(239, 248, 255, 0.05)';
      }

      return 'rgba(0,0,0,0)';
    },
    [hoveredCountryCode, theme]
  );

  const polygonAltitude = useCallback(
    (polygon: GlobeCountryFeature) => {
      if (polygon.properties?.__isSelected) {
        return 0.012;
      }

      if ((polygon.properties?.__countryCode ?? '') === hoveredCountryCode) {
        return 0.0045;
      }

      return 0.001;
    },
    [hoveredCountryCode]
  );

  const handleGlobeReady = useCallback(() => {
    if (!globeRef.current) {
      return;
    }

    const controls = globeRef.current.controls();
    const renderer = globeRef.current.renderer?.();
    controls.autoRotate = false;
    controls.enableRotate = true;
    controls.rotateSpeed = 0.68;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.82;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.085;
    controls.minDistance = 180;
    controls.maxDistance = 560;

    if (renderer) {
      renderer.setPixelRatio(Math.min(MAX_RENDERER_PIXEL_RATIO, window.devicePixelRatio || 1));
    }

    const handleStart = () => {
      isDraggingRef.current = true;
      syncInteractionMode('dragging');
      clearHoveredCountry();
    };

    const handleEnd = () => {
      requestAnimationFrame(() => {
        isDraggingRef.current = false;
        syncInteractionMode(isCameraTransitioningRef.current ? 'transitioning' : hoveredCountryRef.current ? 'hover' : 'idle');
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
  }, [clearHoveredCountry, moveCamera, selectedLocation, syncInteractionMode, theme]);

  const globeCursorClassName =
    interactionMode === 'dragging'
      ? 'cursor-grabbing'
      : hoveredCountry
        ? 'cursor-pointer'
        : 'cursor-grab';

  return (
    <div
      className={`fixed inset-0 z-0 overflow-hidden pointer-events-auto select-none ${globeCursorClassName}`}
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
          <div className="pointer-events-none absolute left-[15%] top-[20%] h-[18rem] w-[32rem] rounded-full bg-white/20 blur-[120px] animate-[atmosphereFloat_24s_ease-in-out_infinite]" />
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
          <div className="pointer-events-none absolute right-[-5%] bottom-[-10%] h-[35rem] w-[35rem] rounded-full bg-purple-500/5 blur-[140px] animate-[atmosphereFloat_28s_ease-in-out_infinite]" />
          
          {/* Cosmic Dust */}
          <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_80%,rgba(124,58,237,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
        </>
      )}

      <Suspense fallback={globeFallback}>
        <ReactGlobe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          rendererConfig={GLOBE_RENDERER_CONFIG}
          backgroundColor="rgba(0,0,0,0)"
          animateIn={false}
          globeImageUrl={theme === 'light' ? '/globe/earth-blue-marble.jpg' : '/globe/earth-night.jpg'}
          bumpImageUrl="/globe/earth-topology.png"
          showAtmosphere
          atmosphereColor={theme === 'light' ? 'rgba(125, 211, 252, 0.45)' : '#84a9ff'}
          atmosphereAltitude={theme === 'light' ? 0.065 : 0.11}
          polygonsData={countryPolygons}
          polygonCapColor={polygonCapColor}
          polygonSideColor={polygonSideColor}
          polygonStrokeColor={polygonStrokeColor}
          polygonAltitude={polygonAltitude}
          polygonCapCurvatureResolution={6}
          polygonsTransitionDuration={0}
          htmlElementsData={markerData}
          htmlTransitionDuration={0}
          htmlElement={renderMarkerElement}
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
            {hoveredFlagClassName ? <span className={`country-hover-pill__flag-icon ${hoveredFlagClassName}`} /> : null}
            <span className="country-hover-pill__name">{hoveredCountry.name}</span>
          </div>
        </div>
      ) : null}
    </div>

  );
}

export default memo(Globe);
