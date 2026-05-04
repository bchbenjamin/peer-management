import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Role } from '@/types';

export async function GET() {
  const session = await getSession();
  if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const sessions = await prisma.gdSession.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { topic } = await request.json();
    if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 });

    const gdSession = await prisma.gdSession.create({
      data: { topic },
    });

    return NextResponse.json({ success: true, session: gdSession });
  } catch {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
