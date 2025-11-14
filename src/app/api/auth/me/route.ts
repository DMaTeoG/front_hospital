import { NextResponse } from 'next/server';

import { getUserFromToken } from '@/data/mock-db';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const user = getUserFromToken(token);

  if (!user) {
    return NextResponse.json({ detail: 'No autenticado' }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    active: user.active,
  });
}
