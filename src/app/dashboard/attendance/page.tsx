'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckSquare, Square, Download, Search } from 'lucide-react';

type Student = { id: string; name: string; usn: string };
type AttendanceMap = Record<string, boolean>;

const ATTENDANCE_SLOTS = [
  { id: 's1', label: 'Session 1', time: '8:45AM-10:45AM' },
  { id: 's2', label: 'Session 2', time: '11AM-1PM' },
  { id: 's3', label: 'Session 3', time: '2PM-4PM' },
];

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotId, setSlotId] = useState(ATTENDANCE_SLOTS[0].id);
  const [threshold, setThreshold] = useState('75');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
          const initialMap: AttendanceMap = {};
          data.forEach(s => initialMap[s.id] = false);
          setAttendance(initialMap);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleAll = (present: boolean) => {
    const newMap: AttendanceMap = {};
    students.forEach(s => newMap[s.id] = present);
    setAttendance(newMap);
  };

  const toggleStudent = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const records = students.map(s => ({
      studentId: s.id,
      present: attendance[s.id]
    }));

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, slotId, records }),
      });
      if (res.ok) {
        const slot = ATTENDANCE_SLOTS.find((item) => item.id === slotId);
        setStatusMessage(`Attendance saved for ${slot?.label} (${slot?.time}).`);
        toggleAll(false); // reset
      } else {
        setStatusMessage('Failed to save attendance.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSearchChange = (value: string) => {
    if (value === '') {
      setSearchQuery('');
      setSearchError('');
      return;
    }

    const hasLetters = /[a-z]/i.test(value);
    if (hasLetters) {
      setSearchQuery(value);
      setSearchError('');
      return;
    }

    if (/^\d{1,3}$/.test(value)) {
      setSearchQuery(value);
      setSearchError('');
      return;
    }

    setSearchError('Use letters for names or up to 3 digits for the USN suffix.');
  };

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    if (/[a-z]/i.test(query)) {
      return student.name.toLowerCase().includes(query);
    }

    const lastThreeDigits = student.usn.replace(/\D/g, '').slice(-3);
    return lastThreeDigits.includes(query);
  });

  const handleKeyDown = (e: React.KeyboardEvent, studentId: string) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleStudent(studentId);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:justify-between xl:items-end">
        <div>
          <div className="text-[10px] uppercase text-[var(--color-fog-grey)] mb-2">Hourly Attendance</div>
          <h2 className="text-[var(--text-heading)] leading-[var(--leading-heading)] font-[590]">
            Attendance Tracker
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center bg-[var(--color-deep-slate)] p-3 rounded-[var(--radius-cards)] border border-[var(--color-charcoal-grey)]">
          <Input 
            type="number" 
            value={threshold} 
            onChange={(e) => setThreshold(e.target.value)}
            className="w-[96px] text-center"
            inputSize="sm"
            min="0" max="100"
          />
          <span className="text-[var(--text-body)] text-[var(--color-storm-cloud)]">%</span>
          <a href={`/api/attendance/export?threshold=${threshold}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline-large" size="md" className="whitespace-nowrap">
              <Download className="h-[16px] w-[16px]" />
              <span>Export Defaulters</span>
            </Button>
          </a>
          <a href={`/api/attendance/export`} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="md" className="whitespace-nowrap">
              <Download className="h-[16px] w-[16px]" />
              <span>Export All</span>
            </Button>
          </a>
        </div>
      </div>

      <Card className="p-5">
        <div className="mb-6 flex flex-wrap items-center gap-3">
            <Input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-[240px]"
              inputSize="md"
            />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Attendance session">
              {ATTENDANCE_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSlotId(slot.id)}
                  className={`rounded-[var(--radius-tags)] border px-3 py-2 text-left text-[12px] transition-colors ${
                    slotId === slot.id
                      ? 'border-[var(--color-neon-lime)] bg-[color-mix(in_srgb,var(--color-neon-lime)_12%,transparent)] text-[var(--color-porcelain)]'
                      : 'border-[var(--color-charcoal-grey)] bg-[var(--color-gunmetal)] text-[var(--color-storm-cloud)] hover:text-[var(--color-porcelain)]'
                  }`}
                >
                  <span className="block font-[590]">{slot.label}</span>
                  <span className="block font-[var(--font-berkeley-mono)]">{slot.time}</span>
                </button>
              ))}
            </div>
            <Button variant="outline-large" size="md" onClick={() => toggleAll(true)}>
              Mark All Present
            </Button>
            <Button variant="outline-large" size="md" onClick={() => toggleAll(false)}>
              Mark All Absent
            </Button>
          <Button onClick={handleSubmit} size="md" disabled={saving} className="whitespace-nowrap">
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>

        <div className="mb-5">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[var(--color-storm-cloud)]" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or last 3 USN digits"
              className="pl-9"
            />
          </div>
          {searchError && (
            <p className="mt-2 text-[12px] text-[var(--color-warning-red)]">{searchError}</p>
          )}
        </div>

        {statusMessage && (
          <div className="mb-4 text-sm text-[var(--color-porcelain)] border border-[var(--color-charcoal-grey)] bg-[var(--color-deep-slate)] px-4 py-3 rounded-[var(--radius-cards)]">
            {statusMessage}
          </div>
        )}

        <div className="space-y-2">
          {filteredStudents.map((student) => {
            const isPresent = attendance[student.id];
            return (
              <div 
                key={student.id}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, student.id)}
                onClick={() => toggleStudent(student.id)}
                className={`flex items-center justify-between p-3 rounded-[var(--radius-cards)] border cursor-pointer select-none transition-colors focus:ring-2 focus:ring-[var(--color-neon-lime)] outline-none ${
                  isPresent ? 'bg-[color-mix(in_srgb,var(--color-neon-lime)_10%,var(--color-graphite))] border-[var(--color-neon-lime)]' : 'bg-[var(--color-pitch-black)] border-[var(--color-charcoal-grey)] hover:bg-[var(--color-deep-slate)]'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {isPresent ? (
                    <CheckSquare className="h-[20px] w-[20px] text-[var(--color-neon-lime)]" />
                  ) : (
                    <Square className="h-[20px] w-[20px] text-[var(--color-storm-cloud)]" />
                  )}
                  <div>
                    <p className="font-medium text-[var(--color-porcelain)]">
                      {student.name}
                    </p>
                    <p className="text-sm text-[var(--color-storm-cloud)] font-[var(--font-berkeley-mono)]">
                      {student.usn}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {isPresent ? (
                    <span className="bg-[var(--color-neon-lime)] text-[var(--color-pitch-black)] px-2 py-1 rounded-[var(--radius-badges)]">Present</span>
                  ) : (
                    <span className="text-[var(--color-storm-cloud)] border border-[var(--color-charcoal-grey)] px-2 py-1 rounded-[var(--radius-badges)]">Absent</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
