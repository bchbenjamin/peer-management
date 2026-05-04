import { getSession } from '@/lib/session';
import { Role } from '@/types';
import GdCoordinator from './gd-coordinator';
import GdStudent from './gd-student';

export default async function GDPage() {
  const session = await getSession();

  if (session?.role === Role.STUDENT) {
    return <GdStudent />;
  }

  return <GdCoordinator />;
}
