import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { changePassword } from '../lib/formEngine';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from '../utils/toast';

export const MyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!currentPassword.trim()) {
      toast.error('Enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChanging(true);
    const res = await changePassword(user.id, currentPassword, newPassword);
    setChanging(false);
    if (res.success) {
      toast.success(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.message);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="w-full px-4 md:px-6 lg:px-8 py-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2 mb-6">
          <User className="w-7 h-7 text-[var(--brand)]" />
          My Profile
        </h1>

        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Profile information</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your profile details are managed by your administrator. Contact an admin to update your name or email.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <Input value={user.full_name} readOnly disabled className="bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input value={user.email} readOnly disabled type="email" className="bg-gray-50" />
            </div>
            {user.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input value={user.phone} readOnly disabled className="bg-gray-50" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <Input value={user.role} readOnly disabled className="bg-gray-50 capitalize" />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[var(--brand)]" />
            Change password
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter your current password and choose a new one. Passwords must be at least 6 characters.
          </p>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                Current password <span className="text-red-500">*</span>
              </label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                New password <span className="text-red-500">*</span>
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm new password <span className="text-red-500">*</span>
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={changing}>
              {changing ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
