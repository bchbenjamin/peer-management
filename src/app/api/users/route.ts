import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { Role } from '@/types';

export async function GET() {
  const session = await getSession();
  if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: { student: true },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { username, password, role, studentId } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role === Role.STUDENT && !studentId) {
      return NextResponse.json({ error: 'Student role requires mapping to a student profile' }, { status: 400 });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role: role as Role,
        studentId: role === Role.STUDENT ? studentId : null,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Create User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, newPassword } = await request.json();
    if (!id || !newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Valid user ID and password are required' }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    const user = await prisma.user.update({
      where: { id },
      data: { passwordHash, totpSecret: null, totpEnabled: false },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Reset User Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.mfaVerified || (session.role !== Role.COORDINATOR && !session.isMaster)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!session.isMaster && session.sub === id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
