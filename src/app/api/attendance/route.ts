import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Role } from '@/types';

type AttendanceRecordInput = {
  studentId: string;
  present: boolean;
};

const ATTENDANCE_SLOTS = [
  { id: 's1', label: 'Session 1', time: '8:45AM-10:45AM' },
  { id: 's2', label: 'Session 2', time: '11AM-1PM' },
  { id: 's3', label: 'Session 3', time: '2PM-4PM' },
];

function getSlotTitle(slotId: string, date: string) {
  const slot = ATTENDANCE_SLOTS.find((item) => item.id === slotId) || ATTENDANCE_SLOTS[0];
  return `${slot.label} (${slot.time}) - ${date}`;
}

export async function GET() {
  const session = await getSession();
  if (!session?.mfaVerified) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // For students, just return their own stats
  if (session.role === Role.STUDENT && session.sub) {
    const user = await prisma.user.findUnique({ where: { id: session.sub }, include: { student: true } });
    if (!user || !user.studentId) return NextResponse.json({ error: 'No student mapping' }, { status: 400 });

    const totalSessions = await prisma.attendanceSession.count();
    const presents = await prisma.attendanceRecord.count({
      where: { studentId: user.studentId, present: true }
    });

    const percentage = totalSessions === 0 ? 0 : Math.round((presents / totalSessions) * 100);

    return NextResponse.json({
      totalSessions,
      presents,
      percentage
    });
  }

  // For Co-ordinators, return the list of attendance sessions
  const sessions = await prisma.attendanceSession.findMany({
    orderBy: { date: 'desc' },
    include: {
      _count: {
        select: { records: true }
      }
    }
  });

  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, date, slotId, records } = await request.json() as {
      title?: string;
      slotId?: string;
      date: string;
      records: AttendanceRecordInput[];
    };
    // records: [{ studentId, present: boolean }]

    const sessionTitle = title || getSlotTitle(slotId || 's1', date);
    const sessionDate = new Date(`${date}T00:00:00.000Z`);
    const nextDate = new Date(sessionDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const newSession = await prisma.$transaction(async (tx) => {
      await tx.attendanceSession.deleteMany({
        where: {
          title: sessionTitle,
          date: {
            gte: sessionDate,
            lt: nextDate,
          },
        }
      });

      return tx.attendanceSession.create({
        data: {
          title: sessionTitle,
          date: sessionDate,
          records: {
            create: records.map((r) => ({
              studentId: r.studentId,
              present: r.present
            }))
          }
        }
      });
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (error) {
    console.error('Attendance submit error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
