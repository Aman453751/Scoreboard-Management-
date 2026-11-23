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
  AlertCircle
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

  const openEditModal = (team) => {
    setIsEditing(true);
    setCurrentId(team.id);
    setFormData({
      name: team.name,
      shortName: team.shortName || '',
      college: team.college,
      department: team.department || '',
      captainName: team.captainName || '',
      contactEmail: team.contactEmail || '',
      logo: team.logo || ''
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
      setFormError(err.response?.data?.message || 'Operation failed.');
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-500" />
            <span>Collegiate Teams & Rosters</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Departmental sports clubs, team captains, and active player rosters
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Team</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-navy-900 p-4 rounded-2xl border border-slate-800 max-w-md relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-7 top-7" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by team name, department or captain..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Loading squads...</div>
      ) : teams.length === 0 ? (
        <div className="p-12 rounded-3xl bg-navy-900 border border-slate-800 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No teams found</h3>
          <p className="text-xs text-slate-400 mt-1">Create a new team to begin managing rosters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-2xl bg-navy-900 border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={team.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${team.name}`}
                      alt={team.name}
                      className="w-12 h-12 rounded-2xl bg-slate-800 p-1 border border-slate-700 object-cover shadow-md"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white line-clamp-1 hover:text-blue-400">
                        <Link to={`/teams/${team.id}`}>{team.name}</Link>
                      </h3>
                      <span className="text-[11px] font-mono font-bold text-blue-400">
                        {team.shortName || team.name.slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(team)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteDialog({ isOpen: true, id: team.id, name: team.name })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{team.college} {team.department ? `• ${team.department}` : ''}</span>
                  </div>
                  {team.captainName && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-slate-300">Captain: <strong>{team.captainName}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{team._count?.players ?? 0} Players on Roster</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  {team._count?.tournaments ?? 0} Tournaments
                </span>
                <Link
                  to={`/teams/${team.id}`}
                  className="font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>View Roster</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Team Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Team Details' : 'Register New Squad'}
      >
        {formError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Team Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Cyber Knights"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Short Code</label>
              <input
                type="text"
                maxLength={4}
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })}
                placeholder="CYB"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">College / University</label>
              <input
                type="text"
                required
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="Apex Institute"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department (Optional)</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Computer Science"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Captain Name</label>
              <input
                type="text"
                value={formData.captainName}
                onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                placeholder="e.g., Rohan Sharma"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="team@college.edu"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Logo URL (Optional)</label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95 disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : isEditing ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={handleDelete}
        title="Delete Team"
        message={`Are you sure you want to permanently delete "${deleteDialog.name}"? This will also remove the team from tournaments and roster listings.`}
      />
    </div>
  );
};

export default TeamsPage;
