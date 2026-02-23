import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, User, Lock, Bell, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Settings() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'profile' | 'password' | 'notifications'>('profile');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const nameParts = user?.fullName?.split(' ') ?? [];
  const defaultFirst = nameParts[0] ?? '';
  const defaultLast = nameParts.slice(1).join(' ');

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      firstName: defaultFirst,
      lastName: defaultLast,
      email: user?.email ?? '',
    },
  });

  const passwordForm = useForm<PasswordForm>();

  const handleProfileSave = async (data: ProfileForm) => {
    setUpdatingProfile(true);
    try {
      await authApi.updateProfile({ fullName: `${data.firstName} ${data.lastName}` });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSave = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setUpdatingPassword(true);
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch {
      toast.error('Failed to change password. Check your current password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'password' as const, label: 'Password', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
          <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First name</label>
                <input className="input" {...profileForm.register('firstName', { required: true })} />
              </div>
              <div>
                <label className="label">Last name</label>
                <input className="input" {...profileForm.register('lastName', { required: true })} />
              </div>
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input bg-gray-50"
                disabled
                {...profileForm.register('email')}
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={updatingProfile} className="btn-primary">
                {updatingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSave)} className="space-y-4">
            <div>
              <label className="label">Current password</label>
              <input
                type="password"
                className="input"
                {...passwordForm.register('currentPassword', { required: true })}
              />
            </div>
            <div>
              <label className="label">New password</label>
              <input
                type="password"
                className="input"
                {...passwordForm.register('newPassword', {
                  required: true,
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
              />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input
                type="password"
                className="input"
                {...passwordForm.register('confirmPassword', { required: true })}
              />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={updatingPassword} className="btn-primary">
                {updatingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications tab */}
      {tab === 'notifications' && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Notification Preferences</h2>
          {[
            { label: 'Expiry reminders (30 days)', key: 'expiry30' },
            { label: 'Expiry reminders (7 days)', key: 'expiry7' },
            { label: 'Document uploaded successfully', key: 'uploadSuccess' },
            { label: 'AI processing complete', key: 'aiComplete' },
            { label: 'Workflow step completed', key: 'workflowStep' },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700">{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 peer-checked:bg-primary-500 rounded-full transition-colors" />
                <div className="absolute left-0.5 top-0.5 bg-white h-4 w-4 rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </label>
            </div>
          ))}
          <button className="btn-primary mt-2">Save Preferences</button>
        </div>
      )}
    </div>
  );
}
