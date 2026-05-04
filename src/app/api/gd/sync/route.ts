import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Role } from '@/types';

// The sync payload receives the full state of a GD Session from IndexedDB
type SyncPayload = {
  sessionId: string;
  topic: string;
  batches: Array<{
    id: string; // temporary or real id
    batchNumber: number;
    entries: Array<{
      studentId: string;
      remarks: string;
      chips: string[];
    }>;
  }>;
};

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payload: SyncPayload = await request.json();

    // Perform a transactional update
    // 1. Update session topic
    // 2. Delete all existing batches and entries for this session (destructive replace for simplicity)
    // 3. Re-create batches and entries
    // This ensures exact sync with offline state.

    await prisma.$transaction(async (tx) => {
      await tx.gdSession.update({
        where: { id: payload.sessionId },
        data: { topic: payload.topic },
      });

      await tx.gdBatch.deleteMany({
        where: { sessionId: payload.sessionId },
      });

      for (const batch of payload.batches) {
        const createdBatch = await tx.gdBatch.create({
          data: {
            sessionId: payload.sessionId,
            batchNumber: batch.batchNumber,
          }
        });

        if (batch.entries.length > 0) {
          await tx.gdEntry.createMany({
            data: batch.entries.map(entry => ({
              batchId: createdBatch.id,
              studentId: entry.studentId,
              remarks: entry.remarks,
              chips: entry.chips,
            })),
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GD Sync Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
