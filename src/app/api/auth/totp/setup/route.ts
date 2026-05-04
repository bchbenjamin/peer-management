import { NextResponse } from 'next/server';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { normalizeTotpSecret } from '@/lib/totp';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.isMaster) {
      // Master Account Flow
      const serviceName = 'Peer Management Platform';
      const envSecret = normalizeTotpSecret(process.env.MASTER_TOTP_SECRET);
      if (envSecret) {
        return NextResponse.json({
          success: true,
          configured: true,
          isMaster: true,
          message: 'Master two-factor authentication is configured. Enter your current authenticator code to continue.',
        });
      }

      const secret = envSecret || generateSecret();
      const otpauthUrl = generateURI({
        issuer: serviceName,
        label: process.env.MASTER_USER_ID || 'admin',
        secret,
      });
      const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

      return NextResponse.json({
        success: true,
        secret,
        qrCodeUrl,
        isMaster: true,
        message: 'Master account setup: add this secret as MASTER_TOTP_SECRET in your environment variables and restart or redeploy.',
      });
    }

    const secret = generateSecret();
    const serviceName = 'Peer Management Platform';

    // Normal User Flow
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.totpEnabled && user.totpSecret) {
      return NextResponse.json({
        success: true,
        isMaster: false,
        configured: true,
        message: 'Two-factor authentication is already configured. Enter a current code to continue.',
      });
    }

    // Save the new secret temporarily (could be encrypted in a prod app)
    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: secret },
    });

    const otpauthUrl = generateURI({
      issuer: serviceName,
      label: user.username,
      secret,
    });
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    return NextResponse.json({
      success: true,
      qrCodeUrl,
      isMaster: false,
    });

  } catch (error) {
    console.error('TOTP Setup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
