'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Role } from '@/types';

type Chip = { id: string; label: string };
type SessionInfo = { role: Role; isMaster: boolean; mfaVerified: boolean; mfaRequired?: boolean };

export default function SettingsPage() {
  const [chips, setChips] = useState<Chip[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fetchSettings = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        setSessionInfo(session);

        if (session.isMaster || session.role === Role.COORDINATOR) {
          const res = await fetch('/api/settings/chips');
          if (res.ok) setChips(await res.json());
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    
    await fetch('/api/settings/chips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newLabel }),
    });
    setNewLabel('');
    fetchSettings();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/settings/chips', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchSettings();
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated successfully.');
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  if (loading) return <div>Loading settings...</div>;

  const canManageChips = !!sessionInfo && (sessionInfo.isMaster || sessionInfo.role === Role.COORDINATOR);

  return (
    <div className="space-y-6">
      <h2 className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] tracking-[var(--tracking-heading-sm)] font-[var(--font-inter-variable)] font-medium">
        Settings
      </h2>

      <Card className="p-6">
        <h3 className="text-[var(--text-subheading)] leading-[var(--leading-subheading)] font-medium mb-4">Security</h3>
        <p className="text-sm text-[var(--color-silver-mist)] mb-6">
          Review two-factor authentication and verify your current security setup.
        </p>
        <Link href="/dashboard/settings/2fa">
          <Button type="button" size="md">Open Security Settings</Button>
        </Link>
      </Card>

      {canManageChips && (
      <Card className="p-6">
        <h3 className="text-[var(--text-subheading)] leading-[var(--leading-subheading)] font-medium mb-4">GD Evaluation Chips</h3>
        <p className="text-sm text-[var(--color-silver-mist)] mb-6">
          Configure pre-set chips for quick evaluation during Group Discussions.
        </p>

        <form onSubmit={handleAdd} className="flex space-x-4 mb-6 max-w-md">
          <Input 
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="E.g., Good communication"
            required
          />
          <Button type="submit" size="md">Add Chip</Button>
        </form>

        <div className="flex flex-wrap gap-3">
          {chips.map(chip => (
            <div key={chip.id} className="inline-flex items-center bg-[var(--surface-light-gray)] px-3 py-2 rounded-[100px] text-sm border border-[var(--color-light-gray)]">
              <span>{chip.label}</span>
              <button 
                onClick={() => handleDelete(chip.id)}
                className="ml-2 text-[var(--color-silver-mist)] hover:text-[var(--color-absolute-zero)] font-medium"
              >
                &times;
              </button>
            </div>
          ))}
          {chips.length === 0 && <span className="text-[var(--color-silver-mist)] text-sm">No chips configured.</span>}
        </div>
      </Card>
      )}

      <Card className="p-6">
        <h3 className="text-[var(--text-subheading)] leading-[var(--leading-subheading)] font-medium mb-4">Change Password</h3>
        <p className="text-sm text-[var(--color-silver-mist)] mb-6">
          Change your account password from this settings panel.
        </p>
        {sessionInfo?.isMaster && (
          <div className="text-sm mb-4 text-[var(--color-light-steel)] border border-[var(--color-charcoal-grey)] bg-[var(--color-deep-slate)] px-4 py-3 rounded-[var(--radius-cards)]">
            The master password is a deployment secret. Update `MASTER_PASSWORD` in `.env`, Vercel, or App Engine, then restart or redeploy.
          </div>
        )}
        {passwordMessage && (
          <div className="text-sm mb-4 text-[var(--color-absolute-zero)] border border-[var(--color-light-gray)] bg-[var(--surface-light-gray)] px-4 py-3 rounded-[8px]">
            {passwordMessage}
          </div>
        )}
        {passwordError && (
          <div className="text-sm mb-4 text-[var(--color-absolute-zero)]">
            {passwordError}
          </div>
        )}
        <form onSubmit={handlePasswordReset} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-[var(--color-silver-mist)] mb-2">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={sessionInfo?.isMaster}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-silver-mist)] mb-2">New Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={sessionInfo?.isMaster}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-silver-mist)] mb-2">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={sessionInfo?.isMaster}
            />
          </div>
          <Button type="submit" size="md" disabled={sessionInfo?.isMaster}>Update Password</Button>
        </form>
      </Card>
    </div>
  );
}
