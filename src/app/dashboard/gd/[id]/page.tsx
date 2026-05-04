'use client';

import { useState, useEffect, use } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAutoSync } from '@/hooks/use-auto-sync';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CommentChip } from '@/components/comment-chip';
import { Save, CheckCircle2 } from 'lucide-react';

type Student = { id: string; name: string; usn: string };
type Entry = { studentId: string; remarks: string; chips: string[] };
type Batch = { id: string; batchNumber: number; entries: Entry[] };
type SessionState = { sessionId: string; topic: string; batches: Batch[] };

export default function GDEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;

  // Settings / Master Data
  const [availableChips, setAvailableChips] = useState<{id: string, label: string}[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  
  // LocalForage State
  const [state, setState, isReady] = useLocalStorage<SessionState | null>(`gd_session_${sessionId}`, null);
  
  // Sync Status
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  // Load master data
  useEffect(() => {
    Promise.all([
      fetch('/api/settings/chips').then(r => r.json()),
      fetch('/api/students').then(r => r.json()) // all students
    ]).then(([chipsData, studentsData]) => {
      if (Array.isArray(chipsData)) setAvailableChips(chipsData);
      if (Array.isArray(studentsData)) setAllStudents(studentsData);
    });
  }, []);

  // Initialize or Hydrate State
  useEffect(() => {
    if (isReady && !state && allStudents.length > 0) {
      // First time loading, let's create a default batch with all students
      // In a real app, we might fetch existing DB state first, but for offline-first simplicity we initialize local if empty.
      setState({
        sessionId,
        topic: 'Untitled Session',
        batches: [
          {
            id: 'batch-1',
            batchNumber: 1,
            entries: allStudents.map(s => ({ studentId: s.id, remarks: '', chips: [] }))
          }
        ]
      });
    }
  }, [isReady, state, allStudents, sessionId, setState]);

  // Sync Engine
  const syncToDb = async () => {
    if (!state) return;
    setSyncStatus('syncing');
    try {
      await fetch('/api/gd/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to sync', err);
    }
  };

  useAutoSync(syncToDb, state);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, studentId: string, fromBatchId: string) => {
    e.dataTransfer.setData('studentId', studentId);
    e.dataTransfer.setData('fromBatchId', fromBatchId);
  };

  const handleDrop = (e: React.DragEvent, toBatchId: string) => {
    e.preventDefault();
    if (!state) return;
    const studentId = e.dataTransfer.getData('studentId');
    const fromBatchId = e.dataTransfer.getData('fromBatchId');

    if (fromBatchId === toBatchId) return;

    setState(prev => {
      if (!prev) return prev;
      const newState = { ...prev, batches: [...prev.batches] };
      const fromBatchIndex = newState.batches.findIndex(b => b.id === fromBatchId);
      const toBatchIndex = newState.batches.findIndex(b => b.id === toBatchId);
      
      const entryIndex = newState.batches[fromBatchIndex].entries.findIndex(e => e.studentId === studentId);
      const [entry] = newState.batches[fromBatchIndex].entries.splice(entryIndex, 1);
      
      newState.batches[toBatchIndex].entries.push(entry);
      return newState;
    });
  };

  const addBatch = () => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        batches: [
          ...prev.batches,
          { id: `batch-${Date.now()}`, batchNumber: prev.batches.length + 1, entries: [] }
        ]
      };
    });
  };

  const updateEntry = (batchId: string, studentId: string, updates: Partial<Entry>) => {
    setState(prev => {
      if (!prev) return prev;
      const newState = { ...prev, batches: [...prev.batches] };
      const bIndex = newState.batches.findIndex(b => b.id === batchId);
      const eIndex = newState.batches[bIndex].entries.findIndex(e => e.studentId === studentId);
      
      newState.batches[bIndex].entries[eIndex] = { ...newState.batches[bIndex].entries[eIndex], ...updates };
      return newState;
    });
  };

  const toggleChip = (batchId: string, studentId: string, chipLabel: string) => {
    setState(prev => {
      if (!prev) return prev;
      const bIndex = prev.batches.findIndex(b => b.id === batchId);
      const entry = prev.batches[bIndex].entries.find(e => e.studentId === studentId)!;
      const chips = entry.chips.includes(chipLabel)
        ? entry.chips.filter(c => c !== chipLabel)
        : [...entry.chips, chipLabel];
      
      return updateEntryHelper(prev, batchId, studentId, { chips });
    });
  };

  const updateEntryHelper = (state: SessionState, batchId: string, studentId: string, updates: Partial<Entry>) => {
    const newState = { ...state, batches: [...state.batches] };
    const bIndex = newState.batches.findIndex(b => b.id === batchId);
    const eIndex = newState.batches[bIndex].entries.findIndex(e => e.studentId === studentId);
    newState.batches[bIndex].entries[eIndex] = { ...newState.batches[bIndex].entries[eIndex], ...updates };
    return newState;
  };


  if (!isReady || !state) return <div className="p-8">Loading offline storage...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-xl">
          <Input 
            value={state.topic}
            onChange={(e) => setState(prev => prev ? { ...prev, topic: e.target.value } : prev)}
            placeholder="Session Topic"
            className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] font-medium border-transparent focus:border-[var(--color-light-gray)] bg-transparent px-0 rounded-none"
          />
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-[var(--color-silver-mist)] flex items-center space-x-2">
            {syncStatus === 'syncing' && <span className="animate-pulse">Syncing...</span>}
            {syncStatus === 'synced' && <><CheckCircle2 className="w-4 h-4 text-[var(--color-absolute-zero)]"/> <span>Saved locally & synced</span></>}
            {syncStatus === 'idle' && <span>Saved locally</span>}
          </span>
          <Button onClick={syncToDb} variant="outline-large" size="md" className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Force Sync</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={addBatch} variant="pill" size="sm">
          + Add Batch
        </Button>
      </div>

      <div className="flex space-x-6 overflow-x-auto pb-8 items-start">
        {state.batches.map((batch) => (
          <Card 
            key={batch.id} 
            className="p-4 bg-[var(--surface-light-gray)] min-w-[320px] w-96 flex-shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, batch.id)}
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-medium text-[var(--text-subheading)] leading-[var(--leading-subheading)]">Batch {batch.batchNumber}</h3>
              <span className="text-xs text-[var(--color-silver-mist)]">{batch.entries.length} students</span>
            </div>

            <div className="space-y-3 min-h-[100px]">
              {batch.entries.map((entry) => {
                const student = allStudents.find(s => s.id === entry.studentId);
                if (!student) return null;

                return (
                  <div 
                    key={student.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, student.id, batch.id)}
                    className="bg-[var(--surface-canvas-white)] p-3 rounded-[8px] border border-[var(--color-light-gray)] cursor-move"
                  >
                    <div className="font-medium text-sm mb-2">{student.name} <span className="text-[var(--color-silver-mist)] font-normal">({student.usn})</span></div>
                    
                    <div className="flex flex-wrap gap-2 mb-2 mt-2">
                      {availableChips.map(chip => (
                        <CommentChip 
                          key={chip.id}
                          label={chip.label}
                          selected={entry.chips.includes(chip.label)}
                          onClick={() => toggleChip(batch.id, student.id, chip.label)}
                        />
                      ))}
                    </div>

                    <textarea
                      value={entry.remarks}
                      onChange={(e) => updateEntry(batch.id, student.id, { remarks: e.target.value })}
                      placeholder="Additional remarks..."
                      className="w-full text-sm border border-[var(--color-light-gray)] rounded-[8px] p-2 outline-none focus:border-[var(--color-graphite)]"
                      rows={2}
                    />
                  </div>
                );
              })}
              {batch.entries.length === 0 && (
                <div className="text-center text-[var(--color-silver-mist)] text-sm py-8 border-2 border-dashed border-[var(--color-light-gray)] rounded-[8px]">
                  Drag students here
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
