import { NextResponse } from 'next/server';

import {
  filterAppointments,
  getUserFromToken,
  paginate,
} from '@/data/mock-db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
  const q = url.searchParams.get('q') ?? undefined;
  const state = url.searchParams.get('state') ?? undefined;
  const doctorId = url.searchParams.get('doctorId') ?? undefined;
  const specialtyId = url.searchParams.get('specialtyId') ?? undefined;
  const mine = url.searchParams.get('mine') === 'true';

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const user = getUserFromToken(token);

  const records = filterAppointments({
    q,
    state,
    doctorId,
    specialtyId,
    mine,
    patientId: mine
      ? user?.role === 'PATIENT'
        ? user.id
        : undefined
      : undefined,
  });

  const payload = paginate(records, Math.max(1, page), Math.max(1, pageSize));

  return NextResponse.json(payload);
}
