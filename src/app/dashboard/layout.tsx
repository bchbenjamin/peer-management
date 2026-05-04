import React from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { getSession } from '@/lib/session';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex h-screen bg-[var(--color-pitch-black)]">
      <Sidebar session={session} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--color-pitch-black)] p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
