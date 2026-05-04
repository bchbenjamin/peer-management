'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.requiresMfa) {
        // Technically our backend doesn't handle the "enter OTP" flow during login in this simple setup.
        // The Next.js proxy redirects unverified users to the setup/verify page.
        // We just redirect to dashboard, and proxy will bounce them to /settings/2fa.
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-pitch-black)] p-4 text-[var(--color-porcelain)]">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--color-storm-cloud)] hover:text-[var(--color-porcelain)]">
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <Card className="p-6">
          <div className="mb-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center overflow-hidden rounded-[var(--radius-buttons)] border border-[var(--color-charcoal-grey)] bg-[var(--color-pitch-black)]">
              <Image src="/logo.png" alt="Peer Management Platform logo" width={40} height={40} className="h-full w-full object-contain" />
            </div>
            <h1 className="text-[var(--text-heading)] leading-[var(--leading-heading)] tracking-[var(--tracking-heading)] font-[590] mb-2">
              Secure Sign In
          </h1>
            <p className="text-[var(--color-storm-cloud)] text-[var(--text-body)] leading-[var(--leading-body)]">
              Access the peer management workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-[var(--color-porcelain)] text-sm border border-[var(--color-warning-red)]/60 rounded-[var(--radius-buttons)] px-3 py-2">
              {error}
            </div>
          )}
          
          <div>
            <Input
              dark
              type="text"
              placeholder="Username / USN"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Input
              dark
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
