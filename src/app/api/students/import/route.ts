import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Role } from '@/types';

import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      // If no JSON body, try reading the local sample.json
      const filePath = path.join(process.cwd(), 'sample.json');
      if (fs.existsSync(filePath)) {
        payload = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } else {
        return NextResponse.json({ error: 'No payload provided and sample.json not found' }, { status: 400 });
      }
    }

    // Handling sample.json format
    if (payload.Name && payload.USN && Array.isArray(payload.Name) && Array.isArray(payload.USN)) {
      if (payload.Name.length !== payload.USN.length) {
        return NextResponse.json({ error: 'Name and USN arrays length mismatch' }, { status: 400 });
      }

      const createData = payload.Name.map((name: string, index: number) => ({
        name,
        usn: payload.USN[index],
        department: 'CSE',
        section: 'A',
        batch: 2028
      }));

      // Prisma createMany ignores duplicates with skipDuplicates
      const result = await prisma.student.createMany({
        data: createData,
        skipDuplicates: true,
      });

      return NextResponse.json({ success: true, count: result.count });
    }

    return NextResponse.json({ error: 'Invalid JSON format. Expected Name and USN arrays.' }, { status: 400 });

  } catch (error) {
    console.error('Import Students Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const students = await prisma.student.findMany({
    orderBy: { usn: 'asc' }
  });

  return NextResponse.json(students);
}
