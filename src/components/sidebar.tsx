'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UsersRound, Settings, CheckSquare, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Role, SessionPayload } from '@/types';

// Normally we'd fetch the user role to hide admin routes,
// but for simplicity in the UI, we'll show them. The API and Middleware will block access anyway.
// A more robust app would fetch session state here.

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: [Role.COORDINATOR, Role.STUDENT] },
  { href: '/dashboard/attendance', label: 'Attendance Tracker', icon: CheckSquare, roles: [Role.COORDINATOR] },
  { href: '/dashboard/gd', label: 'GD Sessions', icon: UsersRound, roles: [Role.COORDINATOR, Role.STUDENT] },
  { href: '/dashboard/students', label: 'Student Directory', icon: Users, roles: [Role.COORDINATOR] },
  { href: '/dashboard/users', label: 'User Accounts', icon: Settings, roles: [Role.COORDINATOR] },
  { href: '/dashboard/settings', label: 'Settings', icon: SlidersHorizontal, roles: [Role.COORDINATOR, Role.STUDENT] },
];

type SidebarProps = {
  session: SessionPayload | null;
};

export default function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const role = session?.role;
  const items = role ? NAV_ITEMS.filter((item) => item.roles.includes(role)) : NAV_ITEMS;

  return (
    <aside className="w-[280px] shrink-0 bg-[var(--color-graphite)] text-[var(--color-porcelain)] flex flex-col h-full border-r border-[var(--color-charcoal-grey)] shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-3 p-5 border-b border-[var(--color-charcoal-grey)]">
        <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-buttons)] border border-[var(--color-charcoal-grey)] bg-[var(--color-pitch-black)]">
          <Image src="/logo.png" alt="Peer Management Platform logo" width={36} height={36} className="h-full w-full object-contain" />
        </div>
        <div>
          <div className="text-[10px] uppercase text-[var(--color-fog-grey)] mb-1">Peer Management</div>
          <h1 className="font-[var(--font-inter-variable)] font-[590] text-[17px] leading-[1.35]">
            Platform Console
          </h1>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-tags)] transition-colors text-[14px] ${
                isActive
                  ? 'bg-[var(--color-deep-slate)] text-[var(--color-porcelain)] shadow-[var(--shadow-md)]'
                  : 'text-[var(--color-storm-cloud)] hover:bg-[var(--color-deep-slate)] hover:text-[var(--color-porcelain)]'
              }`}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span className="min-w-0 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[var(--color-charcoal-grey)]">
        <Link href="/dashboard/settings/2fa" className="flex items-center justify-center gap-2 text-sm text-[var(--color-light-steel)] hover:text-[var(--color-porcelain)] hover:bg-[var(--color-deep-slate)] transition-colors rounded-[var(--radius-buttons)] py-2">
          <ShieldCheck className="h-[16px] w-[16px] shrink-0" />
          <span>Security Settings</span>
        </Link>
      </div>
    </aside>
  );
}
