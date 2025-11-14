import { NextResponse } from 'next/server';

import { createSession, findUserByEmail } from '@/data/mock-db';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body ?? {};

  if (!email || !password) {
    return NextResponse.json(
      { detail: 'Email y contraseña son requeridos' },
      { status: 400 },
    );
  }

  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    return NextResponse.json({ detail: 'Credenciales inválidas' }, { status: 401 });
  }

  const token = createSession(user.id);

  return NextResponse.json({
    access: token,
  });
}
