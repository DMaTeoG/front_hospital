import { NextResponse } from 'next/server';

import { createSession, getUserFromToken } from '@/data/mock-db';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  const user = getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ detail: 'Sesión inválida' }, { status: 401 });
  }

  const newToken = createSession(user.id);
  return NextResponse.json({ access: newToken });
}
