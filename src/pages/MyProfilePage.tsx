import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export const MyProfilePage: React.FC = () => {
  const { user } = useAuth();

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
      </div>
    </div>
  );
};
