import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Role } from '@/types';

export async function GET() {
  const session = await getSession();
  if (!session?.mfaVerified) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== Role.STUDENT) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { student: true },
  });

  if (!user || !user.studentId) {
    return NextResponse.json({ error: 'No student mapping found' }, { status: 400 });
  }

  const entries = await prisma.gdEntry.findMany({
    where: { studentId: user.studentId },
    include: {
      batch: {
        include: { session: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const response = entries.map((entry) => ({
    sessionId: entry.batch.sessionId,
    topic: entry.batch.session.topic,
    date: entry.batch.session.date,
    batchNumber: entry.batch.batchNumber,
    remarks: entry.remarks,
    chips: entry.chips,
  }));

  return NextResponse.json(response);
}
