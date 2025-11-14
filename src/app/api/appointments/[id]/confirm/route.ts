import { NextRequest, NextResponse } from 'next/server';

import { updateAppointment } from '@/data/mock-db';

export async function POST(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const numericId = Number(id);
  const updated = updateAppointment(numericId, { status: 'CONFIRMED' });

  if (!updated) {
    return NextResponse.json({ detail: 'Cita no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
