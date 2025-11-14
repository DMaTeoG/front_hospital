import { NextResponse } from 'next/server';

import { mockDb, paginate } from '@/data/mock-db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '20');

  const items = mockDb.patients.map((patient) => ({
    id: patient.id,
    name: patient.name,
    email: patient.email,
    status: patient.active ? 'Activo' : 'Inactivo',
  }));

  return NextResponse.json(paginate(items, page, pageSize));
}
