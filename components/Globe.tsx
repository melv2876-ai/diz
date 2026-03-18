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
  accentRgb?: string;
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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const rgbaFromRgb = (rgb: string, alpha: number) => `rgba(${rgb}, ${alpha})`;

type Star = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  phase: number;
  blur: number;
  drift: number;
  parallax: number;
  layer: 0 | 1 | 2;
  sparkle: number;
};

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  thickness: number;
  life: number;
  ttl: number;
};

const Starfield = memo(
  ({
    isVisible,
    intensity,
    accentRgb,
  }: {
    isVisible: boolean;
    intensity: number;
    accentRgb: string;
  }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intensityRef = useRef(intensity);
  const accentRgbRef = useRef(accentRgb);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    accentRgbRef.current = accentRgb;
  }, [accentRgb]);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = 1;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];

    const createStars = (
      count: number,
      layer: Star['layer'],
      options: {
        size: [number, number];
        opacity: [number, number];
        blur: [number, number];
        parallax: [number, number];
      }
    ) => {
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: options.size[0] + Math.random() * (options.size[1] - options.size[0]),
          opacity: options.opacity[0] + Math.random() * (options.opacity[1] - options.opacity[0]),
          twinkleSpeed: 0.55 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
          blur: options.blur[0] + Math.random() * (options.blur[1] - options.blur[0]),
          drift: 0.45 + Math.random() * 1.4,
          parallax: options.parallax[0] + Math.random() * (options.parallax[1] - options.parallax[0]),
          layer,
          sparkle: Math.random(),
        });
      }
    };

    const buildScene = () => {
      stars.length = 0;
      shootingStars.length = 0;

      const densityFactor = prefersReducedMotion ? 1.55 : 1;
      const area = width * height;

      createStars(Math.floor(area / (9000 * densityFactor)), 0, {
        size: [0.35, 0.95],
        opacity: [0.18, 0.52],
        blur: [0, 0.4],
        parallax: [0.7, 1.6],
      });
      createStars(Math.floor(area / (16000 * densityFactor)), 1, {
        size: [0.65, 1.45],
        opacity: [0.28, 0.74],
        blur: [0.3, 1.2],
        parallax: [1.1, 2.4],
      });
      createStars(Math.floor(area / (32000 * densityFactor)), 2, {
        size: [1.05, 2.4],
        opacity: [0.42, 0.92],
        blur: [0.8, 3.6],
        parallax: [1.8, 4.4],
      });
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildScene();
    };

    const spawnShootingStar = () => {
      const fromRight = Math.random() > 0.38;
      const directionX = fromRight ? -(0.88 + Math.random() * 0.2) : 0.88 + Math.random() * 0.2;
      const directionY = 0.32 + Math.random() * 0.16;
      const directionLength = Math.hypot(directionX, directionY) || 1;
      const speed = 10 + Math.random() * 7;

      shootingStars.push({
        x: fromRight ? width * (0.74 + Math.random() * 0.2) : width * (0.06 + Math.random() * 0.2),
        y: height * (0.06 + Math.random() * 0.24),
        vx: (directionX / directionLength) * speed,
        vy: (directionY / directionLength) * speed,
        length: 120 + Math.random() * 140 + intensityRef.current * 90,
        thickness: 1.15 + Math.random() * 1.35,
        life: 0,
        ttl: 28 + Math.random() * 20,
      });
    };

    const draw = () => {
      const time = performance.now() * 0.001;
      const currentIntensity = clamp(intensityRef.current, 0, 1);
      const currentAccent = accentRgbRef.current;
      const motionScale = prefersReducedMotion ? 0 : 1;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      stars.forEach((star) => {
        const layerVisibility =
          star.layer === 0
            ? 0.42 + currentIntensity * 0.62
            : star.layer === 1
              ? 0.58 + currentIntensity * 0.48
              : 0.78 + currentIntensity * 0.4;
        const twinkle = 0.58 + Math.sin(time * star.twinkleSpeed + star.phase) * 0.42;
        const x = star.x + Math.sin(time * 0.12 * star.drift + star.phase) * star.parallax * motionScale;
        const y = star.y + Math.cos(time * 0.08 * star.drift + star.phase) * star.parallax * 0.45 * motionScale;
        const alpha = clamp(star.opacity * twinkle * layerVisibility, 0.03, 1);

        if (alpha < 0.045) {
          return;
        }

        ctx.globalAlpha = alpha;
        ctx.shadowBlur = star.blur * (0.7 + currentIntensity * 0.7);
        ctx.shadowColor =
          star.layer === 2 && star.sparkle > 0.7
            ? rgbaFromRgb(currentAccent, 0.16 + currentIntensity * 0.18)
            : `rgba(255,255,255,${0.1 + currentIntensity * 0.18})`;
        ctx.fillStyle = 'rgba(248, 251, 255, 0.98)';
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();

        if (!prefersReducedMotion && star.layer === 2 && star.sparkle > 0.86 && twinkle > 0.9) {
          ctx.globalAlpha = alpha * 0.26;
          ctx.strokeStyle = rgbaFromRgb(currentAccent, 0.72);
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x - star.size * 2.2, y);
          ctx.lineTo(x + star.size * 2.2, y);
          ctx.moveTo(x, y - star.size * 2.2);
          ctx.lineTo(x, y + star.size * 2.2);
          ctx.stroke();
        }
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      if (!prefersReducedMotion && currentIntensity > 0.16 && shootingStars.length < 2) {
        const spawnChance = 0.00035 + currentIntensity * 0.00125;
        if (Math.random() < spawnChance) {
          spawnShootingStar();
        }
      }

      ctx.globalCompositeOperation = 'screen';
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.x += star.vx;
        star.y += star.vy;
        star.life += 1;

        const progress = star.life / star.ttl;
        if (
          progress >= 1 ||
          star.x < -star.length ||
          star.x > width + star.length ||
          star.y > height + star.length
        ) {
          shootingStars.splice(i, 1);
          continue;
        }

        const fadeIn = clamp(progress / 0.18, 0, 1);
        const fadeOut = clamp((1 - progress) / 0.34, 0, 1);
        const alpha = Math.min(fadeIn, fadeOut) * (0.4 + currentIntensity * 0.42);
        const directionLength = Math.hypot(star.vx, star.vy) || 1;
        const directionX = star.vx / directionLength;
        const directionY = star.vy / directionLength;
        const tailX = star.x - directionX * star.length;
        const tailY = star.y - directionY * star.length;
        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);

        gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
        gradient.addColorStop(0.26, rgbaFromRgb(currentAccent, alpha * 0.82));
        gradient.addColorStop(0.72, `rgba(255,255,255,${alpha * 0.1})`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.thickness;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 18;
        ctx.shadowColor = rgbaFromRgb(currentAccent, 0.24 + currentIntensity * 0.22);
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.shadowBlur = 28;
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.94})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.thickness * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      if (!prefersReducedMotion) {
        animationFrameId = window.requestAnimationFrame(draw);
      }
    };

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    draw();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 mix-blend-screen transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
  }
);

