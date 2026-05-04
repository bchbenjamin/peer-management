import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  GitBranch,
  Layers3,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { getSession } from '@/lib/session';

const metrics = [
  { label: 'Hourly sessions', value: '3/day', icon: Clock3 },
  { label: 'USN suffix search', value: '003', icon: Search },
  { label: 'Protected access', value: '2FA', icon: ShieldCheck },
];

const previewStudents = [
  { usn: '1AB24CD123', name: 'B C H Benjamin', present: true },
  { usn: '1EF24GF456', name: 'John Doe', present: false },
  { usn: '1IJ24KL789', name: 'Sarah Parker', present: true },
];

const features = [
  {
    eyebrow: '1.0 Attendance',
    title: 'Mark every session with the precision of a control room.',
    body: 'Three fixed time blocks per day keep attendance accurate without treating a full day as a single event.',
    icon: Clock3,
  },
  {
    eyebrow: '2.0 Evaluation',
    title: 'Capture GD feedback while the discussion is still moving.',
    body: 'Batch students, add repeatable comment chips, and sync the evaluation state back to the database.',
    icon: UsersRound,
  },
  {
    eyebrow: '3.0 Access',
    title: 'Keep operational data behind verified accounts.',
    body: 'Manual auth, role-based navigation, and TOTP verification protect coordinator workflows.',
    icon: LockKeyhole,
  },
];

const lanes = [
  ['08:45', 'Session 1', 'Attendance pass', 'Ready'],
  ['11:00', 'Session 2', 'Quick suffix lookup', 'Queued'],
  ['14:00', 'Session 3', 'Export review', 'Synced'],
];

