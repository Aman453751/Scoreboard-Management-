import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { teamService } from '../services/teamService';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Plus,
  Search,
  Building,
  Shield,
  Edit2,
  Trash2,
  ChevronRight,
  AlertCircle,
  Mail,
  User
} from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const TeamsPage = () => {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    college: '',
    department: '',
    captainName: '',
    contactEmail: '',
    logo: ''
  });

  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });

  const fetchTeams = async () => {
    try {
      const res = await teamService.getAll({ search });
      if (res.success) {
        setTeams(res.data.teams || []);
      }
    } catch (err) {
      console.error('Error loading teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [search]);

  useEffect(() => {
    if (searchParams.get('action') === 'new' && isAdmin) {
      openCreateModal();
    }
  }, [searchParams, isAdmin]);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      shortName: '',
      college: 'Apex Institute of Technology',
      department: '',
      captainName: '',
      contactEmail: '',
      logo: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setIsEditing(true);
    setCurrentId(t.id);
    setFormData({
      name: t.name,
      shortName: t.shortName || '',
      college: t.college || '',
      department: t.department || '',
      captainName: t.captainName || '',
      contactEmail: t.contactEmail || '',
      logo: t.logo || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (isEditing) {
        await teamService.update(currentId, formData);
      } else {
        await teamService.create(formData);
      }
      setIsModalOpen(false);
      fetchTeams();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save team.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await teamService.delete(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete team.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#252a37]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[#4cd7f6]" />
            <span>Collegiate Teams & Rosters</span>
          </h1>
          <p className="text-xs text-[#8c909f] mt-1">
            Registered campus departments, athletic squads, captains, and match statistics
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Team</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by team title, department, or captain..."
          className="w-full bg-[#1a1f2c] border border-[#252a37] rounded pl-9 pr-3 py-2 text-xs text-[#dee2f4] placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff]"
        />
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#8c909f]">
          Loading team registries...
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-[#8c909f] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-white">No teams found</h3>
          <p className="text-xs text-[#8c909f]">
            Try searching a different name or register a new team.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t) => (
            <div
              key={t.id}
              className="rounded-xl bg-[#1a1f2c] border border-[#252a37] hover:border-[#4d8eff]/50 p-4 sm:p-5 flex flex-col justify-between shadow-lg transition-all space-y-4"
            >
              <div className="space-y-3">
                {/* Team Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4d8eff] text-[#00285d] flex items-center justify-center font-bold text-xs shadow">
                      {t.shortName || t.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                        {t.name}
                      </h3>
                      <p className="text-[11px] text-[#4cd7f6] font-mono">
                        {t.shortName ? `CODE: ${t.shortName}` : 'DEPT SQUAD'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Team Details */}
                <div className="space-y-1.5 pt-2 border-t border-[#252a37] text-xs text-[#c2c6d6]">
                  {t.department && (
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[#8c909f] shrink-0" />
                      <span className="truncate">Dept: {t.department}</span>
                    </div>
                  )}
                  {t.captainName && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />
                      <span>Captain: <strong className="text-white">{t.captainName}</strong></span>
                    </div>
                  )}
                  {t.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#8c909f] shrink-0" />
                      <span className="truncate text-[#8c909f]">{t.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#252a37] flex items-center justify-between">
                <Link
                  to={`/teams/${t.id}`}
                  className="font-bold text-xs text-[#4cd7f6] hover:underline flex items-center gap-1"
                >
                  <span>Team Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(t)}
                      aria-label="Edit"
                      className="p-1.5 rounded hover:bg-[#252a37] text-[#8c909f] hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, id: t.id, name: t.name })}
                      aria-label="Delete"
                      className="p-1.5 rounded hover:bg-red-500/10 text-[#8c909f] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Team Registration / Editing */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Team Details' : 'Register New Team'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Team Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Mechanical Bulls"
              className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Short Code *</label>
              <input
                type="text"
                required
                maxLength={5}
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })}
                placeholder="e.g. MB"
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#4d8eff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Mechanical Eng"
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#dee2f4] mb-1">College / Institution</label>
            <input
              type="text"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              placeholder="e.g. Apex Institute of Technology"
              className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Captain Name</label>
              <input
                type="text"
                value={formData.captainName}
                onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                placeholder="e.g. Alex Hunter"
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="e.g. captain@college.edu"
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#252a37]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded text-xs font-semibold text-[#c2c6d6] hover:bg-[#252a37]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-1.5 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs"
            >
              {formLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Team'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Team"
        message={`Are you sure you want to delete "${deleteDialog.name}"? This will remove the team from tournament enrollments.`}
        confirmText="Delete Team"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
};

export default TeamsPage;
