import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Role } from '@/types';

export async function GET() {
  const session = await getSession();
  if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const students = await prisma.student.findMany({
    orderBy: { usn: 'asc' },
  });

  return NextResponse.json(students);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, usn, department, section, batch } = await request.json();
    if (!name || !usn) {
      return NextResponse.json({ error: 'Name and USN are required' }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        name,
        usn,
        department: department || 'CSE',
        section: section || 'A',
        batch: batch || 2028,
      },
    });

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error('Create Student Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
