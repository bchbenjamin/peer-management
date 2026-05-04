export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Role } from '@/types';
import ExcelJS from 'exceljs';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const thresholdStr = searchParams.get('threshold');
    const threshold = thresholdStr ? parseInt(thresholdStr, 10) : null;

    const students = await prisma.student.findMany({
      orderBy: { usn: 'asc' },
    });

    const totalSessions = await prisma.attendanceSession.count();
    
    // Group attendance counts
    const attendanceGroup = await prisma.attendanceRecord.groupBy({
      by: ['studentId'],
      where: { present: true },
      _count: { studentId: true }
    });

    const attendanceMap = new Map(attendanceGroup.map(g => [g.studentId, g._count.studentId]));

    const workbook = new ExcelJS.Workbook();
    const worksheetName = threshold ? `Attendance Below ${threshold}%` : 'Full Attendance';
    const worksheet = workbook.addWorksheet(worksheetName);

    // Headers
    worksheet.columns = [
      { header: 'SL No', key: 'sl', width: 8 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'USN', key: 'usn', width: 15 },
      { header: 'Department', key: 'dept', width: 15 },
      { header: 'Section', key: 'sec', width: 10 },
      { header: 'Total Sessions', key: 'total', width: 15 },
      { header: 'Present', key: 'present', width: 10 },
      { header: 'Attendance %', key: 'percent', width: 15 },
    ];

    let slNo = 1;
    students.forEach((student) => {
      const presents = attendanceMap.get(student.id) || 0;
      const percentage = totalSessions === 0 ? 0 : Math.round((presents / totalSessions) * 100);

      // Filter by threshold if provided
      if (threshold === null || percentage < threshold) {
        worksheet.addRow({
          sl: slNo++,
          name: student.name,
          usn: student.usn,
          dept: student.department,
          sec: student.section,
          total: totalSessions,
          present: presents,
          percent: `${percentage}%`
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Attendance_Report_${Date.now()}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Attendance Export Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
