import { NextResponse } from 'next/server';

import { updateAppointment } from '@/data/mock-db';

export async function POST(
  _: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const updated = updateAppointment(id, { status: 'CANCELLED' });

  if (!updated) {
    return NextResponse.json({ detail: 'Cita no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
