'use client';

import { useRef, useEffect, useCallback } from 'react';
import { type SatPosition } from '@/lib/orbital/propagator';
import { type PredictedPath } from '@/hooks/useOrbitalPropagation';
import { type AOIData } from '@/lib/geo/aoi-data';
import { footprintRadius } from '@/lib/geo/coverage-check';
import { DEFAULT_MIN_ELEVATION_DEG } from '@/lib/orbital/constants';

interface Props {
  positions: SatPosition[];
  trails: Map<string, { lat: number; lng: number }[]>;
  predictedPaths: PredictedPath[];
  aois: AOIData[];
  selectedAOI: AOIData | null;
  onSelectAOI?: (aoi: AOIData) => void;
  width?: number;
  height?: number;
}

// Equirectangular projection
function lngToX(lng: number, w: number): number {
  return ((lng + 180) / 360) * w;
}
function latToY(lat: number, h: number): number {
  return ((90 - lat) / 180) * h;
}

export function GroundTrackCanvas({
  positions,
  trails,
  predictedPaths,
  aois,
  selectedAOI,
  onSelectAOI,
  width = 900,
  height = 450,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#0f0f0f';
    ctx.lineWidth = 0.5;
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = latToY(lat, h);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let lng = -150; lng <= 150; lng += 30) {
      const x = lngToX(lng, w);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Inclination band (53 degrees)
    const incTop = latToY(53, h);
    const incBot = latToY(-53, h);
    ctx.fillStyle = 'rgba(68, 136, 255, 0.03)';
    ctx.fillRect(0, incTop, w, incBot - incTop);
    ctx.strokeStyle = 'rgba(68, 136, 255, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, incTop);
    ctx.lineTo(w, incTop);
    ctx.moveTo(0, incBot);
    ctx.lineTo(w, incBot);
    ctx.stroke();
    ctx.setLineDash([]);

    // Equator
    const eqY = latToY(0, h);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, eqY);
    ctx.lineTo(w, eqY);
    ctx.stroke();

    // Draw AOI polygons
    for (const aoi of aois) {
      const isSelected = selectedAOI?.id === aoi.id;
      const alpha = isSelected ? 0.25 : 0.08;
      const borderAlpha = isSelected ? 0.8 : 0.3;

      // Fill
      ctx.fillStyle = aoi.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      for (let i = 0; i < aoi.boundary.length; i++) {
        const [lat, lng] = aoi.boundary[i];
        const x = lngToX(lng, w);
        const y = latToY(lat, h);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Border
      ctx.strokeStyle = aoi.color + Math.round(borderAlpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = isSelected ? 1.5 : 0.8;
      ctx.stroke();

      // Label for selected or Tier 1
      if (isSelected || aoi.priority === 1) {
        const cx = lngToX(aoi.centroid.lng, w);
        const cy = latToY(aoi.centroid.lat, h);
        ctx.font = `${isSelected ? 'bold ' : ''}${isSelected ? 9 : 7}px monospace`;
        ctx.fillStyle = isSelected ? aoi.color : aoi.color + '99';
        ctx.textAlign = 'center';
        ctx.fillText(aoi.name, cx, cy + 3);
      }

      // Hotspot markers (if selected)
      if (isSelected && aoi.hotspots) {
        for (const hs of aoi.hotspots) {
          const hx = lngToX(hs.lng, w);
          const hy = latToY(hs.lat, h);
          const hsColor = hs.type === 'nuclear' ? '#FF0040' :
                          hs.type === 'military' || hs.type === 'command' ? '#FF6B00' :
                          hs.type === 'naval' || hs.type === 'airbase' ? '#4488FF' : '#FFB800';

          // Diamond marker
          ctx.fillStyle = hsColor;
          ctx.beginPath();
          ctx.moveTo(hx, hy - 3);
          ctx.lineTo(hx + 2, hy);
          ctx.lineTo(hx, hy + 3);
          ctx.lineTo(hx - 2, hy);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Draw satellite footprint circles for in-range sats
    for (const pos of positions) {
      const fp = footprintRadius(pos.alt, DEFAULT_MIN_ELEVATION_DEG);
      const fpDegLat = fp / 111;
      const fpDegLng = fp / (111 * Math.cos(pos.lat * Math.PI / 180));

      // Footprint ellipse
      const cx = lngToX(pos.lng, w);
      const cy = latToY(pos.lat, h);
      const rx = (fpDegLng / 360) * w;
      const ry = (fpDegLat / 180) * h;

      ctx.strokeStyle = pos.color + '40';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Footprint fill (very subtle)
      ctx.fillStyle = pos.color + '08';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw ground tracks (trails)
    for (const [satId, trail] of trails) {
      if (trail.length < 2) continue;
      const pos = positions.find(p => p.satId === satId);
      const color = pos?.color || '#ffffff';

      for (let i = 1; i < trail.length; i++) {
        const prev = trail[i - 1];
        const curr = trail[i];

        // Skip if wrapping around the map
        if (Math.abs(curr.lng - prev.lng) > 180) continue;

        const alpha = (i / trail.length) * 0.6;
        ctx.strokeStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lngToX(prev.lng, w), latToY(prev.lat, h));
        ctx.lineTo(lngToX(curr.lng, w), latToY(curr.lat, h));
        ctx.stroke();
      }
    }

    // Draw predicted orbit paths (forward ground tracks)
    for (const path of predictedPaths) {
      if (path.points.length < 2) continue;

      for (let i = 1; i < path.points.length; i++) {
        const prev = path.points[i - 1];
        const curr = path.points[i];

        // Skip antimeridian wraps
        if (Math.abs(curr.lng - prev.lng) > 180) continue;

        const t = i / path.points.length;
        const alpha = 0.4 * (1 - t * 0.7); // Fade from 0.4 to ~0.12

        // Dashed effect: draw every other 2-point segment
        if (Math.floor(i / 2) % 2 === 0) {
          ctx.strokeStyle = path.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(lngToX(prev.lng, w), latToY(prev.lat, h));
          ctx.lineTo(lngToX(curr.lng, w), latToY(curr.lat, h));
          ctx.stroke();
        }
      }
    }

    // Draw LOS lines from satellites to hotspots (if selected AOI)
    if (selectedAOI?.hotspots) {
      for (const pos of positions) {
        const fp = footprintRadius(pos.alt, DEFAULT_MIN_ELEVATION_DEG);
        for (const hs of selectedAOI.hotspots) {
          // Simple distance check
          const dlat = pos.lat - hs.lat;
          const dlng = pos.lng - hs.lng;
          const approxDist = Math.sqrt(dlat * dlat + dlng * dlng) * 111;
          if (approxDist < fp) {
            const sx = lngToX(pos.lng, w);
            const sy = latToY(pos.lat, h);
            const hx = lngToX(hs.lng, w);
            const hy = latToY(hs.lat, h);

            ctx.strokeStyle = pos.color + '30';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(hx, hy);
            ctx.stroke();
          }
        }
      }
    }

    // Draw satellite positions (on top)
    for (const pos of positions) {
      const x = lngToX(pos.lng, w);
      const y = latToY(pos.lat, h);

      // Glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
      gradient.addColorStop(0, pos.color + '60');
      gradient.addColorStop(1, pos.color + '00');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - 8, y - 8, 16, 16);

      // Dot
      ctx.fillStyle = pos.color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = pos.color;
      ctx.textAlign = 'left';
      ctx.fillText(pos.satId.toUpperCase(), x + 6, y - 4);

      // Coords
      ctx.font = '7px monospace';
      ctx.fillStyle = '#6b82a6';
      ctx.fillText(
        `${pos.lat.toFixed(1)}° ${pos.lng.toFixed(1)}°`,
        x + 6,
        y + 5
      );
    }
  }, [positions, trails, predictedPaths, aois, selectedAOI]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Handle click on AOI
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onSelectAOI) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      // Convert back to lat/lng
      const lng = (mx / canvas.width) * 360 - 180;
      const lat = 90 - (my / canvas.height) * 180;

      // Find closest AOI centroid
      let closest: AOIData | null = null;
      let closestDist = Infinity;
      for (const aoi of aois) {
        const dx = lng - aoi.centroid.lng;
        const dy = lat - aoi.centroid.lat;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist && dist < 15) {
          closestDist = dist;
          closest = aoi;
        }
      }
      if (closest) onSelectAOI(closest);
    },
    [aois, onSelectAOI]
  );

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full rounded-sm cursor-crosshair"
      style={{ imageRendering: 'pixelated' }}
      onClick={handleClick}
    />
  );
}
