import { NextResponse } from 'next/server';

import { updateAppointment } from '@/data/mock-db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const body = await request.json();
  const { start, end } = body ?? {};

  if (!start || !end) {
    return NextResponse.json(
      { detail: 'Se requieren las fechas de inicio y fin' },
      { status: 400 },
    );
  }

  const [startDate, startTime] = start.split('T');
  const [, endTime] = end.split('T');

  const updated = updateAppointment(id, {
    date: startDate,
    startTime: startTime?.slice(0, 5),
    endTime: endTime?.slice(0, 5),
    status: 'CONFIRMED',
  });

  if (!updated) {
    return NextResponse.json({ detail: 'Cita no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
