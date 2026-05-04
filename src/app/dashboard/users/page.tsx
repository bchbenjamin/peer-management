'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Role } from '@/types';

type User = { id: string; username: string; role: Role; student?: { name: string; usn: string } };
type Student = { id: string; name: string; usn: string };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [resetUserId, setResetUserId] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchData() {
    try {
      const [usersRes, studentsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/students')
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (studentsRes.ok) setStudents(await studentsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // External data hydration belongs here; event handlers reuse the same loader after mutations.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, studentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setShowForm(false);
      setUsername('');
      setPassword('');
      setStudentId('');
      setRole(Role.STUDENT);
      setStatusMessage('User account created successfully.');
      fetchData(); // Refresh list
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    setError('');
    if (!resetUserId || !resetPassword) return;

    setResetting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resetUserId, newPassword: resetPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setResetUserId('');
      setResetPassword('');
      setStatusMessage('User password reset. 2FA has been cleared for this user.');
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setStatusMessage('');
    setError('');
    if (!confirm('Delete this user account? This cannot be undone.')) return;

    setDeletingId(id);
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      setStatusMessage('User account deleted.');
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[var(--text-heading-sm)] leading-[var(--leading-heading-sm)] font-[var(--font-inter-variable)] font-medium">
          User Management
        </h2>
        <Button onClick={() => setShowForm(!showForm)} size="md">
          {showForm ? 'Cancel' : 'Create User'}
        </Button>
      </div>

      {statusMessage && (
        <div className="text-sm p-4 bg-[var(--surface-light-gray)] border border-[var(--color-light-gray)] rounded-[8px]">
          {statusMessage}
        </div>
      )}

      {showForm && (
        <Card className="p-6 bg-[var(--surface-light-gray)] border border-[var(--color-light-gray)]">
          <h3 className="text-[var(--text-subheading)] leading-[var(--leading-subheading)] font-medium mb-4">Create New Account</h3>
          {error && <div className="text-[var(--color-absolute-zero)] text-sm mb-4">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-[var(--color-silver-mist)] mb-2">Username</label>
              <Input value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-silver-mist)] mb-2">Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            
            <div>
              <label className="block text-sm text-[var(--color-silver-mist)] mb-2">Role</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="radio" checked={role === Role.STUDENT} onChange={() => setRole(Role.STUDENT)} />
                  <span>Student</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" checked={role === Role.COORDINATOR} onChange={() => setRole(Role.COORDINATOR)} />
                  <span>Co-ordinator</span>
                </label>
              </div>
            </div>

            {role === Role.STUDENT && (
              <div>
                <label htmlFor="student-map" className="block text-sm text-[var(--color-silver-mist)] mb-2">Map to Student Profile</label>
                <select 
                  id="student-map"
                  className="w-full rounded-[8px] px-4 py-3 border border-[var(--color-light-gray)] outline-none"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  required
                >
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.usn})</option>
                  ))}
                </select>
                <p className="text-xs text-[var(--color-silver-mist)] mt-2">Student accounts must be linked to an existing record.</p>
              </div>
            )}

            <Button type="submit" size="md" className="w-full">Save Account</Button>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-[var(--text-subheading)] leading-[var(--leading-subheading)] font-medium mb-4">Reset User Password</h3>
        <p className="text-sm text-[var(--color-silver-mist)] mb-4">
          Existing passwords are protected and cannot be viewed. Set a new password here; this clears the user&apos;s 2FA setup and requires them to reconfigure it.
        </p>
        {error && <div className="text-[var(--color-absolute-zero)] text-sm mb-4">{error}</div>}
        <form onSubmit={handleResetPassword} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div>
            <label htmlFor="reset-user" className="block text-sm text-[var(--color-silver-mist)] mb-2">User</label>
            <select
              id="reset-user"
              className="w-full rounded-[8px] px-4 py-3 border border-[var(--color-light-gray)] outline-none"
              value={resetUserId}
              onChange={(e) => setResetUserId(e.target.value)}
              required
            >
              <option value="">Select a user...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--color-silver-mist)] mb-2">New Password</label>
            <Input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" size="md" disabled={resetting}>
            {resetting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--surface-light-gray)] border-b border-[var(--color-light-gray)] text-sm text-[var(--color-silver-mist)] uppercase tracking-[var(--tracking-heading-sm)]">
              <th className="p-4 font-normal">Username</th>
              <th className="p-4 font-normal">Role</th>
              <th className="p-4 font-normal">Mapped Student</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-[var(--color-silver-mist)]">No secondary users found.</td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="border-b border-[var(--color-light-gray)] last:border-0">
                  <td className="p-4">{u.username}</td>
                  <td className="p-4">
                    <span className="px-2 py-2 rounded-[100px] text-xs border border-[var(--color-light-gray)] text-[var(--color-absolute-zero)]">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[var(--color-silver-mist)]">
                    {u.student ? `${u.student.name} (${u.student.usn})` : '—'}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      className="text-[var(--text-caption)] text-[var(--color-silver-mist)] hover:text-[var(--color-absolute-zero)]"
                      onClick={() => handleDelete(u.id)}
                      disabled={deletingId === u.id}
                    >
                      {deletingId === u.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
