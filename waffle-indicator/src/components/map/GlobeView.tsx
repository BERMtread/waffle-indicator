'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import type { SatPosition } from '@/lib/orbital/propagator';
import type { PredictedPath } from '@/hooks/useOrbitalPropagation';
import type { AOIData } from '@/lib/geo/aoi-data';
import { footprintRadius } from '@/lib/geo/coverage-check';
import { DEFAULT_MIN_ELEVATION_DEG, EARTH_RADIUS_KM } from '@/lib/orbital/constants';

// ---------- Constants ----------
const R = 1; // Globe radius in scene units
const SAT_COLOR = '#00FF88'; // Green for all satellites on globe

// ---------- Coordinate conversion ----------
function latLngToVec3(lat: number, lng: number, radius: number = R): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

function vec3ToLatLng(x: number, y: number, z: number): { lat: number; lng: number } {
  const r = Math.sqrt(x * x + y * y + z * z);
  const lat = 90 - Math.acos(y / r) * (180 / Math.PI);
  const theta = Math.atan2(z, -x);
  let lng = theta * (180 / Math.PI) - 180;
  lng = ((lng + 540) % 360) - 180;
  return { lat, lng };
}

// Generate circle on sphere surface (for footprints)
function sphereCirclePoints(
  lat: number, lng: number, angularRadiusRad: number, segments = 64
): [number, number, number][] {
  const center = new THREE.Vector3(...latLngToVec3(lat, lng, 1));
  const up = new THREE.Vector3(0, 1, 0);
  const u = new THREE.Vector3().crossVectors(center, up).normalize();
  if (u.length() < 0.001) u.copy(new THREE.Vector3().crossVectors(center, new THREE.Vector3(1, 0, 0)).normalize());
  const v = new THREE.Vector3().crossVectors(center, u).normalize();

  const points: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const p = new THREE.Vector3()
      .addScaledVector(center, Math.cos(angularRadiusRad))
      .addScaledVector(u, Math.sin(angularRadiusRad) * Math.cos(t))
      .addScaledVector(v, Math.sin(angularRadiusRad) * Math.sin(t));
    p.multiplyScalar(R * 1.001);
    points.push([p.x, p.y, p.z]);
  }
  return points;
}

// ---------- Earth Sphere ----------
function Earth() {
  return (
    <mesh>
      <sphereGeometry args={[R, 64, 32]} />
      <meshBasicMaterial color="#050810" />
    </mesh>
  );
}

