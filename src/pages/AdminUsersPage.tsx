import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Mail, Phone, Pencil, Shield, UserRound, Building2 } from 'lucide-react';
import { listUsersPaged, createUser, updateUser, adminSetPassword, listBatches } from '../lib/formEngine';
import type { UserRow } from '../lib/formEngine';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Loader } from '../components/ui/Loader';
import { toast } from '../utils/toast';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'trainer', label: 'Trainer' },
  { value: 'office', label: 'Office Use' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'All roles' },
  ...ROLE_OPTIONS,
];

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...STATUS_OPTIONS,
];

const roleLabel = (role: string) => ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;

export const AdminUsersPage: React.FC = () => {
  const PAGE_SIZE = 20;
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | 'admin' | 'trainer' | 'office'>('');
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'inactive'>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [draft, setDraft] = useState({
    full_name: '',
    email: '',
    phone: '',
    status: 'active',
    role: 'trainer' as 'admin' | 'trainer' | 'office',
    password: '',
  });

  const [editDraft, setEditDraft] = useState<{
    full_name: string;
    email: string;
    phone: string;
    status: string;
    role: string;
    newPassword: string;
  } | null>(null);
  const [batches, setBatches] = useState<{ id: number; name: string; trainer_id: number }[]>([]);

  useEffect(() => {
    listBatches().then((b) => setBatches(b));
  }, []);

  const digitsOnly = (val: string) => val.replace(/\D/g, '');

  const validateUserForm = (
    form: { full_name: string; email: string; phone: string; status: string; role: string },
    requirePassword = false,
    password?: string
  ): string | null => {
    if (!form.full_name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Enter a valid email address.';
    if (!form.phone.trim()) return 'Phone is required.';
    if (!/^\d{10}$/.test(form.phone.trim())) return 'Phone must be exactly 10 digits.';
    if (!form.status.trim()) return 'Status is required.';
    if (!form.role || !['admin', 'trainer', 'office'].includes(form.role)) return 'Role is required.';
    if (requirePassword && (!password || password.length < 6)) return 'Password must be at least 6 characters.';
    if (password && password.length > 0 && password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await listUsersPaged(currentPage, PAGE_SIZE, searchTerm, roleFilter || undefined, statusFilter || undefined);
      setUsers(res.data);
      setTotalUsers(res.total);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const createError = useMemo(() => validateUserForm(draft, true, draft.password), [draft]);
  const editError = useMemo(() => (editDraft ? validateUserForm(editDraft, false, editDraft.newPassword || undefined) : null), [editDraft]);

  const handleCreate = async () => {
    const err = validateUserForm(draft, true, draft.password);
    if (err) {
      toast.error(err);
      return;
    }
    setCreating(true);
    const created = await createUser({
      full_name: draft.full_name,
      email: draft.email,
      phone: draft.phone,
      status: draft.status,
      role: draft.role,
      password: draft.password || undefined,
    });
    setCreating(false);
    if (!created) {
      toast.error('Failed to add user');
      return;
    }
    setCurrentPage(1);
    const res = await listUsersPaged(1, PAGE_SIZE, searchTerm, roleFilter || undefined, statusFilter || undefined);
    setUsers(res.data);
    setTotalUsers(res.total);
    setDraft({ full_name: '', email: '', phone: '', status: 'active', role: 'trainer', password: '' });
    setIsCreateOpen(false);
    toast.success('User added');
  };

  const editingUser = useMemo(() => (editingId ? users.find((u) => u.id === editingId) : null), [editingId, users]);

  useEffect(() => {
    if (!editingUser) {
      setEditDraft(null);
      return;
    }
    setEditDraft({
      full_name: editingUser.full_name,
      email: editingUser.email,
      phone: editingUser.phone ?? '',
      status: editingUser.status ?? 'active',
      role: editingUser.role ?? 'trainer',
      newPassword: '',
    });
  }, [editingUser]);

  const handleSaveEdit = async () => {
    if (!editingId || !editDraft) return;
    const err = validateUserForm(editDraft, false, editDraft.newPassword || undefined);
    if (err) {
      toast.error(err);
      return;
    }
    setSavingEdit(true);
    const updated = await updateUser(editingId, {
      full_name: editDraft.full_name,
      email: editDraft.email,
      phone: editDraft.phone,
      status: editDraft.status,
      role: editDraft.role as 'admin' | 'trainer' | 'office',
    });
    if (editDraft.newPassword.trim()) {
      const pwResult = await adminSetPassword(editingId, editDraft.newPassword);
      if (!pwResult.success) {
        toast.error(pwResult.message);
        setSavingEdit(false);
        return;
      }
    }
    setSavingEdit(false);
    if (!updated) {
      toast.error('Failed to update user');
      return;
    }
    const res = await listUsersPaged(currentPage, PAGE_SIZE, searchTerm, roleFilter || undefined, statusFilter || undefined);
    setUsers(res.data);
    setTotalUsers(res.total);
    setEditingId(null);
    toast.success('User updated');
  };

  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  const RoleIcon = ({ role }: { role: string }) => {
    if (role === 'admin') return <Shield className="w-4 h-4 text-amber-600" />;
    if (role === 'trainer') return <UserRound className="w-4 h-4 text-blue-600" />;
    return <Building2 className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        <Card className="mb-6">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">Users</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage user directory. Add Admin, Trainer, or Office Use. Batches are assigned to trainers on the Batches page.
            </p>
          </div>
          <div className="flex flex-nowrap items-center gap-3 mt-4">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-gray-600">Role:</span>
              <Select
                value={roleFilter}
                onChange={(v) => {
                  setRoleFilter(v as '' | 'admin' | 'trainer' | 'office');
                  setCurrentPage(1);
                }}
                options={ROLE_FILTER_OPTIONS}
                className="min-w-[120px]"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-gray-600">Status:</span>
              <Select
                value={statusFilter}
                onChange={(v) => {
                  setStatusFilter(v as '' | 'active' | 'inactive');
                  setCurrentPage(1);
                }}
                options={STATUS_FILTER_OPTIONS}
                className="min-w-[120px]"
              />
            </div>
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, phone..."
              className="flex-1 min-w-0"
            />
            <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
              <Plus className="w-4 h-4 mr-2 inline" />
              Add User
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-[var(--text)] mb-4">User Directory</h2>
          {loading ? (
            <div className="py-12">
              <Loader variant="dots" size="lg" message="Loading users..." />
            </div>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm border border-[var(--border)] rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold border-b border-[var(--border)]">User</th>
                    <th className="text-left px-4 py-3 font-semibold border-b border-[var(--border)]">Contact</th>
                    <th className="text-left px-4 py-3 font-semibold border-b border-[var(--border)]">Role</th>
                    <th className="text-left px-4 py-3 font-semibold border-b border-[var(--border)]">Batches</th>
                    <th className="text-left px-4 py-3 font-semibold border-b border-[var(--border)]">Status</th>
                    <th className="text-right px-4 py-3 font-semibold border-b border-[var(--border)]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 border-b border-[var(--border)]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-semibold flex items-center justify-center">
                            {user.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text)]">{user.full_name}</div>
                            <div className="text-xs text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[var(--border)]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{user.phone || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[var(--border)]">
                        <div className="flex items-center gap-2">
                          <RoleIcon role={user.role} />
                          <span className="font-medium">{roleLabel(user.role)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[var(--border)]">
                        <div className="flex flex-wrap gap-1">
                          {(user.role === 'trainer' || user.role === 'admin') &&
                            batches
                              .filter((b) => b.trainer_id === user.id)
                              .map((b) => (
                                <span
                                  key={b.id}
                                  className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  {b.name}
                                </span>
                              ))}
                          {((user.role !== 'trainer' && user.role !== 'admin') || batches.filter((b) => b.trainer_id === user.id).length === 0) && (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[var(--border)]">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            (user.status || 'active') === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-[var(--border)] text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(user.id)}
                          className="inline-flex items-center justify-center gap-1.5 min-w-[96px] whitespace-nowrap"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && totalUsers > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="text-xs text-gray-500">
                Page {currentPage} of {totalPages} ({totalUsers} total)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add User" size="md">
        <div className="space-y-3">
          <Input
            value={draft.full_name}
            onChange={(e) => setDraft((p) => ({ ...p, full_name: e.target.value }))}
            placeholder="Full name *"
            required
          />
          <Input
            value={draft.email}
            onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
            placeholder="Email *"
            type="email"
            required
          />
          <Input
            value={draft.phone}
            onChange={(e) => setDraft((p) => ({ ...p, phone: digitsOnly(e.target.value).slice(0, 10) }))}
            placeholder="Phone (10 digits) *"
            required
          />
          <Select
            value={draft.role}
            onChange={(v) => setDraft((p) => ({ ...p, role: v as 'admin' | 'trainer' | 'office' }))}
            options={ROLE_OPTIONS}
            label="Role"
          />
          <Input
            value={draft.password}
            onChange={(e) => setDraft((p) => ({ ...p, password: e.target.value }))}
            placeholder="Password (min 6 chars) *"
            type="password"
          />
          <Select
            value={draft.status}
            onChange={(v) => setDraft((p) => ({ ...p, status: v }))}
            options={STATUS_OPTIONS}
            label="Status"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={creating || !!createError}>
              {creating ? (
                <>
                  <Loader variant="dots" size="sm" inline className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add User
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {editingId && editDraft && (
        <Modal isOpen={!!editingId} onClose={() => setEditingId(null)} title="Edit User" size="md">
          <div className="space-y-3">
            <Input
              value={editDraft.full_name}
              onChange={(e) => setEditDraft((p) => (p ? { ...p, full_name: e.target.value } : p))}
              placeholder="Full name *"
              required
            />
            <Input
              value={editDraft.email}
              onChange={(e) => setEditDraft((p) => (p ? { ...p, email: e.target.value } : p))}
              placeholder="Email *"
              type="email"
              required
            />
            <Input
              value={editDraft.phone}
              onChange={(e) => setEditDraft((p) => (p ? { ...p, phone: digitsOnly(e.target.value).slice(0, 10) } : p))}
              placeholder="Phone (10 digits) *"
              required
            />
            <Select
              value={editDraft.role}
              onChange={(v) => setEditDraft((p) => (p ? { ...p, role: v } : p))}
              options={ROLE_OPTIONS}
              label="Role"
            />
            <Input
              value={editDraft.newPassword}
              onChange={(e) => setEditDraft((p) => (p ? { ...p, newPassword: e.target.value } : p))}
              placeholder="New password (leave blank to keep current)"
              type="password"
            />
            <Select
              value={editDraft.status}
              onChange={(v) => setEditDraft((p) => (p ? { ...p, status: v } : p))}
              options={STATUS_OPTIONS}
              label="Status"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={savingEdit || !!editError}>
                {savingEdit ? (
                  <>
                    <Loader variant="dots" size="sm" inline className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