export default async function Home() {
  const session = await getSession();
  if (session?.mfaVerified) redirect('/dashboard');
  if (session && !session.mfaVerified) redirect('/dashboard/settings/2fa');

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-pitch-black)] text-[var(--color-porcelain)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-charcoal-grey)] bg-[rgba(8,9,10,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-[20px] py-[14px]">
          <Link href="/" className="flex items-center gap-[10px]">
            <span className="flex h-[30px] w-[30px] items-center justify-center overflow-hidden rounded-[var(--radius-buttons)] border border-[var(--color-charcoal-grey)] bg-[var(--color-graphite)]">
              <Image src="/logo.png" alt="Peer Management Platform logo" width={30} height={30} className="h-full w-full object-contain" />
            </span>
            <span className="text-[14px] font-[590]">Peer Management Platform</span>
          </Link>
          <nav className="hidden items-center gap-[22px] text-[13px] text-[var(--color-storm-cloud)] md:flex">
            <a href="#attendance" className="hover:text-[var(--color-porcelain)]">Attendance</a>
            <a href="#workflow" className="hover:text-[var(--color-porcelain)]">Workflow</a>
            <a href="#security" className="hover:text-[var(--color-porcelain)]">Security</a>
          </nav>
          <Link
            href="/login"
            className="inline-flex items-center gap-[8px] rounded-[var(--radius-buttons)] bg-[var(--color-neon-lime)] px-[14px] py-[8px] text-[14px] font-[590] text-[var(--color-pitch-black)] shadow-[var(--shadow-subtle-3)]"
          >
            Sign In
            <ArrowRight className="h-[16px] w-[16px]" />
          </Link>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-57px)] max-w-[1180px] grid-cols-1 items-center gap-[40px] px-[20px] py-[56px] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="scroll-reveal-soft space-y-[24px]">
          <div className="inline-flex items-center gap-[8px] rounded-[var(--radius-tags)] border border-[var(--color-charcoal-grey)] bg-[var(--color-graphite)] px-[10px] py-[6px] text-[12px] text-[var(--color-light-steel)]">
            <Sparkles className="h-[14px] w-[14px] text-[var(--color-neon-lime)]" />
            Built for attendance, feedback, and account operations
          </div>
          <div className="space-y-[18px]">
            <h1 className="max-w-[760px] text-[48px] font-[590] leading-[1.02] tracking-[var(--tracking-heading-lg)] md:text-[72px]">
              The peer management system for focused teams.
            </h1>
            <p className="max-w-[560px] text-[16px] leading-[1.6] text-[var(--color-storm-cloud)]">
              A high-density operations workspace for hourly attendance, group discussion feedback, student records, and verified access.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-[10px]">
            <Link
              href="/login"
              className="inline-flex items-center gap-[8px] rounded-[var(--radius-buttons)] bg-[var(--color-neon-lime)] px-[18px] py-[11px] text-[14px] font-[590] text-[var(--color-pitch-black)]"
            >
              Open platform
              <ArrowRight className="h-[16px] w-[16px]" />
            </Link>
            <a href="#attendance" className="inline-flex items-center gap-[8px] rounded-[var(--radius-buttons)] border border-[var(--color-charcoal-grey)] bg-[var(--color-graphite)] px-[18px] py-[11px] text-[14px] font-[590] text-[var(--color-porcelain)]">
              See workflow
            </a>
          </div>
          <div className="grid max-w-[560px] grid-cols-3 gap-[8px] pt-[10px]">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-[var(--radius-cards)] border border-[var(--color-charcoal-grey)] bg-[var(--color-graphite)] p-[12px] shadow-[var(--shadow-sm)]">
                <metric.icon className="mb-[12px] h-[16px] w-[16px] text-[var(--color-neon-lime)]" />
                <div className="font-[var(--font-berkeley-mono)] text-[20px] leading-none">{metric.value}</div>
                <div className="mt-[8px] text-[11px] text-[var(--color-storm-cloud)]">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="scroll-reveal relative">
          <div className="float-panel absolute right-[18px] top-[-28px] hidden w-[220px] rounded-[var(--radius-cards)] border border-[var(--color-charcoal-grey)] bg-[var(--color-graphite)] p-[12px] shadow-[var(--shadow-xl)] md:block">
            <div className="mb-[10px] flex items-center gap-[8px] text-[12px] text-[var(--color-light-steel)]">
              <CheckCircle2 className="h-[14px] w-[14px] text-[var(--color-neon-lime)]" />
              Autosaved locally
            </div>
            <div className="h-[6px] rounded-full bg-[var(--color-gunmetal)]">
              <div className="h-full w-[74%] rounded-full bg-[var(--color-neon-lime)]" />
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[var(--color-charcoal-grey)] bg-[var(--color-deep-slate)] p-[12px] shadow-[var(--shadow-xl)]">
            <div className="rounded-[var(--radius-cards)] border border-[var(--color-charcoal-grey)] bg-[var(--color-pitch-black)]">
              <div className="flex items-center justify-between border-b border-[var(--color-charcoal-grey)] px-[16px] py-[12px]">
                <div className="flex items-center gap-[8px] text-[13px] text-[var(--color-light-steel)]">
                  <UsersRound className="h-[16px] w-[16px] text-[var(--color-neon-lime)]" />
                  Attendance Console
                </div>
                <div className="font-[var(--font-berkeley-mono)] text-[12px] text-[var(--color-fog-grey)]">04-05-2026</div>
              </div>
              <div className="grid gap-[12px] p-[16px] md:grid-cols-[210px_1fr]">
                <div className="space-y-[8px]">
                  {['8:45AM-10:45AM', '11AM-1PM', '2PM-4PM'].map((slot, index) => (
                    <div key={slot} className={`rounded-[var(--radius-tags)] border px-[12px] py-[10px] text-[13px] ${index === 0 ? 'border-[var(--color-neon-lime)] bg-[color-mix(in_srgb,var(--color-neon-lime)_12%,transparent)] text-[var(--color-porcelain)]' : 'border-[var(--color-charcoal-grey)] bg-[var(--color-graphite)] text-[var(--color-storm-cloud)]'}`}>
                      Session {index + 1}
                      <span className="block font-[var(--font-berkeley-mono)] text-[11px]">{slot}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-[8px]">
                  <div className="flex items-center gap-[8px] rounded-[var(--radius-inputs)] border border-[var(--color-charcoal-grey)] bg-[var(--color-gunmetal)] px-[12px] py-[10px] text-[13px] text-[var(--color-light-steel)]">
                    <Search className="h-[14px] w-[14px]" />
                    Search name or last 3 USN digits
                  </div>
                  {previewStudents.map(({ usn, name, present }) => (
                    <div key={usn} className="flex items-center justify-between rounded-[var(--radius-cards)] border border-[var(--color-charcoal-grey)] bg-[var(--color-graphite)] p-[12px]">
                      <div>
                        <div className="text-[14px] font-[510]">{name}</div>
                        <div className="font-[var(--font-berkeley-mono)] text-[12px] text-[var(--color-storm-cloud)]">{usn}</div>
                      </div>
                      <span className={`rounded-[var(--radius-badges)] px-[8px] py-[4px] text-[11px] ${present ? 'bg-[var(--color-neon-lime)] text-[var(--color-pitch-black)]' : 'bg-[var(--color-gunmetal)] text-[var(--color-storm-cloud)]'}`}>
                        {present ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="attendance" className="mx-auto max-w-[1180px] px-[20px] py-[96px]">
        <div className="scroll-reveal-soft mb-[28px] max-w-[720px]">
          <div className="mb-[12px] text-[12px] uppercase text-[var(--color-fog-grey)]">A new operating rhythm</div>
          <h2 className="text-[36px] font-[590] leading-[1.15] tracking-[var(--tracking-heading-lg)] md:text-[48px]">
            Replace daily guesswork with session-level clarity.
          </h2>
        </div>
        <div className="grid gap-[12px] lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.eyebrow} className="scroll-reveal rounded-[var(--radius-cards)] border border-[var(--color-charcoal-grey)] bg-[var(--color-graphite)] p-[18px] shadow-[var(--shadow-sm)]">
              <feature.icon className="mb-[30px] h-[18px] w-[18px] text-[var(--color-neon-lime)]" />
              <div className="mb-[10px] font-[var(--font-berkeley-mono)] text-[12px] text-[var(--color-fog-grey)]">{feature.eyebrow}</div>
              <h3 className="mb-[10px] text-[18px] font-[590] leading-[1.35]">{feature.title}</h3>
              <p className="text-[14px] leading-[1.55] text-[var(--color-storm-cloud)]">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="border-y border-[var(--color-charcoal-grey)] bg-[var(--color-graphite)]/55">
        <div className="mx-auto grid max-w-[1180px] gap-[28px] px-[20px] py-[96px] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="scroll-reveal-soft">
            <div className="mb-[12px] text-[12px] uppercase text-[var(--color-fog-grey)]">Workflow lanes</div>
            <h2 className="mb-[16px] text-[36px] font-[590] leading-[1.16] tracking-[var(--tracking-heading-lg)]">
              Each session moves through one quiet system.
            </h2>
            <p className="max-w-[440px] text-[15px] leading-[1.6] text-[var(--color-storm-cloud)]">
              Mark attendance, evaluate discussions, and export reports from surfaces that share the same records and access rules.
            </p>
          </div>
          <div className="scroll-reveal rounded-[var(--radius-xl)] border border-[var(--color-charcoal-grey)] bg-[var(--color-pitch-black)] p-[12px] shadow-[var(--shadow-xl)]">
            <div className="grid grid-cols-[90px_1fr_150px_90px] border-b border-[var(--color-charcoal-grey)] px-[12px] py-[10px] text-[11px] uppercase text-[var(--color-fog-grey)]">
              <span>Time</span>
              <span>Block</span>
              <span>Action</span>
              <span>Status</span>
            </div>
            {lanes.map(([time, block, action, status], index) => (
              <div key={block} className="grid grid-cols-[90px_1fr_150px_90px] items-center border-b border-[var(--color-charcoal-grey)] px-[12px] py-[14px] last:border-b-0">
                <span className="font-[var(--font-berkeley-mono)] text-[12px] text-[var(--color-storm-cloud)]">{time}</span>
                <span className="text-[14px] font-[510]">{block}</span>
                <span className="text-[13px] text-[var(--color-storm-cloud)]">{action}</span>
                <span className={`w-fit rounded-[var(--radius-badges)] px-[8px] py-[4px] text-[11px] ${index === 0 ? 'bg-[var(--color-neon-lime)] text-[var(--color-pitch-black)]' : 'bg-[var(--color-gunmetal)] text-[var(--color-storm-cloud)]'}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-[1180px] px-[20px] py-[96px]">
        <div className="scroll-reveal grid gap-[16px] rounded-[var(--radius-xl)] border border-[var(--color-charcoal-grey)] bg-[var(--color-deep-slate)] p-[18px] shadow-[var(--shadow-xl)] lg:grid-cols-[1fr_360px]">
          <div className="p-[18px]">
            <div className="mb-[12px] flex items-center gap-[8px] text-[12px] uppercase text-[var(--color-fog-grey)]">
              <GitBranch className="h-[14px] w-[14px] text-[var(--color-neon-lime)]" />
              Connected modules
            </div>
            <h2 className="mb-[16px] max-w-[640px] text-[36px] font-[590] leading-[1.15] tracking-[var(--tracking-heading-lg)]">
              Built as a platform, not a collection of disconnected screens.
            </h2>
            <p className="max-w-[620px] text-[15px] leading-[1.6] text-[var(--color-storm-cloud)]">
              Attendance records, GD feedback, account roles, and exports share one consistent command interface with verified access as the baseline.
            </p>
          </div>
          <div className="rounded-[var(--radius-cards)] border border-[var(--color-charcoal-grey)] bg-[var(--color-pitch-black)] p-[14px]">
            {[
              ['Attendance', 'Session records'],
              ['GD feedback', 'Offline-first sync'],
              ['Accounts', 'Role-gated access'],
              ['Exports', 'Excel reports'],
            ].map(([name, detail]) => (
              <div key={name} className="flex items-center gap-[10px] border-b border-[var(--color-charcoal-grey)] py-[11px] last:border-b-0">
                <Layers3 className="h-[15px] w-[15px] text-[var(--color-neon-lime)]" />
                <div>
                  <div className="text-[14px] font-[510]">{name}</div>
                  <div className="text-[12px] text-[var(--color-storm-cloud)]">{detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--color-charcoal-grey)]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-[12px] px-[20px] py-[28px] text-[12px] text-[var(--color-fog-grey)] md:flex-row md:items-center md:justify-between">
          <span>Peer Management Platform</span>
          <Link href="/login" className="text-[var(--color-light-steel)] hover:text-[var(--color-porcelain)]">Sign in</Link>
        </div>
      </footer>
    </main>
  );
}