// ---------- Atmosphere Glow ----------
function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[R * 1.06, 64, 32]} />
      <shaderMaterial
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            vViewDir = normalize(-mvPos.xyz);
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mvPos;
          }
        `}
        fragmentShader={`
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            float rim = 1.0 - abs(dot(vNormal, vViewDir));
            float intensity = pow(rim, 3.0);
            gl_FragColor = vec4(0.15, 0.4, 0.9, intensity * 0.35);
          }
        `}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ---------- Globe Grid ----------
function GlobeGrid() {
  const geometry = useMemo(() => {
    const vertices: number[] = [];
    const segs = 72;
    // Latitude lines every 30 degrees
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let i = 0; i < segs; i++) {
        const lng1 = -180 + (i / segs) * 360;
        const lng2 = -180 + ((i + 1) / segs) * 360;
        vertices.push(...latLngToVec3(lat, lng1, R * 1.0005), ...latLngToVec3(lat, lng2, R * 1.0005));
      }
    }
    // Longitude lines every 30 degrees
    for (let lng = -150; lng <= 180; lng += 30) {
      for (let i = 0; i < segs; i++) {
        const lat1 = -90 + (i / segs) * 180;
        const lat2 = -90 + ((i + 1) / segs) * 180;
        vertices.push(...latLngToVec3(lat1, lng, R * 1.0005), ...latLngToVec3(lat2, lng, R * 1.0005));
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#0a1520" transparent opacity={0.4} />
    </lineSegments>
  );
}

// ---------- Country Borders ----------
function CountryBorders({ geoData }: { geoData: GeoJSON.FeatureCollection }) {
  const geometry = useMemo(() => {
    const vertices: number[] = [];
    for (const feat of geoData.features) {
      const geom = feat.geometry;
      let rings: number[][][] = [];
      if (geom.type === 'Polygon') rings = (geom as GeoJSON.Polygon).coordinates;
      else if (geom.type === 'MultiPolygon') {
        for (const poly of (geom as GeoJSON.MultiPolygon).coordinates) rings.push(...poly);
      }
      for (const ring of rings) {
        for (let i = 0; i < ring.length - 1; i++) {
          const [lng1, lat1] = ring[i]; // GeoJSON is [lng, lat]
          const [lng2, lat2] = ring[i + 1];
          vertices.push(...latLngToVec3(lat1, lng1, R * 1.001), ...latLngToVec3(lat2, lng2, R * 1.001));
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, [geoData]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#1a3a5a" transparent opacity={0.55} />
    </lineSegments>
  );
}

// ---------- Inclination Band ----------
function InclinationBand() {
  const [pointsN, pointsS] = useMemo(() => {
    const n: [number, number, number][] = [];
    const s: [number, number, number][] = [];
    for (let lng = -180; lng <= 180; lng += 2) {
      n.push(latLngToVec3(53, lng, R * 1.002));
      s.push(latLngToVec3(-53, lng, R * 1.002));
    }
    return [n, s];
  }, []);

  return (
    <group>
      <Line points={pointsN} color="#4488FF" lineWidth={0.5} transparent opacity={0.12} />
      <Line points={pointsS} color="#4488FF" lineWidth={0.5} transparent opacity={0.12} />
    </group>
  );
}

// ---------- AOI Overlays ----------
function AOIOverlays({ aois, selectedAOI }: { aois: AOIData[]; selectedAOI: AOIData | null }) {
  return (
    <group>
      {aois.map(aoi => {
        const isSelected = selectedAOI?.id === aoi.id;
        const points: [number, number, number][] = aoi.boundary.map(([lat, lng]) =>
          latLngToVec3(lat, lng, R * 1.002)
        );
        if (points.length > 0) points.push(points[0]); // close loop
        if (points.length < 3) return null;

        return (
          <group key={aoi.id}>
            {/* Boundary line */}
            <Line
              points={points}
              color={aoi.color}
              lineWidth={isSelected ? 2.5 : 1}
              transparent
              opacity={isSelected ? 0.9 : 0.35}
            />
            {/* AOI fill (triangle fan from centroid) */}
            {isSelected && <AOIFill boundary={aoi.boundary} centroid={aoi.centroid} color={aoi.color} />}

            {/* Label for Tier 1 or selected */}
            {(isSelected || aoi.priority === 1) && (
              <Html
                position={latLngToVec3(aoi.centroid.lat, aoi.centroid.lng, R * 1.025)}
                center
                style={{
                  color: aoi.color,
                  fontSize: isSelected ? '10px' : '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  textShadow: '0 0 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)',
                  opacity: isSelected ? 1 : 0.7,
                  letterSpacing: '0.5px',
                }}
              >
                {aoi.displayName || aoi.name}
              </Html>
            )}

            {/* Hotspot markers for selected AOI */}
            {isSelected && aoi.hotspots?.map((hs, idx) => {
              const hsColor = hs.type === 'nuclear' ? '#FF0040' :
                hs.type === 'military' || hs.type === 'command' ? '#FF6B00' :
                hs.type === 'naval' || hs.type === 'airbase' ? '#4488FF' : '#FFB800';
              return (
                <mesh key={idx} position={latLngToVec3(hs.lat, hs.lng, R * 1.004)}>
                  <octahedronGeometry args={[0.008, 0]} />
                  <meshBasicMaterial color={hsColor} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

// Triangle-fan fill for selected AOI
function AOIFill({ boundary, centroid, color }: { boundary: [number, number][]; centroid: { lat: number; lng: number }; color: string }) {
  const geometry = useMemo(() => {
    const centerV = latLngToVec3(centroid.lat, centroid.lng, R * 1.0015);
    const vertices: number[] = [];
    for (let i = 0; i < boundary.length; i++) {
      const [lat1, lng1] = boundary[i];
      const [lat2, lng2] = boundary[(i + 1) % boundary.length];
      const v1 = latLngToVec3(lat1, lng1, R * 1.0015);
      const v2 = latLngToVec3(lat2, lng2, R * 1.0015);
      vertices.push(...centerV, ...v1, ...v2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, [boundary, centroid]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

// ---------- Satellite Markers ----------
const FAR_SIDE_COLOR = new THREE.Color('#1a2a44');
const NEAR_SIDE_COLOR = new THREE.Color(SAT_COLOR);
const FOCUS_COLOR = new THREE.Color('#FFB800');

function SatelliteMarker({ pos, focused = false }: { pos: SatPosition; focused?: boolean }) {
  const nearColor = focused ? FOCUS_COLOR : NEAR_SIDE_COLOR;
  const glowRef = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const labelWrapRef = useRef<HTMLDivElement>(null);

  const satR = R + (pos.alt / EARTH_RADIUS_KM) * R * 2;
  const xyz = latLngToVec3(pos.lat, pos.lng, satR);

  useFrame(({ camera }) => {
    const satDir = new THREE.Vector3(...latLngToVec3(pos.lat, pos.lng, R)).normalize();
    const camDir = camera.position.clone().normalize();
    const dot = satDir.dot(camDir);
    // Smooth transition: -0.15 = fully far, 0.15 = fully near
    const t = Math.max(0, Math.min(1, (dot + 0.15) / 0.3));

    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.02 + t * 0.13;
      m.color.lerpColors(FAR_SIDE_COLOR, nearColor, t);
    }
    if (dotRef.current) {
      const m = dotRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.12 + t * 0.88;
      m.color.lerpColors(FAR_SIDE_COLOR, nearColor, t);
    }
    if (labelWrapRef.current) {
      labelWrapRef.current.style.opacity = String(t * t); // quadratic falloff
    }
  });

  return (
    <group position={xyz}>
      {/* Glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[focused ? 0.055 : 0.035, 12, 12]} />
        <meshBasicMaterial color={focused ? '#FFB800' : SAT_COLOR} transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Main dot */}
      <mesh ref={dotRef}>
        <sphereGeometry args={[focused ? 0.024 : 0.014, 12, 12]} />
        <meshBasicMaterial color={focused ? '#FFB800' : SAT_COLOR} transparent />
      </mesh>
      {/* Labels */}
      <Html
        position={[0.04, 0.01, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div ref={labelWrapRef} style={{ transition: 'opacity 0.15s' }}>
          <div
            style={{
              color: focused ? '#FFB800' : SAT_COLOR,
              fontSize: '9px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              textShadow: '0 0 6px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.8)',
              letterSpacing: '0.3px',
            }}
          >
            {pos.satId.toUpperCase()}
          </div>
          <div
            style={{
              color: '#6b82a6',
              fontSize: '7px',
              fontFamily: 'JetBrains Mono, monospace',
              whiteSpace: 'nowrap',
              textShadow: '0 0 4px rgba(0,0,0,0.9)',
            }}
          >
            {pos.lat.toFixed(1)}&deg; {pos.lng.toFixed(1)}&deg;
          </div>
        </div>
      </Html>
    </group>
  );
}

function SatelliteMarkers({ positions, focusSatId }: { positions: SatPosition[]; focusSatId?: string | null }) {
  return (
    <group>
      {positions.map(pos => (
        <SatelliteMarker key={pos.satId} pos={pos} focused={pos.satId === focusSatId} />
      ))}
    </group>
  );
}

// ---------- Footprint Circles ----------
function FootprintRings({ positions }: { positions: SatPosition[] }) {
  return (
    <group>
      {positions.map(pos => {
        const fpKm = footprintRadius(pos.alt, DEFAULT_MIN_ELEVATION_DEG);
        const angRad = fpKm / EARTH_RADIUS_KM;
        const points = sphereCirclePoints(pos.lat, pos.lng, angRad, 64);

        return (
          <Line
            key={pos.satId}
            points={points}
            color={SAT_COLOR}
            lineWidth={0.8}
            transparent
            opacity={0.25}
          />
        );
      })}
    </group>
  );
}

// ---------- Ground Tracks ----------
function GroundTracks({ trails, positions }: { trails: Map<string, { lat: number; lng: number }[]>; positions: SatPosition[] }) {
  return (
    <group>
      {Array.from(trails.entries()).map(([satId, trail]) => {
        if (trail.length < 2) return null;
        // Convert trail to 3D, splitting at large longitude jumps
        const segments: [number, number, number][][] = [[]];
        for (let i = 0; i < trail.length; i++) {
          if (i > 0 && Math.abs(trail[i].lng - trail[i - 1].lng) > 180) {
            segments.push([]); // start new segment
          }
          segments[segments.length - 1].push(latLngToVec3(trail[i].lat, trail[i].lng, R * 1.001));
        }

        return segments.map((seg, si) =>
          seg.length >= 2 ? (
            <Line
              key={`${satId}-${si}`}
              points={seg}
              color={SAT_COLOR}
              lineWidth={1}
              transparent
              opacity={0.35}
            />
          ) : null
        );
      })}
    </group>
  );
}

// ---------- Predicted Orbit Paths ----------
function PredictedTracks({ predictedPaths }: { predictedPaths: PredictedPath[] }) {
  // Split each path into continuous segments (break at antimeridian)
  const segments = useMemo(() => {
    const result: { points: [number, number, number][]; color: string }[] = [];

    for (const path of predictedPaths) {
      if (path.points.length < 2) continue;

      let current: [number, number, number][] = [latLngToVec3(path.points[0].lat, path.points[0].lng, R * 1.001)];

      for (let i = 1; i < path.points.length; i++) {
        const prev = path.points[i - 1];
        const curr = path.points[i];

        if (Math.abs(curr.lng - prev.lng) > 180) {
          // Antimeridian wrap — close current segment, start new one
          if (current.length >= 2) {
            result.push({ points: current, color: path.color });
          }
          current = [];
        }
        current.push(latLngToVec3(curr.lat, curr.lng, R * 1.001));
      }
      if (current.length >= 2) {
        result.push({ points: current, color: path.color });
      }
    }
    return result;
  }, [predictedPaths]);

  return (
    <group>
      {segments.map((seg, i) => (
        <Line
          key={i}
          points={seg.points}
          color={seg.color}
          lineWidth={1.5}
          transparent
          opacity={0.45}
          dashed
          dashSize={0.02}
          gapSize={0.015}
        />
      ))}
    </group>
  );
}

// ---------- LOS Lines ----------
function LOSLines({ positions, selectedAOI }: { positions: SatPosition[]; selectedAOI: AOIData | null }) {
  if (!selectedAOI?.hotspots) return null;

  const lines: { key: string; from: [number, number, number]; to: [number, number, number]; color: string }[] = [];

  for (const pos of positions) {
    const fp = footprintRadius(pos.alt, DEFAULT_MIN_ELEVATION_DEG);
    const satR = R + (pos.alt / EARTH_RADIUS_KM) * R * 2;

    for (let i = 0; i < selectedAOI.hotspots.length; i++) {
      const hs = selectedAOI.hotspots[i];
      const dlat = pos.lat - hs.lat;
      const dlng = pos.lng - hs.lng;
      if (Math.sqrt(dlat * dlat + dlng * dlng) * 111 < fp) {
        lines.push({
          key: `${pos.satId}-${i}`,
          from: latLngToVec3(pos.lat, pos.lng, satR),
          to: latLngToVec3(hs.lat, hs.lng, R * 1.004),
          color: SAT_COLOR,
        });
      }
    }
  }

  return (
    <group>
      {lines.map(l => (
        <Line key={l.key} points={[l.from, l.to]} color={l.color} lineWidth={0.5} transparent opacity={0.25} />
      ))}
    </group>
  );
}

// ---------- Globe Click Handler ----------
function GlobeClickHandler({ aois, onSelectAOI }: { aois: AOIData[]; onSelectAOI?: (aoi: AOIData) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = useCallback((e: any) => {
    if (!onSelectAOI) return;
    e.stopPropagation();
    const { x, y, z } = e.point;
    const { lat, lng } = vec3ToLatLng(x, y, z);

    let closest: AOIData | null = null;
    let closestDist = Infinity;
    for (const aoi of aois) {
      const dlat = lat - aoi.centroid.lat;
      const dlng = lng - aoi.centroid.lng;
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);
      if (dist < closestDist && dist < 20) {
        closestDist = dist;
        closest = aoi;
      }
    }
    if (closest) onSelectAOI(closest);
  }, [aois, onSelectAOI]);

  return (
    <mesh onClick={handleClick}>
      <sphereGeometry args={[R * 1.01, 64, 32]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

// ---------- Camera Animator ----------
function CameraAnimator({ selectedAOI }: { selectedAOI: AOIData | null }) {
  const { camera } = useThree();
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const prevAOI = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedAOI || selectedAOI.id === prevAOI.current) return;
    prevAOI.current = selectedAOI.id;

    // Compute target position: camera looking at AOI from 2.5x radius distance
    const aoiPos = new THREE.Vector3(...latLngToVec3(selectedAOI.centroid.lat, selectedAOI.centroid.lng, R));
    targetLookAt.current.copy(aoiPos);

    // Move camera to look at the AOI
    const cameraTarget = aoiPos.clone().normalize().multiplyScalar(2.8);
    // Add slight upward offset for perspective
    cameraTarget.y += 0.3;

    // Smooth animation using simple interpolation
    const startPos = camera.position.clone();
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic

      camera.position.lerpVectors(startPos, cameraTarget, eased);
      camera.lookAt(0, 0, 0);

      if (t < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [selectedAOI, camera]);

  return null;
}

// ---------- Fly-to a specific satellite ----------
function SatelliteCameraAnimator({
  focusSat,
  positions,
}: {
  focusSat: { satId: string; nonce: number } | null;
  positions: SatPosition[];
}) {
  const { camera } = useThree();
  const posRef = useRef(positions);
  posRef.current = positions;
  const prevNonce = useRef<number | null>(null);

  useEffect(() => {
    if (!focusSat || focusSat.nonce === prevNonce.current) return;
    prevNonce.current = focusSat.nonce;
    const sat = posRef.current.find((p) => p.satId === focusSat.satId);
    if (!sat) return;

    // Aim the camera at the satellite's current sub-point, zoomed in.
    const subpoint = new THREE.Vector3(...latLngToVec3(sat.lat, sat.lng, R));
    const cameraTarget = subpoint.clone().normalize().multiplyScalar(2.2);
    cameraTarget.y += 0.2;

    const startPos = camera.position.clone();
    const duration = 700;
    const startTime = Date.now();
    const animate = () => {
      const t = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(startPos, cameraTarget, eased);
      camera.lookAt(0, 0, 0);
      if (t < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [focusSat, camera]);

  return null;
}

// ---------- Slow Auto Rotation ----------
function AutoRotate() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02; // Very slow rotation
    }
  });

  return <group ref={groupRef} />;
}

// ---------- Main Scene ----------
interface SceneProps {
  positions: SatPosition[];
  trails: Map<string, { lat: number; lng: number }[]>;
  predictedPaths: PredictedPath[];
  aois: AOIData[];
  selectedAOI: AOIData | null;
  onSelectAOI?: (aoi: AOIData) => void;
  focusSat?: { satId: string; nonce: number } | null;
}

function GlobeScene({ positions, trails, predictedPaths, aois, selectedAOI, onSelectAOI, focusSat }: SceneProps) {
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch('/geo/world-110m.json')
      .then(r => r.json())
      .then(topology => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const countries = feature(topology as any, (topology as any).objects.countries);
        setGeoData(countries as unknown as GeoJSON.FeatureCollection);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      {/* Background */}
      <Stars radius={80} depth={50} count={2500} factor={3} saturation={0} fade speed={0.3} />
      <ambientLight intensity={0.1} />

      {/* Globe */}
      <Earth />
      <Atmosphere />
      <GlobeGrid />
      <InclinationBand />
      {geoData && <CountryBorders geoData={geoData} />}

      {/* Data overlays */}
      <AOIOverlays aois={aois} selectedAOI={selectedAOI} />
      <SatelliteMarkers positions={positions} focusSatId={focusSat?.satId ?? null} />
      <FootprintRings positions={positions} />
      <GroundTracks trails={trails} positions={positions} />
      <PredictedTracks predictedPaths={predictedPaths} />
      <LOSLines positions={positions} selectedAOI={selectedAOI} />

      {/* Interaction */}
      <GlobeClickHandler aois={aois} onSelectAOI={onSelectAOI} />
      <CameraAnimator selectedAOI={selectedAOI} />
      <SatelliteCameraAnimator focusSat={focusSat ?? null} positions={positions} />

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={1.4}
        maxDistance={5}
        enablePan={false}
        rotateSpeed={0.5}
      />
    </>
  );
}

// ---------- Exported Component ----------
interface Props {
  positions: SatPosition[];
  trails: Map<string, { lat: number; lng: number }[]>;
  predictedPaths: PredictedPath[];
  aois: AOIData[];
  selectedAOI: AOIData | null;
  onSelectAOI?: (aoi: AOIData) => void;
  focusSat?: { satId: string; nonce: number } | null;
}

export function GlobeView({ positions, trails, predictedPaths, aois, selectedAOI, onSelectAOI, focusSat }: Props) {
  return (
    <div className="w-full h-full" style={{ minHeight: 300 }}>
      <Canvas
        camera={{ position: [1.2, 0.8, 1.8], fov: 45, near: 0.01, far: 200 }}
        style={{ background: '#000005' }}
        gl={{ antialias: true, alpha: false }}
      >
        <GlobeScene
          positions={positions}
          trails={trails}
          predictedPaths={predictedPaths}
          aois={aois}
          selectedAOI={selectedAOI}
          onSelectAOI={onSelectAOI}
          focusSat={focusSat ?? null}
        />
      </Canvas>
    </div>
  );
}
