import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/auth';
import { createSession } from '@/lib/session';
import { Role } from '@/types';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. Check Master Admin Flow
    if (
      username === process.env.MASTER_USER_ID &&
      password === process.env.MASTER_PASSWORD
    ) {
      const hasTotpSecret = !!process.env.MASTER_TOTP_SECRET;

      // Master accounts always require MFA verification after login.
      await createSession({
        sub: 'master',
        role: Role.COORDINATOR,
        isMaster: true,
        mfaVerified: false,
        mfaRequired: true,
      });

      return NextResponse.json({ success: true, isMaster: true, requiresMfa: true, mfaConfigured: hasTotpSecret });
    }

    // 2. Check DB Users Flow
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createSession({
      sub: user.id,
      role: user.role as Role,
      isMaster: false,
      mfaVerified: !user.totpEnabled,
      mfaRequired: user.totpEnabled,
    });

    return NextResponse.json({ success: true, isMaster: false, requiresMfa: true, mfaConfigured: user.totpEnabled });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
