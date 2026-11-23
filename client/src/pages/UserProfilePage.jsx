import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  User,
  Mail,
  Building,
  Phone,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react';

const UserProfilePage = () => {
  const { user, updateUser, logout } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    phone: user?.phone || ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await authService.updateProfile(profileData);
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        setProfileSuccess('Profile details saved successfully.');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdLoading(true);
    setPwdSuccess('');
    setPwdError('');

    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setPwdSuccess('Password changed successfully.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#252a37]">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-[#4cd7f6]" />
          <span>User Profile & Account Security</span>
        </h1>
        <p className="text-xs text-[#8c909f] mt-1">
          Update personal details and manage access credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Account Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-xl bg-[#1a1f2c] border border-[#252a37] text-center space-y-3 shadow-lg">
            <div className="w-16 h-16 rounded-full bg-[#4d8eff] text-[#00285d] flex items-center justify-center font-bold text-2xl mx-auto shadow">
              {user?.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-[#8c909f]">{user?.email}</p>
            </div>
            <div className="pt-2">
              <span className="inline-block px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#4d8eff]/20 text-[#adc6ff] border border-[#4d8eff]/30">
                ROLE: {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile & Password */}
        <div className="md:col-span-7 space-y-5">
          {/* Edit Profile Details */}
          <div className="p-5 rounded-xl bg-[#1a1f2c] border border-[#252a37] space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-white">General Information</h3>

            {profileSuccess && (
              <div className="p-3 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 text-xs text-[#4edea3]">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#dee2f4] mb-1">College / University</label>
                <input
                  type="text"
                  value={profileData.college}
                  onChange={(e) => setProfileData({ ...profileData, college: e.target.value })}
                  className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-4 py-2 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs shadow"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="p-5 rounded-xl bg-[#1a1f2c] border border-[#252a37] space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-[#4cd7f6]" />
              <span>Change Password</span>
            </h3>

            {pwdSuccess && (
              <div className="p-3 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 text-xs text-[#4edea3]">
                {pwdSuccess}
              </div>
            )}
            {pwdError && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {pwdError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#dee2f4] mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="px-4 py-2 rounded bg-[#252a37] hover:bg-[#343947] text-white font-semibold text-xs border border-[#343947]"
                >
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
