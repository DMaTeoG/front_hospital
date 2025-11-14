import { NextResponse } from 'next/server';

import { calculateMetrics } from '@/data/mock-db';

export async function GET() {
  const metrics = calculateMetrics();
  return NextResponse.json(metrics);
}
