'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export default function TwoFactorPage() {
  const router = useRouter();
  const [setupData, setSetupData] = useState<{ qrCodeUrl?: string, secret?: string, isMaster?: boolean, configured?: boolean, message?: string } | null>(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Fetch setup details
    fetch('/api/auth/totp/setup')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSetupData(data);
        } else {
          setError(data.error || 'Failed to initialize 2FA');
        }
      })
      .catch(() => setError('Failed to communicate with server'))
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/auth/totp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Success, go to dashboard
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[var(--color-storm-cloud)]">Loading security module...</div>;

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="p-6 md:p-8">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-buttons)] bg-[var(--color-neon-lime)] text-[var(--color-pitch-black)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[var(--text-heading)] leading-[var(--leading-heading)] tracking-[var(--tracking-heading)] font-[590]">
                Security Settings
              </h2>
              <p className="mt-1 text-sm text-[var(--color-storm-cloud)]">Verify or finish two-factor authentication for this account.</p>
            </div>
          </div>
          
          {error && <div className="text-[var(--color-warning-red)] mb-6 text-sm">{error}</div>}

          {setupData?.configured && setupData.message && (
            <div className="bg-[var(--color-deep-slate)] border border-[var(--color-charcoal-grey)] p-4 rounded-[var(--radius-cards)] mb-6">
              <p className="text-sm text-[var(--color-light-steel)]">{setupData.message}</p>
            </div>
          )}

          {setupData?.isMaster && setupData.message && (
            <div className="bg-[var(--color-deep-slate)] border border-[var(--color-charcoal-grey)] p-4 rounded-[var(--radius-cards)] mb-6">
              <p className="text-sm font-medium text-[var(--color-porcelain)] mb-2">Master Admin Action Required</p>
              <p className="text-sm text-[var(--color-storm-cloud)]">{setupData.message}</p>
              {setupData.secret && (
                <code className="block mt-4 p-3 bg-[var(--color-pitch-black)] border border-[var(--color-charcoal-grey)] rounded-[var(--radius-cards)] font-[var(--font-berkeley-mono)] text-center text-[17px] leading-[1.47] select-all">
                  {setupData.secret}
                </code>
              )}
            </div>
          )}

          {setupData?.qrCodeUrl && (
            <div className="flex flex-col items-center mb-8">
              <p className="text-[var(--color-storm-cloud)] text-sm text-center mb-4">
                Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).
              </p>
              <div className="bg-white p-2 rounded-[var(--radius-cards)] border border-[var(--color-charcoal-grey)]">
                <Image src={setupData.qrCodeUrl} alt="QR Code" width={200} height={200} />
              </div>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                className="text-center tracking-[0.5em] text-[17px] leading-[1.47] font-[var(--font-berkeley-mono)]"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="w-full" disabled={verifying || otp.length !== 6}>
              {verifying ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
