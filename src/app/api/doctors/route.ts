import { NextResponse } from 'next/server';

import { mockDb, paginate } from '@/data/mock-db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '20');

  const items = mockDb.doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    email: doctor.email,
    status: doctor.active ? 'Activo' : 'Inactivo',
    specialty: doctor.specialty,
  }));

  return NextResponse.json(paginate(items, page, pageSize));
}
