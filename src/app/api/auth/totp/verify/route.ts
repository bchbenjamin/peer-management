import { NextResponse } from 'next/server';
import { verify } from 'otplib';
import { getSession, createSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { normalizeTotpSecret, normalizeTotpToken } from '@/lib/totp';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json() as { token?: string };
    const cleanToken = normalizeTotpToken(token);

    if (session.isMaster) {
      // For master, verify against .env secret
      const envSecret = normalizeTotpSecret(process.env.MASTER_TOTP_SECRET);
      if (!envSecret) {
        // If they are verifying but no env secret exists, it means they are doing initial setup
        // and need to redeploy before they can actually verify.
        return NextResponse.json({ 
          error: 'Master TOTP Secret is not configured in the environment yet. Please add MASTER_TOTP_SECRET and redeploy.',
        }, { status: 400 });
      }

      const isValid = cleanToken ? verify({ token: cleanToken, secret: envSecret }) : false;
      if (!isValid) {
        return NextResponse.json({
          error: 'Invalid TOTP code. If you just edited .env, restart the dev server so MASTER_TOTP_SECRET is reloaded.',
        }, { status: 400 });
      }

      // Re-issue session with mfaVerified = true
      await createSession({
        ...session,
        mfaVerified: true,
        mfaRequired: true,
      });

      return NextResponse.json({ success: true });
    }

    // Normal User Flow
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user || !user.totpSecret) {
      return NextResponse.json({ error: 'User or secret not found' }, { status: 404 });
    }

    const isValid = cleanToken ? verify({ token: cleanToken, secret: normalizeTotpSecret(user.totpSecret) }) : false;
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid TOTP code' }, { status: 400 });
    }

    // Mark as enabled if it wasn't
    if (!user.totpEnabled) {
      await prisma.user.update({
        where: { id: user.id },
        data: { totpEnabled: true },
      });
    }

    // Re-issue session with mfaVerified = true
    await createSession({
      ...session,
      mfaVerified: true,
      mfaRequired: true,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('TOTP Verify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
