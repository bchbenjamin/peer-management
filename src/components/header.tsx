'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, ShieldCheck } from 'lucide-react';

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-14 bg-[var(--color-pitch-black)]/95 border-b border-[var(--color-charcoal-grey)] flex items-center justify-between px-5">
      <div className="flex items-center gap-2 text-[12px] text-[var(--color-storm-cloud)]">
        <ShieldCheck className="h-[16px] w-[16px] text-[var(--color-neon-lime)]" />
        <span>Verified workspace</span>
      </div>
      <Button variant="ghost" onClick={handleLogout} className="text-[var(--color-storm-cloud)] hover:text-[var(--color-porcelain)]">
        <span>Sign Out</span>
        <LogOut className="h-[16px] w-[16px]" />
      </Button>
    </header>
  );
}
