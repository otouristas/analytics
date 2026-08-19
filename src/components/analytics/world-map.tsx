import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { Minus, Plus, RotateCcw } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology } from "topojson-specification";
import { Button } from "@/components/ui/button";
import {
  COUNTRY_BY_ID,
  normalizeGeoId,
  SKIP_IDS,
} from "@/lib/analytics/countries";
import { colorForLive, liveByCountry, sessionsFromEvents } from "@/lib/analytics/realtime";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { VisitorCard } from "@/components/analytics/visitor-card";
import { hashJitter, VisitorPin } from "@/components/analytics/visitor-marker";
import { useAnalytics } from "@/lib/analytics/store";
import { cn } from "@/lib/utils";

const MAP_W = 960;
const MAP_H = 500;

type PreparedFeature = {
  id: string;
  name: string;
  d: string;
  centroid: [number, number];
};

type View = { x: number; y: number; k: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function constrain(view: View): View {
  const k = clamp(view.k, 1, 8);
  if (k <= 1.01) return { x: 0, y: 0, k: 1 };
  const pad = 64;
  return {
    k,
    x: clamp(view.x, pad - MAP_W * k, MAP_W - pad),
    y: clamp(view.y, pad - MAP_H * k, MAP_H - pad),
  };
}

const CountryPath = memo(function CountryPath({
  item,
  fill,
  selected,
  onEnter,
  onLeave,
  onClick,
}: {
  item: PreparedFeature;
  fill: string;
  selected: boolean;
  onEnter: (item: PreparedFeature, event: ReactPointerEvent<SVGPathElement>) => void;
  onLeave: () => void;
  onClick: (item: PreparedFeature) => void;
}) {
  return (
    <path
      d={item.d}
      fill={fill}
      className={cn("map-country", selected && "is-selected")}
      onPointerEnter={(event) => onEnter(item, event)}
      onPointerMove={(event) => onEnter(item, event)}
      onPointerLeave={onLeave}
      onClick={() => onClick(item)}
    />
  );
});

export function WorldMap({ onFocusCountry }: { onFocusCountry: (fn: (id: string) => void) => void }) {
  const metric = useAnalytics((s) => s.metric);
  const range = useAnalytics((s) => s.range);
  const selectedId = useAnalytics((s) => s.selectedId);
  const toggleSelected = useAnalytics((s) => s.toggleSelected);
  const sessionId = useAnalytics((s) => s.sessionId);
  const setSessionId = useAnalytics((s) => s.setSessionId);
  const events = useAnalytics((s) => s.events);
  const { live, people } = useRealtime();
  const crowd = live.length ? live : people.slice(0, 24);
  const liveCounts = useMemo(() => liveByCountry(sessionsFromEvents(events)), [events]);
  const [features, setFeatures] = useState<PreparedFeature[]>([]);
  const featureById = useMemo(
    () => Object.fromEntries(features.map((item) => [item.id, item])),
    [features],
  );
  const [sphere, setSphere] = useState("");
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1.05 });
  const [hover, setHover] = useState<{ id: string; name: string } | null>(null);
  const [ready, setReady] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    origin: View;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; view: View; mid: { x: number; y: number } } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch("/geo/countries-110m.json");
      const topology = (await response.json()) as Topology;
      const object = topology.objects.countries;
      const collection = feature(topology, object) as FeatureCollection<
        Geometry,
        { name?: string }
      >;
      const projection = geoNaturalEarth1().fitExtent(
        [
          [12, 18],
          [MAP_W - 12, MAP_H - 8],
        ],
        { type: "Sphere" },
      );
      const path = geoPath(projection);
      if (cancelled) return;
      setSphere(path({ type: "Sphere" } as GeoPermissibleObjects) ?? "");
      const next: PreparedFeature[] = [];
      for (const geoFeature of collection.features) {
        const name = (geoFeature.properties as { name?: string } | null)?.name ?? "Unknown";
        const id = normalizeGeoId(geoFeature.id as string | number | undefined, name);
        if (SKIP_IDS.has(id)) continue;
        const d = path(geoFeature as GeoPermissibleObjects);
        if (!d) continue;
        const centroid = path.centroid(geoFeature as GeoPermissibleObjects) as [number, number];
        next.push({ id, name, d, centroid });
      }
      setFeatures(next);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const colors = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of features) {
      map.set(item.id, colorForLive(liveCounts[item.id] ?? 0));
    }
    return map;
  }, [features, metric, range, liveCounts]);

  const toLocal = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * MAP_W,
      y: ((clientY - rect.top) / rect.height) * MAP_H,
    };
  }, []);

  const placeTip = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const tip = tipRef.current;
    if (!svg || !tip) return;
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left + 14;
    const y = clientY - rect.top - 12;
    tip.style.transform = `translate(${x}px, ${y}px) translateY(-100%)`;
  }, []);

  const zoomAt = useCallback((sx: number, sy: number, factor: number) => {
    setView((current) => {
      const nextK = clamp(current.k * factor, 1, 8);
      const x = sx - ((sx - current.x) * nextK) / current.k;
      const y = sy - ((sy - current.y) * nextK) / current.k;
      return constrain({ x, y, k: nextK });
    });
  }, []);

  const focusCountry = useCallback((id: string) => {
    const item = features.find((featureItem) => featureItem.id === id);
    if (!item) return;
    const k = 3.1;
    setView(
      constrain({
        k,
        x: MAP_W / 2 - item.centroid[0] * k,
        y: MAP_H / 2 - item.centroid[1] * k,
      }),
    );
  }, [features]);

  useEffect(() => {
    onFocusCountry(focusCountry);
  }, [focusCountry, onFocusCountry]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const local = toLocal(event.clientX, event.clientY);
      zoomAt(local.x, local.y, event.deltaY < 0 ? 1.14 : 1 / 1.14);
    };
    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, [toLocal, zoomAt]);

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    const local = toLocal(event.clientX, event.clientY);
    pointers.current.set(event.pointerId, local);
    (event.target as Element).setPointerCapture?.(event.pointerId);
    if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const first = pts[0];
      const second = pts[1];
      if (first && second) {
        pinch.current = {
          distance: Math.hypot(second.x - first.x, second.y - first.y),
          view,
          mid: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
        };
      }
      drag.current = null;
      return;
    }
    drag.current = {
      pointerId: event.pointerId,
      x: local.x,
      y: local.y,
      origin: view,
      moved: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const local = toLocal(event.clientX, event.clientY);
    if (pointers.current.has(event.pointerId)) {
      pointers.current.set(event.pointerId, local);
    }
    if (pointers.current.size === 2 && pinch.current) {
      const pts = [...pointers.current.values()];
      const first = pts[0];
      const second = pts[1];
      if (!first || !second) return;
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const mid = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      const factor = distance / Math.max(8, pinch.current.distance);
      const nextK = clamp(pinch.current.view.k * factor, 1, 8);
      const x = mid.x - ((mid.x - pinch.current.view.x) * nextK) / pinch.current.view.k;
      const y = mid.y - ((mid.y - pinch.current.view.y) * nextK) / pinch.current.view.k;
      setView(constrain({ x, y, k: nextK }));
      return;
    }
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const dx = local.x - active.x;
    const dy = local.y - active.y;
    if (Math.hypot(dx, dy) > 2) active.moved = true;
    setView(constrain({ x: active.origin.x + dx, y: active.origin.y + dy, k: active.origin.k }));
  };

  const endPointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (drag.current?.pointerId === event.pointerId) {
      suppressClick.current = drag.current.moved;
      drag.current = null;
    }
  };

  const onEnter = (item: PreparedFeature, event: ReactPointerEvent<SVGPathElement>) => {
    setHover({ id: item.id, name: COUNTRY_BY_ID.get(item.id)?.name ?? item.name });
    placeTip(event.clientX, event.clientY);
  };

  const hoveredCountry = hover ? COUNTRY_BY_ID.get(hover.id) : undefined;

  return (
    <div className="relative h-full min-h-80 overflow-hidden bg-ocean">
      {!ready && (
        <div className="absolute inset-0 animate-pulse bg-elevated" aria-hidden="true" />
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="h-full w-full touch-none select-none"
        role="img"
        aria-label="World choropleth map"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <rect width={MAP_W} height={MAP_H} fill="var(--color-ocean)" />
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {sphere && <path d={sphere} className="map-ocean" />}
          {features.map((item) => (
            <CountryPath
              key={item.id}
              item={item}
              fill={colors.get(item.id) ?? "var(--color-map-empty)"}
              selected={selectedId === item.id}
              onEnter={onEnter}
              onLeave={() => setHover(null)}
              onClick={(clicked) => {
                if (suppressClick.current) {
                  suppressClick.current = false;
                  return;
                }
                if (!COUNTRY_BY_ID.has(clicked.id)) return;
                toggleSelected(clicked.id);
              }}
            />
          ))}
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 z-10">
        {crowd.map((person) => {
          const item = featureById[person.countryId];
          if (!item) return null;
          const jitter = hashJitter(person.id);
          const cx = item.centroid[0] + jitter.lng;
          const cy = item.centroid[1] - jitter.lat;
          const left = ((view.x + cx * view.k) / MAP_W) * 100;
          const top = ((view.y + cy * view.k) / MAP_H) * 100;
          if (left < 2 || left > 98 || top < 4 || top > 98) return null;
          return (
            <div
              key={person.id}
              className="pointer-events-auto absolute"
              style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -100%)" }}
            >
              <VisitorPin
                person={person}
                label
                onSelect={() => setSessionId(person.id)}
              />
              {sessionId === person.id && (
                <div className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-[calc(100%+0.5rem)]">
                  <VisitorCard person={person} people={crowd} onClose={() => setSessionId(null)} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        ref={tipRef}
        className={cn(
          "pointer-events-none absolute top-0 left-0 z-20 w-52 rounded-md bg-elevated px-3 py-2 shadow-[var(--shadow-border)]",
          "transition-opacity duration-150 ease-out",
          hover && hoveredCountry ? "opacity-100" : "opacity-0",
        )}
      >
        {hoveredCountry && (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-medium text-fg">{hoveredCountry.name}</p>
              <span className="font-mono text-xs text-subtle">{hoveredCountry.iso3}</span>
            </div>
            <p className="mt-1 font-mono text-base tabular-nums text-fg">
              {liveCounts[hoveredCountry.id] ?? 0} live
            </p>
            <p className="text-xs text-muted">Real visitors on site now</p>
          </>
        )}
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <Button
          variant="subtle"
          size="icon-sm"
          aria-label="Zoom in"
          onClick={() => zoomAt(MAP_W / 2, MAP_H / 2, 1.35)}
        >
          <Plus className="size-4" />
        </Button>
        <Button
          variant="subtle"
          size="icon-sm"
          aria-label="Zoom out"
          onClick={() => zoomAt(MAP_W / 2, MAP_H / 2, 1 / 1.35)}
        >
          <Minus className="size-4" />
        </Button>
        <Button
          variant="subtle"
          size="icon-sm"
          aria-label="Reset view"
          onClick={() => setView({ x: 0, y: 0, k: 1.05 })}
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
