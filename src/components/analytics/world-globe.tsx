import { geoCentroid, geoEquirectangular, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  COUNTRY_BY_ID,
  colorForValue,
  normalizeGeoId,
  SKIP_IDS,
} from "@/lib/analytics/countries";
import { scaledValue } from "@/lib/analytics/model";
import { colorForLive, liveByCountry, sessionsFromEvents } from "@/lib/analytics/realtime";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { VisitorCard } from "@/components/analytics/visitor-card";
import { hashJitter, VisitorPin } from "@/components/analytics/visitor-marker";
import { useAnalytics } from "@/lib/analytics/store";
import { cn } from "@/lib/utils";

const TEX_W = 2048;
const TEX_H = 1024;

type FocusFn = (id: string) => void;

export function WorldGlobe({ onFocusCountry }: { onFocusCountry: (fn: FocusFn) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GlobeEngine | null>(null);
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);
  const [pins, setPins] = useState<{ id: string; x: number; y: number; visible: boolean }[]>([]);
  const pinKey = useRef("");
  const metric = useAnalytics((s) => s.metric);
  const range = useAnalytics((s) => s.range);
  const selectedId = useAnalytics((s) => s.selectedId);
  const sessionId = useAnalytics((s) => s.sessionId);
  const setSessionId = useAnalytics((s) => s.setSessionId);
  const theme = useAnalytics((s) => s.theme);
  const toggleSelected = useAnalytics((s) => s.toggleSelected);
  const events = useAnalytics((s) => s.events);
  const { live, people } = useRealtime();
  const crowd = useMemo(() => (live.length ? live : people.slice(0, 24)), [live, people]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    const engine = new GlobeEngine();
    engineRef.current = engine;
    void engine.mount(host, {
      onReady: () => {
        if (!cancelled) setReady(true);
      },
      onHover: (next) => {
        if (!cancelled) setHover(next);
      },
      onSelect: (id) => {
        if (COUNTRY_BY_ID.has(id)) toggleSelected(id);
      },
    });
    return () => {
      cancelled = true;
      engine.dispose();
      engineRef.current = null;
    };
  }, [toggleSelected]);

  const paint = useCallback(() => {
    const counts = liveByCountry(sessionsFromEvents(events));
    engineRef.current?.paint({
      metric,
      range,
      selectedId,
      theme,
      liveCounts: counts,
    });
  }, [metric, range, selectedId, theme, events]);

  useEffect(() => {
    paint();
  }, [paint]);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const next = engineRef.current?.projectPeople(crowd) ?? [];
      const key = next.map((pin) => `${pin.id}:${pin.x | 0}:${pin.y | 0}:${pin.visible ? 1 : 0}`).join("|");
      if (key !== pinKey.current) {
        pinKey.current = key;
        setPins(next);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [crowd]);

  useEffect(() => {
    const fly = (id: string) => engineRef.current?.flyTo(id);
    onFocusCountry(fly);
  }, [onFocusCountry]);

  useEffect(() => {
    if (selectedId) engineRef.current?.flyTo(selectedId);
  }, [selectedId]);

  return (
    <div className="relative h-full min-h-80 overflow-hidden bg-ocean">
      <div ref={hostRef} className="absolute inset-0 touch-none" />
      {!ready && <div className="absolute inset-0 animate-pulse bg-elevated" aria-hidden="true" />}
      <div className="globe-vignette pointer-events-none absolute inset-0 z-10" />
      <div className="meridian-cross pointer-events-none absolute inset-0 z-10" />
      {hover && (
        <div
          className="pointer-events-none absolute z-20 rounded-md bg-elevated px-2.5 py-1.5 text-xs shadow-[var(--shadow-border)]"
          style={{ left: hover.x, top: hover.y, transform: "translate(-50%, -120%)" }}
        >
          {hover.name}
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 z-20">
        {crowd.map((person) => {
          const pin = pins.find((item) => item.id === person.id);
          if (!pin?.visible) return null;
          return (
            <div
              key={person.id}
              className="pointer-events-auto absolute"
              style={{ left: pin.x, top: pin.y, transform: "translate(-50%, -100%)" }}
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
    </div>
  );
}

type PaintState = {
  metric: ReturnType<typeof useAnalytics.getState>["metric"];
  range: ReturnType<typeof useAnalytics.getState>["range"];
  selectedId: string | null;
  theme: ReturnType<typeof useAnalytics.getState>["theme"];
  liveCounts: Record<string, number> | null;
};

type EngineHandlers = {
  onReady: () => void;
  onHover: (hover: { name: string; x: number; y: number } | null) => void;
  onSelect: (id: string) => void;
};

function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function encodeId(id: string): [number, number, number] {
  const n = Number.parseInt(id, 10);
  if (!Number.isFinite(n)) return [0, 0, 0];
  return [(n >> 8) & 255, n & 255, 96];
}

function decodeId(r: number, g: number, b: number): string | null {
  if (b < 80 || b > 112) return null;
  return String((r << 8) | g).padStart(3, "0");
}

class GlobeEngine {
  private disposed = false;
  private renderer: import("three").WebGLRenderer | null = null;
  private scene: import("three").Scene | null = null;
  private camera: import("three").PerspectiveCamera | null = null;
  private controls: { update: () => void; dispose: () => void; autoRotate: boolean; target: import("three").Vector3 } | null =
    null;
  private earth: import("three").Mesh | null = null;
  private points: import("three").Points | null = null;
  private frame = 0;
  private colorCanvas: HTMLCanvasElement | null = null;
  private pickCanvas: HTMLCanvasElement | null = null;
  private pickCtx: CanvasRenderingContext2D | null = null;
  private centroids = new Map<string, [number, number]>();
  private collection: FeatureCollection<Geometry> | null = null;
  private resize: ResizeObserver | null = null;
  private host: HTMLElement | null = null;
  private three: typeof import("three") | null = null;
  private handlers: EngineHandlers | null = null;
  private flying: { from: import("three").Vector3; to: import("three").Vector3; t: number } | null = null;
  private clouds: import("three").Mesh | null = null;
  private arcsGroup: import("three").Group | null = null;
  private pulseParticles: { mesh: import("three").Mesh; curve: import("three").QuadraticBezierCurve3; progress: number; speed: number }[] = [];

  async mount(host: HTMLElement, handlers: EngineHandlers) {
    this.host = host;
    this.handlers = handlers;
    const THREE = await import("three");
    const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
    const response = await fetch("/geo/countries-110m.json");
    const world = (await response.json()) as Topology;
    if (this.disposed) return;
    this.three = THREE;

    const object = world.objects.countries ?? Object.values(world.objects)[0];
    this.collection = feature(world, object) as unknown as FeatureCollection<Geometry>;
    for (const item of this.collection.features) {
      const name = (item.properties as { name?: string } | null)?.name;
      const id = normalizeGeoId(item.id ?? item.properties?.iso_n3, name);
      if (!id || SKIP_IDS.has(id)) continue;
      const [lng, lat] = geoCentroid(item);
      if (Number.isFinite(lat) && Number.isFinite(lng)) this.centroids.set(id, [lat, lng]);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "h-full w-full";
    host.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    this.scene = scene;
    const camera = new THREE.PerspectiveCamera(36, host.clientWidth / Math.max(1, host.clientHeight), 0.1, 80);
    camera.position.set(0.35, 0.55, 2.55);
    this.camera = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.42;
    controls.maxDistance = 4.6;
    controls.minPolarAngle = 0.18;
    controls.maxPolarAngle = Math.PI - 0.18;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.28;
    controls.rotateSpeed = 0.42;
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
    });
    this.controls = controls;

    scene.add(new THREE.AmbientLight(0xb8c4cc, 0.42));
    const key = new THREE.DirectionalLight(0xfff4e6, 1.55);
    key.position.set(6, 2.2, 2.4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x6ea8c9, 0.28);
    fill.position.set(-5, -0.6, -2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x9fd4c4, 0.45);
    rim.position.set(-2, 1.8, 5);
    scene.add(rim);

    this.colorCanvas = document.createElement("canvas");
    this.colorCanvas.width = TEX_W;
    this.colorCanvas.height = TEX_H;
    this.pickCanvas = document.createElement("canvas");
    this.pickCanvas.width = TEX_W;
    this.pickCanvas.height = TEX_H;
    this.pickCtx = this.pickCanvas.getContext("2d", { willReadFrequently: true });

    const colorTex = new THREE.CanvasTexture(this.colorCanvas);
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 128, 96),
      new THREE.MeshPhongMaterial({
        map: colorTex,
        shininess: 26,
        specular: new THREE.Color("#4a6a72"),
        emissive: new THREE.Color("#0a1214"),
        emissiveIntensity: 0.18,
      }),
    );
    this.earth = earth;
    scene.add(earth);

    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(1.085, 80, 56),
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color("#7ec8e8") } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          uniform vec3 uColor;
          void main() {
            float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
            gl_FragColor = vec4(uColor, 1.0) * intensity * 1.55;
          }
        `,
      }),
    );
    scene.add(atmo);

    const groundAtmo = new THREE.Mesh(
      new THREE.SphereGeometry(1.012, 80, 56),
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        depthWrite: false,
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.2);
            gl_FragColor = vec4(0.42, 0.72, 0.82, fresnel * 0.42);
          }
        `,
      }),
    );
    scene.add(groundAtmo);

    const cloudTex = new THREE.TextureLoader().load("/geo/clouds.jpg");
    cloudTex.colorSpace = THREE.SRGBColorSpace;
    cloudTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.018, 96, 64),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uMap: { value: cloudTex } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform sampler2D uMap;
          void main() {
            vec3 c = texture2D(uMap, vUv).rgb;
            float a = max(c.r, max(c.g, c.b));
            gl_FragColor = vec4(vec3(0.92, 0.95, 0.97), a * 0.38);
          }
        `,
      }),
    );
    this.clouds = clouds;
    scene.add(clouds);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 2800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const r = 8 + Math.random() * 10;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: "#eceae4", size: 0.016, transparent: true, opacity: 0.7 }),
    );
    stars.name = "stars";
    scene.add(stars);

    this.points = this.makeVisitors(THREE);
    scene.add(this.points);

    // 3D Great-Circle Journey Arcs Group
    const arcsGroup = new THREE.Group();
    arcsGroup.name = "journeyArcs";
    this.arcsGroup = arcsGroup;
    scene.add(arcsGroup);

    this.resize = new ResizeObserver(() => this.fit());
    this.resize.observe(host);
    this.fit();

    renderer.domElement.addEventListener("pointermove", this.onMove);
    renderer.domElement.addEventListener("click", this.onClick);

    const tick = () => {
      if (this.disposed) return;
      this.frame = requestAnimationFrame(tick);
      if (this.flying && this.camera) {
        this.flying.t = Math.min(1, this.flying.t + 0.035);
        const ease = 1 - (1 - this.flying.t) ** 3;
        this.camera.position.lerpVectors(this.flying.from, this.flying.to, ease);
        if (this.flying.t >= 1) this.flying = null;
      }
      this.controls?.update();
      if (this.clouds) this.clouds.rotation.y += 0.00018;

      // Animate pulsing journey arc particles along their Bezier paths
      for (const p of this.pulseParticles) {
        p.progress = (p.progress + p.speed) % 1.0;
        const pos = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pos);
      }

      if (this.points) this.points.visible = false;
      renderer.render(scene, camera);
    };
    tick();

    const state = useAnalytics.getState();
    this.paint({
      metric: state.metric,
      range: state.range,
      selectedId: state.selectedId,
      theme: state.theme,
      liveCounts: null,
    });
    handlers.onReady();
  }

  paint(state: PaintState) {
    if (!this.collection || !this.colorCanvas || !this.pickCanvas || !this.pickCtx || !this.earth || !this.three) {
      return;
    }
    const ctx = this.colorCanvas.getContext("2d");
    if (!ctx) return;

    const ocean = token("--color-ocean") || "#0c0e10";
    const empty = token("--color-map-empty") || "#16191c";

    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    this.pickCtx.fillStyle = "#000";
    this.pickCtx.fillRect(0, 0, TEX_W, TEX_H);

    const projection = geoEquirectangular()
      .scale(TEX_W / (Math.PI * 2))
      .translate([TEX_W / 2, TEX_H / 2])
      .precision(0.2);
    const colorPath = geoPath(projection, ctx);
    const pickPath = geoPath(projection, this.pickCtx);
    this.pickCtx.imageSmoothingEnabled = false;

    for (const item of this.collection.features) {
      const name = (item.properties as { name?: string } | null)?.name;
      const id = normalizeGeoId(item.id ?? item.properties?.iso_n3, name);
      if (!id || SKIP_IDS.has(id)) continue;
      const country = COUNTRY_BY_ID.get(id);
      const liveCount = state.liveCounts ? (state.liveCounts[id] ?? 0) : null;
      const fill =
        liveCount !== null
          ? colorForLive(liveCount)
          : country
            ? colorForValue(scaledValue(country, state.metric, state.range), state.metric, state.range)
            : empty;
      ctx.fillStyle = resolveColor(fill);
      ctx.beginPath();
      colorPath(item);
      ctx.fill();
      ctx.strokeStyle = ocean;
      ctx.lineWidth = 0.7;
      ctx.stroke();
      if (state.selectedId === id) {
        ctx.strokeStyle = token("--color-fg") || "#eceae4";
        ctx.lineWidth = 2.4;
        ctx.stroke();
      }
      const [r, g, b] = encodeId(id);
      this.pickCtx.fillStyle = `rgb(${r},${g},${b})`;
      this.pickCtx.beginPath();
      pickPath(item);
      this.pickCtx.fill();
    }

    const map = this.earth.material as import("three").MeshPhongMaterial;
    if (map.map) map.map.needsUpdate = true;
    map.needsUpdate = true;

    const stars = this.scene?.getObjectByName("stars");
    if (stars) stars.visible = state.theme !== "light";
    this.renderer?.setClearColor(new (this.three!).Color(ocean), 1);
    if (this.scene) this.scene.background = new (this.three!).Color(ocean);
  }

  projectPeople(people: { id: string; countryId: string }[]) {
    const THREE = this.three;
    const camera = this.camera;
    const renderer = this.renderer;
    if (!THREE || !camera || !renderer) return [];
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;
    const cam = camera.position.clone().normalize();

    this.updateArcs(people);

    return people.map((person) => {
      const pair = this.centroids.get(person.countryId);
      if (!pair) return { id: person.id, x: 0, y: 0, visible: false };
      const jitter = hashJitter(person.id);
      const world = latLngToVec(THREE, pair[0] + jitter.lat, pair[1] + jitter.lng, 1.03);
      const facing = world.clone().normalize().dot(cam) > 0.18;
      const ndc = world.project(camera);
      return {
        id: person.id,
        x: (ndc.x * 0.5 + 0.5) * width,
        y: (-ndc.y * 0.5 + 0.5) * height,
        visible: facing && ndc.z < 1,
      };
    });
  }

  private lastArcKey = "";
  updateArcs(people: { id: string; countryId: string }[]) {
    const THREE = this.three;
    if (!THREE || !this.arcsGroup) return;

    const uniqueCountries = [...new Set(people.map((p) => p.countryId).filter(Boolean))].slice(0, 12);
    const key = uniqueCountries.sort().join(",");
    if (key === this.lastArcKey) return;
    this.lastArcKey = key;

    // Clear old arcs
    while (this.arcsGroup.children.length > 0) {
      const child = this.arcsGroup.children[0]!;
      this.arcsGroup.remove(child);
      if ("geometry" in child && (child as { geometry: import("three").BufferGeometry }).geometry) {
        (child as { geometry: import("three").BufferGeometry }).geometry.dispose();
      }
    }
    this.pulseParticles = [];

    // Destination: Cyclades, Greece (Lat 37.08, Lng 25.14)
    const destVec = latLngToVec(THREE, 37.08, 25.14, 1.01);

    const arcMat = new THREE.LineBasicMaterial({
      color: 0x64a798,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });

    const particleMat = new THREE.MeshBasicMaterial({
      color: 0x97c7b4,
      blending: THREE.AdditiveBlending,
    });
    const particleGeo = new THREE.SphereGeometry(0.012, 12, 12);

    for (const cid of uniqueCountries) {
      const pair = this.centroids.get(cid);
      if (!pair) continue;
      const [lat, lng] = pair;
      if (Math.abs(lat - 37.08) < 2 && Math.abs(lng - 25.14) < 2) continue; // Skip local Greece

      const startVec = latLngToVec(THREE, lat, lng, 1.01);
      const midVec = startVec.clone().add(destVec).multiplyScalar(0.5);
      const dist = startVec.distanceTo(destVec);
      const altitude = 1.0 + Math.min(0.5, dist * 0.35);
      midVec.normalize().multiplyScalar(altitude);

      const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, destVec);
      const points = curve.getPoints(36);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, arcMat);
      this.arcsGroup.add(line);

      // Pulse traveling particle
      const pMesh = new THREE.Mesh(particleGeo, particleMat);
      pMesh.position.copy(startVec);
      this.arcsGroup.add(pMesh);

      this.pulseParticles.push({
        mesh: pMesh,
        curve,
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.006,
      });
    }
  }

  flyTo(id: string) {
    const pair = this.centroids.get(id);
    const camera = this.camera;
    const THREE = this.three;
    if (!pair || !camera || !THREE) return;
    const [lat, lng] = pair;
    const dest = latLngToVec(THREE, lat, lng, 2.25);
    this.flying = { from: camera.position.clone(), to: dest, t: 0 };
    if (this.controls) this.controls.autoRotate = false;
  }

  setVisitors(ids: string[]) {
    const THREE = this.three;
    if (!THREE || !this.points) return;
    const positions: number[] = [];
    for (const id of ids) {
      const pair = this.centroids.get(id);
      if (!pair) continue;
      const vec = latLngToVec(THREE, pair[0], pair[1], 1.02);
      positions.push(vec.x, vec.y, vec.z);
    }
    this.points.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    this.points.geometry.computeBoundingSphere();
  }

  private makeVisitors(THREE: typeof import("three")) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([], 3));
    return new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: "#97c7b4",
        size: 0.03,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
    );
  }

  private sample(event: PointerEvent): string | null {
    if (!this.renderer || !this.camera || !this.earth || !this.three || !this.pickCtx) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new this.three.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const raycaster = new this.three.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    const hit = raycaster.intersectObject(this.earth)[0];
    if (!hit?.uv) return null;
    const x = Math.min(TEX_W - 1, Math.max(0, Math.floor(hit.uv.x * TEX_W)));
    const y = Math.min(TEX_H - 1, Math.max(0, Math.floor((1 - hit.uv.y) * TEX_H)));
    const pix = this.pickCtx.getImageData(x, y, 1, 1).data;
    return decodeId(pix[0] ?? 0, pix[1] ?? 0, pix[2] ?? 0);
  }

  private onMove = (event: PointerEvent) => {
    const id = this.sample(event);
    const host = this.host;
    if (!id || !host) {
      this.handlers?.onHover(null);
      return;
    }
    const country = COUNTRY_BY_ID.get(id);
    const rect = host.getBoundingClientRect();
    this.handlers?.onHover({
      name: country?.name ?? id,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  private onClick = (event: PointerEvent) => {
    const id = this.sample(event);
    if (id) this.handlers?.onSelect(id);
  };

  private fit() {
    if (!this.host || !this.renderer || !this.camera) return;
    const w = this.host.clientWidth;
    const h = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.resize?.disconnect();
    this.renderer?.domElement.removeEventListener("pointermove", this.onMove);
    this.renderer?.domElement.removeEventListener("click", this.onClick);
    this.controls?.dispose();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }
}

function latLngToVec(THREE: typeof import("three"), lat: number, lng: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function resolveColor(value: string) {
  if (value.startsWith("var(")) {
    const name = value.slice(4, -1).trim();
    return token(name) || value;
  }
  return value;
}

export function ProjectionSwitch({ className }: { className?: string }) {
  const projection = useAnalytics((s) => s.projection);
  const setProjection = useAnalytics((s) => s.setProjection);
  return (
    <div className={cn("seg shadow-[var(--shadow-border)]", className)}>
      {(["globe", "flat"] as const).map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => setProjection(id)}
          className={cn("chip", projection === id && "is-on")}
        >
          {id === "globe" ? "Earth" : "Flat"}
        </button>
      ))}
    </div>
  );
}
