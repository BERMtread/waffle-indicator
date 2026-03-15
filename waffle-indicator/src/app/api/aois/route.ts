import { NextResponse } from 'next/server';
import { ALL_AOIS } from '@/lib/geo/aoi-data';

export async function GET() {
  return NextResponse.json({
    aois: ALL_AOIS.map(aoi => ({
      id: aoi.id,
      name: aoi.name,
      displayName: aoi.displayName,
      country: aoi.country,
      region: aoi.region,
      priority: aoi.priority,
      category: aoi.category,
      color: aoi.color,
      coverageQuality: aoi.coverageQuality,
      centroid: aoi.centroid,
      hotspotCount: aoi.hotspots?.length ?? 0,
    })),
    count: ALL_AOIS.length,
  });
}
