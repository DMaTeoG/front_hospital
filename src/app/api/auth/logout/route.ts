import { NextResponse } from 'next/server';

import { removeSession } from '@/data/mock-db';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (token) {
    removeSession(token);
  }
  return NextResponse.json({ ok: true });
}
