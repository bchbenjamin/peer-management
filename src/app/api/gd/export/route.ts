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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return new NextResponse('Missing sessionId', { status: 400 });
    }

    const gdSession = await prisma.gdSession.findUnique({
      where: { id: sessionId },
      include: {
        batches: {
          orderBy: { batchNumber: 'asc' },
          include: {
            entries: {
              include: { student: true },
              orderBy: { student: { usn: 'asc' } }
            }
          }
        }
      }
    });

    if (!gdSession) return new NextResponse('Session not found', { status: 404 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('GD Evaluation');

    // Row 1: "Group Discussion Review" (merged across all active columns A-F)
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Group Discussion Review';
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Track current row
    let currentRow = 3;

    // Define columns width
    worksheet.columns = [
      { width: 8 },  // SL no
      { width: 25 }, // Name
      { width: 15 }, // USN
      { width: 15 }, // Department
      { width: 10 }, // Section
      { width: 50 }, // Remarks
    ];

    gdSession.batches.forEach((batch) => {
      // Row 2 (per batch): "Batch X Topic: [Topic Name]" (merged).
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const batchHeaderCell = worksheet.getCell(`A${currentRow}`);
      batchHeaderCell.value = `Batch ${batch.batchNumber} Topic: ${gdSession.topic}`;
      batchHeaderCell.font = { bold: true, size: 12 };
      batchHeaderCell.alignment = { vertical: 'middle' };
      batchHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
      
      currentRow++;

      // Row 3: Headers
      const headers = ['SL no', 'Name', 'USN', 'Department', 'Section', 'Remarks'];
      const headerRow = worksheet.getRow(currentRow);
      headerRow.values = headers;
      headerRow.font = { bold: true };
      
      currentRow++;

      // Data Rows
      batch.entries.forEach((entry, idx) => {
        const fullRemarks = [entry.remarks, ...entry.chips].filter(Boolean).join(' | ');
        const row = worksheet.getRow(currentRow);
        row.values = [
          idx + 1,
          entry.student.name,
          entry.student.usn,
          entry.student.department,
          entry.student.section,
          fullRemarks
        ];
        currentRow++;
      });

      // Add a blank row between batches
      currentRow++;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="GD_Evaluation_${gdSession.topic.replace(/\\s+/g, '_')}.xlsx"`
      }
    });

  } catch (error) {
    console.error('GD Export Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
