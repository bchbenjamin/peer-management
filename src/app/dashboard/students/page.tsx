'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Student = { id: string; name: string; usn: string; department: string; section: string; batch: number };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) setStudents(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleImportLocal = async () => {
    setImporting(true);
    setMessage('');
    try {
      const res = await fetch('/api/students/import', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Successfully imported ${data.count} students.`);
        fetchStudents();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed';
      setMessage(`Error: ${message}`);
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <div>Loading directory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] font-[var(--font-inter-variable)] font-medium">
          Student Directory
        </h2>
        <Button onClick={handleImportLocal} size="md" disabled={importing}>
          {importing ? 'Importing...' : 'Import from sample.json'}
        </Button>
      </div>

      {message && <div className="text-sm p-4 bg-[var(--surface-light-gray)] border border-[var(--color-light-gray)] rounded-[8px]">{message}</div>}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--surface-light-gray)] border-b border-[var(--color-light-gray)] text-sm text-[var(--color-silver-mist)] uppercase tracking-[var(--tracking-heading-sm)]">
              <th className="p-4 font-normal">USN</th>
              <th className="p-4 font-normal">Name</th>
              <th className="p-4 font-normal">Dept / Sec</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-[var(--color-silver-mist)]">No students found. Import them to begin.</td>
              </tr>
            ) : (
              students.map(s => (
                <tr key={s.id} className="border-b border-[var(--color-light-gray)] last:border-0">
                  <td className="p-4 font-medium">{s.usn}</td>
                  <td className="p-4">{s.name}</td>
                  <td className="p-4 text-sm text-[var(--color-silver-mist)]">{s.department} - {s.section}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
