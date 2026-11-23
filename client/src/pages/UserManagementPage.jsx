import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Shield,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';

const UserManagementPage = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });

  const fetchUsers = async () => {
    try {
      const params = {};
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (search) params.search = search;

      const res = await userService.getAll(params);
      if (res.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await userService.delete(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#252a37]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#4cd7f6]" />
            <span>User Management & RBAC Permissions</span>
          </h1>
          <p className="text-xs text-[#8c909f] mt-1">
            Manage user accounts, assign Scorer permissions, and regulate platform access
          </p>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, or department..."
            className="w-full bg-[#1a1f2c] border border-[#252a37] rounded pl-9 pr-3 py-2 text-xs text-[#dee2f4] placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff]"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-[#1a1f2c] border border-[#252a37] rounded px-3 py-2 text-xs text-[#dee2f4] focus:outline-none focus:border-[#4d8eff]"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="SCORER">Official Scorers</option>
            <option value="VIEWER">Students & Viewers</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#8c909f]">
            Loading user access control lists...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8c909f]">
            No user accounts found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090e1a] text-[#8c909f] uppercase font-label-sm text-[11px] tracking-wider border-b border-[#252a37]">
                <tr>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">College</th>
                  <th className="py-2.5 px-4">Current Role</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252a37]">
                {users.map((u) => {
                  const isSelf = u.id === currentAdmin?.id;

                  return (
                    <tr key={u.id} className="hover:bg-[#161b28] transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#4d8eff] text-[#00285d] flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#4edea3]/20 text-[#4edea3]">
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[#c2c6d6] text-[11px]">
                        {u.email}
                      </td>

                      <td className="py-3 px-4 text-[#8c909f]">
                        {u.college || 'Apex Institute'}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-[#090e1a] border border-[#252a37] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#4d8eff] disabled:opacity-50"
                        >
                          <option value="VIEWER">VIEWER</option>
                          <option value="SCORER">SCORER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, id: u.id, name: u.name })}
                            className="p-1.5 rounded hover:bg-red-500/10 text-[#8c909f] hover:text-red-400 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${deleteDialog.name}"? This action cannot be reversed.`}
        confirmText="Delete Account"
        confirmVariant="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
};

export default UserManagementPage;