Starfield.displayName = 'Starfield';


function Globe({
  selectedCountryId,
  selectedLocation,
  serverInfo,
  theme = 'dark',
  focusToken = 0,
  accentRgb,
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
  const [viewAltitude, setViewAltitude] = useState(selectedLocation ? 0.74 : 2.2);
  const accentColorRgb = accentRgb ?? (theme === 'light' ? '45, 156, 219' : '132, 169, 255');
  const zoomOutProgress = useMemo(
    () => clamp((viewAltitude - 0.74) / 1.46, 0, 1),
    [viewAltitude]
  );
  const starfieldIntensity = theme === 'dark' ? 0.38 + zoomOutProgress * 0.62 : 0;
  const accentGlow = useCallback(
    (alpha: number) => rgbaFromRgb(accentColorRgb, alpha),
    [accentColorRgb]
  );

  const syncInteractionMode = useCallback((nextMode: InteractionMode) => {
    setInteractionMode((currentMode) => (currentMode === nextMode ? currentMode : nextMode));
  }, []);

  const syncViewAltitude = useCallback((nextAltitude: number | null | undefined) => {
    if (typeof nextAltitude !== 'number' || !Number.isFinite(nextAltitude)) {
      return;
    }

    const normalizedAltitude = clamp(nextAltitude, 0.72, 2.35);
    setViewAltitude((currentAltitude) =>
      Math.abs(currentAltitude - normalizedAltitude) < 0.015 ? currentAltitude : normalizedAltitude
    );
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
        syncViewAltitude(0.74);
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

      syncViewAltitude(2.2);
      globeRef.current.pointOfView({ altitude: 2.2 }, duration);
    },
    [clearHoveredCountry, scheduleCameraTransitionEnd, syncViewAltitude]
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
        return theme === 'light' ? accentGlow(0.16) : accentGlow(0.14);
      }

      if (isHovered) {
        return theme === 'light' ? accentGlow(0.07) : accentGlow(0.05);
      }

      return 'rgba(0,0,0,0)';
    },
    [accentGlow, hoveredCountryCode, theme]
  );

  const polygonStrokeColor = useCallback(
    (polygon: GlobeCountryFeature) => {
      if (polygon.properties?.__isSelected) {
        return theme === 'light' ? accentGlow(0.92) : accentGlow(0.92);
      }

      if ((polygon.properties?.__countryCode ?? '') === hoveredCountryCode) {
        return theme === 'light' ? accentGlow(0.76) : accentGlow(0.82);
      }

      return theme === 'light' ? 'rgba(27,108,153,0.24)' : 'rgba(214,228,245,0.18)';
    },
    [accentGlow, hoveredCountryCode, theme]
  );

  const polygonSideColor = useCallback(
    (polygon: GlobeCountryFeature) => {
      if (polygon.properties?.__isSelected) {
        return theme === 'light' ? accentGlow(0.12) : accentGlow(0.11);
      }

      if ((polygon.properties?.__countryCode ?? '') === hoveredCountryCode) {
        return theme === 'light' ? accentGlow(0.06) : accentGlow(0.05);
      }

      return 'rgba(0,0,0,0)';
    },
    [accentGlow, hoveredCountryCode, theme]
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

    const handleChange = () => {
      syncViewAltitude(globeRef.current?.pointOfView?.().altitude);
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
    controls.addEventListener('change', handleChange);
    controlsCleanupRef.current = () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
      controls.removeEventListener('change', handleChange);
    };

    handleChange();
    moveCamera(selectedLocation ?? null);
  }, [clearHoveredCountry, moveCamera, selectedLocation, syncInteractionMode, syncViewAltitude, theme]);

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
      {theme === 'light' ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
            style={{
              background: `
                radial-gradient(circle at 14% 10%, rgba(255, 247, 230, 0.72) 0%, rgba(255, 247, 230, 0.32) 14%, rgba(255, 247, 230, 0) 34%),
                radial-gradient(circle at 58% 48%, ${accentGlow(0.18)} 0%, ${accentGlow(0.08)} 24%, rgba(255, 255, 255, 0) 50%),
                linear-gradient(180deg, #bae6fd 0%, #e0f2fe 38%, #f8fafc 100%)
              `,
            }}
          />

          <div className="pointer-events-none absolute left-0 top-0 h-[50vh] w-[50vw] bg-[radial-gradient(circle_at_0%_0%,rgba(255,251,235,0.4)_0%,transparent_70%)] blur-[100px] animate-[daylightDrift_30s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[42%] bg-[linear-gradient(90deg,rgba(240,249,255,0.96)_0%,rgba(240,249,255,0.72)_48%,rgba(240,249,255,0.12)_86%,transparent_100%)]" />
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle at 58% 48%, ${accentGlow(0.2)} 0%, ${accentGlow(0.08)} 28%, rgba(255,255,255,0) 54%)`,
            }}
          />
          <div className="pointer-events-none absolute left-[15%] top-[20%] h-[18rem] w-[32rem] rounded-full bg-white/20 blur-[120px] animate-[atmosphereFloat_24s_ease-in-out_infinite]" />
          <div
            className="pointer-events-none absolute right-[10%] bottom-[15%] h-[24rem] w-[40rem] rounded-full blur-[140px] animate-[atmospherePulse_22s_ease-in-out_infinite]"
            style={{ background: `radial-gradient(circle, ${accentGlow(0.12)} 0%, rgba(255,255,255,0) 70%)` }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh]"
            style={{
              background: `linear-gradient(180deg, rgba(224,242,254,0) 0%, ${accentGlow(0.08)} 35%, ${accentGlow(0.2)} 100%)`,
            }}
          />
          <div
            className="pointer-events-none absolute right-[-6%] top-[12%] h-[26rem] w-[26rem] rounded-full opacity-60 [mask-image:linear-gradient(180deg,black,transparent)]"
            style={{ border: `1px solid ${accentGlow(0.14)}` }}
          />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_240px_rgba(30,58,88,0.08)]" />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
            style={{
              background: `
                radial-gradient(circle at 52% 50%, ${accentGlow(0.14 + zoomOutProgress * 0.12)} 0%, ${accentGlow(0.08 + zoomOutProgress * 0.06)} 18%, rgba(7,10,18,0) 36%),
                radial-gradient(circle at 52% 44%, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0) 18%),
                linear-gradient(180deg, rgba(3,7,18,0.14) 0%, rgba(3,7,18,0) 34%, rgba(2,6,23,0.94) 100%)
              `,
            }}
          />
          <div
            className="pointer-events-none absolute left-1/2 top-[53%] h-[92vh] w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] animate-[atmosphereFloat_34s_ease-in-out_infinite] transition-opacity duration-700"
            style={{
              background: `radial-gradient(ellipse at center, ${accentGlow(0.16 + zoomOutProgress * 0.14)} 0%, ${accentGlow(0.08 + zoomOutProgress * 0.06)} 30%, ${accentGlow(0.025 + zoomOutProgress * 0.03)} 54%, rgba(2,6,23,0) 72%)`,
              opacity: 0.48 + zoomOutProgress * 0.34,
            }}
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[86px] animate-[atmospherePulse_18s_ease-in-out_infinite] transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle, ${accentGlow(0.24 + zoomOutProgress * 0.18)} 0%, ${accentGlow(0.12 + zoomOutProgress * 0.08)} 22%, ${accentGlow(0.05 + zoomOutProgress * 0.04)} 44%, rgba(2,6,23,0) 74%)`,
              opacity: 0.58 + zoomOutProgress * 0.24,
            }}
          />
          <div
            className="pointer-events-none absolute left-[-10%] top-[-5%] h-[40rem] w-[40rem] rounded-full blur-[160px] animate-[atmospherePulse_25s_ease-in-out_infinite]"
            style={{ background: `radial-gradient(circle, ${accentGlow(0.1)} 0%, rgba(7,10,18,0) 70%)` }}
          />
          <div
            className="pointer-events-none absolute right-[-5%] bottom-[-10%] h-[35rem] w-[35rem] rounded-full blur-[140px] animate-[atmosphereFloat_28s_ease-in-out_infinite]"
            style={{ background: `radial-gradient(circle, ${accentGlow(0.07)} 0%, rgba(2,6,23,0) 68%)` }}
          />
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: 0.24 + zoomOutProgress * 0.24,
              background: `
                radial-gradient(circle at 18% 76%, ${accentGlow(0.08)} 0%, rgba(2,6,23,0) 32%),
                radial-gradient(circle at 82% 18%, ${accentGlow(0.07)} 0%, rgba(2,6,23,0) 28%),
                radial-gradient(circle at 60% 58%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 16%)
              `,
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.16)_0%,rgba(2,6,23,0)_24%,rgba(2,6,23,0)_76%,rgba(2,6,23,0.14)_100%)]" />
        </>
      )}

      <Starfield isVisible={theme === 'dark'} intensity={starfieldIntensity} accentRgb={accentColorRgb} />

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
          atmosphereColor={theme === 'light' ? accentGlow(0.34) : accentGlow(0.72)}
          atmosphereAltitude={theme === 'light' ? 0.065 + zoomOutProgress * 0.008 : 0.11 + zoomOutProgress * 0.016}
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
          onZoom={(pov: any) => {
            syncViewAltitude(pov?.altitude);
          }}
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
