'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';

type StudentEntry = {
  sessionId: string;
  topic: string;
  date: string;
  batchNumber: number;
  remarks: string;
  chips: string[];
};

type SessionGroup = {
  sessionId: string;
  topic: string;
  date: string;
  entries: StudentEntry[];
};

export default function GdStudent() {
  const [entries, setEntries] = useState<StudentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gd/student')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEntries(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const sessions = useMemo(() => {
    const map = new Map<string, SessionGroup>();
    entries.forEach((entry) => {
      const existing = map.get(entry.sessionId);
      if (existing) {
        existing.entries.push(entry);
      } else {
        map.set(entry.sessionId, {
          sessionId: entry.sessionId,
          topic: entry.topic,
          date: entry.date,
          entries: [entry],
        });
      }
    });
    return Array.from(map.values());
  }, [entries]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] font-[var(--font-inter-variable)] font-medium">
        My GD Feedback
      </h2>

      {sessions.length === 0 ? (
        <Card className="p-6">
          <p className="text-[var(--color-silver-mist)]">No GD feedback available yet.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {sessions.map((session) => (
            <Card key={session.sessionId} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[var(--text-subheading)] leading-[var(--leading-subheading)] font-medium">{session.topic}</h3>
                  <p className="text-sm text-[var(--color-silver-mist)]">
                    {new Date(session.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {session.entries.map((entry, index) => (
                  <div key={`${entry.sessionId}-${index}`} className="border border-[var(--color-light-gray)] rounded-[8px] p-4">
                    <div className="text-sm text-[var(--color-silver-mist)] mb-2">Batch {entry.batchNumber}</div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {entry.chips.length === 0 ? (
                        <span className="text-xs text-[var(--color-silver-mist)]">No chips selected.</span>
                      ) : (
                        entry.chips.map((chip) => (
                          <span key={chip} className="text-xs px-3 py-2 rounded-[100px] border border-[var(--color-light-gray)] text-[var(--color-absolute-zero)]">
                            {chip}
                          </span>
                        ))
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-absolute-zero)]">
                      {entry.remarks || 'No additional remarks.'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
