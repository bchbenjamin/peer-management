import React from 'react';
import { Card } from '@/components/ui/card';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Role } from '@/types';

export default async function DashboardOverview() {
  const session = await getSession();
  if (!session) return null;

  if (session.role === Role.STUDENT) {
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      include: { student: true },
    });

    if (!user || !user.studentId) {
      return (
        <div className="space-y-6">
          <h2 className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] tracking-[var(--tracking-heading-sm)] font-[var(--font-inter-variable)] font-medium">
            Attendance Summary
          </h2>
          <Card className="p-6">
            <p className="text-[var(--color-silver-mist)]">No student mapping found for this account.</p>
          </Card>
        </div>
      );
    }

    const [totalSessions, presents, recentSessions] = await Promise.all([
      prisma.attendanceSession.count(),
      prisma.attendanceRecord.count({
        where: { studentId: user.studentId, present: true },
      }),
      prisma.attendanceSession.findMany({
        orderBy: { date: 'desc' },
        take: 8,
        include: {
          records: {
            where: { studentId: user.studentId },
            select: { present: true },
          },
        },
      }),
    ]);

    const percentage = totalSessions === 0 ? 0 : Math.round((presents / totalSessions) * 100);

    return (
      <div className="space-y-6">
        <h2 className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] tracking-[var(--tracking-heading-sm)] font-[var(--font-inter-variable)] font-medium">
          Attendance Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-sm text-[var(--color-silver-mist)] uppercase tracking-[var(--tracking-heading-sm)] mb-2">Total Sessions</h3>
            <p className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] font-light">{totalSessions}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm text-[var(--color-silver-mist)] uppercase tracking-[var(--tracking-heading-sm)] mb-2">Present</h3>
            <p className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] font-light">{presents}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm text-[var(--color-silver-mist)] uppercase tracking-[var(--tracking-heading-sm)] mb-2">Attendance %</h3>
            <p className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] font-light">{percentage}%</p>
          </Card>
        </div>
        <Card className="p-6">
          <h3 className="text-sm text-[var(--color-silver-mist)] uppercase tracking-[var(--tracking-heading-sm)] mb-4">Recent Sessions</h3>
          <div className="space-y-2">
            {recentSessions.length === 0 ? (
              <p className="text-[var(--color-silver-mist)] text-sm">No attendance sessions recorded yet.</p>
            ) : (
              recentSessions.map((sessionItem) => {
                const present = sessionItem.records[0]?.present ?? false;
                return (
                  <div key={sessionItem.id} className="flex items-center justify-between border border-[var(--color-light-gray)] px-3 py-2 rounded-[8px]">
                    <div>
                      <p className="text-sm">{sessionItem.title || 'Attendance Session'}</p>
                      <p className="text-xs text-[var(--color-silver-mist)]">
                        {new Date(sessionItem.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-2 rounded-[100px] border ${present ? 'border-[var(--color-graphite)] text-[var(--color-absolute-zero)]' : 'border-[var(--color-light-gray)] text-[var(--color-silver-mist)]'}`}>
                      {present ? 'Present' : 'Absent'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    );
  }

  const [studentCount, gdCount, attendanceCount] = await Promise.all([
    prisma.student.count(),
    prisma.gdSession.count(),
    prisma.attendanceSession.count(),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] tracking-[var(--tracking-heading-sm)] font-[var(--font-inter-variable)] font-medium">
        Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm text-[var(--color-silver-mist)] uppercase tracking-[var(--tracking-heading-sm)] mb-2">Total Students</h3>
          <p className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] font-light">{studentCount}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm text-[var(--color-silver-mist)] uppercase tracking-[var(--tracking-heading-sm)] mb-2">GD Sessions</h3>
          <p className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] font-light">{gdCount}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm text-[var(--color-silver-mist)] uppercase tracking-[var(--tracking-heading-sm)] mb-2">Attendance Sessions</h3>
          <p className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] font-light">{attendanceCount}</p>
        </Card>
      </div>
    </div>
  );
}
