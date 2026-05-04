'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

type Session = { id: string; topic: string; date: string; createdAt: string };

export default function GdCoordinator() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/gd');
      if (res.ok) setSessions(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      const res = await fetch('/api/gd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/gd/${data.session.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] font-[var(--font-inter-variable)] font-medium">
          Group Discussions
        </h2>
        <Button onClick={() => setShowForm(!showForm)} size="md">
          {showForm ? 'Cancel' : 'New Session'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-[var(--surface-light-gray)]">
          <h3 className="text-[var(--text-subheading)] leading-[var(--leading-subheading)] font-medium mb-4">Create New GD Session</h3>
          <form onSubmit={handleCreate} className="flex space-x-4 max-w-lg">
            <Input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Session Topic (e.g., AI in Healthcare)"
              required
            />
            <Button type="submit" size="md">Create</Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.length === 0 ? (
          <div className="col-span-full text-center text-[var(--color-silver-mist)] py-12">
            No sessions found. Create one to get started.
          </div>
        ) : (
          sessions.map(s => (
            <Card key={s.id} className="p-6 hover:border-[var(--color-graphite)] transition-colors">
              <h3 className="text-[var(--text-subheading)] leading-[var(--leading-subheading)] font-medium mb-2 truncate" title={s.topic}>{s.topic}</h3>
              <p className="text-sm text-[var(--color-silver-mist)] mb-4">
                {new Date(s.createdAt).toLocaleDateString()}
              </p>
              <div className="flex space-x-2">
                <Link href={`/dashboard/gd/${s.id}`} className="flex-1">
                  <Button variant="primary" size="md" className="w-full">Evaluate</Button>
                </Link>
                <a href={`/api/gd/export?sessionId=${s.id}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline-large" size="md">Export</Button>
                </a>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
