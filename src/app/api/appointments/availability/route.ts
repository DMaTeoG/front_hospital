import { NextResponse } from 'next/server';

import { toScheduleEvents } from '@/data/mock-db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const doctorId = url.searchParams.get('doctor_id');
  const date = url.searchParams.get('date') ?? undefined;
  const events = toScheduleEvents(doctorId ? Number(doctorId) : undefined, date);
  return NextResponse.json({ events });
}
