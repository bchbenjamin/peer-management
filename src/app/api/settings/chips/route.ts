import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Role } from '@/types';

export async function GET() {
  const session = await getSession();
  if (!session?.mfaVerified) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const chips = await prisma.commentChip.findMany({
    orderBy: { order: 'asc' }
  });

  return NextResponse.json(chips);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { label } = await request.json();
    if (!label) return NextResponse.json({ error: 'Label required' }, { status: 400 });

    const maxOrder = await prisma.commentChip.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? 0) + 1;

    const chip = await prisma.commentChip.create({
      data: { label, order: nextOrder },
    });

    return NextResponse.json({ success: true, chip });
  } catch {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.commentChip.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
