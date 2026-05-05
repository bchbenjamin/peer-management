import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Role } from '@/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (!session.isMaster && session.role !== Role.COORDINATOR)) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'trustedDeviceDuration' }
    });

    return NextResponse.json({ trustedDeviceDuration: setting ? parseInt(setting.value, 10) : 90 });
  } catch (error) {
    console.error('Fetch System Settings Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!session.isMaster && session.role !== Role.COORDINATOR)) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const { trustedDeviceDuration } = await request.json();

    if (typeof trustedDeviceDuration !== 'number' || trustedDeviceDuration < 1) {
      return new NextResponse('Invalid duration', { status: 400 });
    }

    await prisma.systemSetting.upsert({
      where: { key: 'trustedDeviceDuration' },
      update: { value: trustedDeviceDuration.toString() },
      create: { key: 'trustedDeviceDuration', value: trustedDeviceDuration.toString() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update System Settings Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
