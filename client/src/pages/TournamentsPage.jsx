import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { tournamentService } from '../services/tournamentService';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Plus,
  Calendar,
  MapPin,
  Search,
  Filter,
  Edit2,
  Trash2,
  Users,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDate, getStatusBadgeClass, getSportBadgeClass } from '../utils/formatters';

const TournamentsPage = () => {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    sportType: 'CRICKET',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    status: 'UPCOMING'
  });

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });

  const fetchTournaments = async () => {
    try {
      const params = {};
      if (sportFilter !== 'ALL') params.sportType = sportFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;

      const res = await tournamentService.getAll(params);
      if (res.success) {
        setTournaments(res.data.tournaments || []);
      }
    } catch (err) {
      console.error('Error fetching tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [sportFilter, statusFilter, search]);

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
      sportType: 'CRICKET',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: '',
      description: '',
      status: 'UPCOMING'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setIsEditing(true);
    setCurrentId(t.id);
    setFormData({
      name: t.name,
      sportType: t.sportType,
      startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : '',
      endDate: t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : '',
      location: t.location || '',
      description: t.description || '',
      status: t.status
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
        await tournamentService.update(currentId, formData);
      } else {
        await tournamentService.create(formData);
      }
      setIsModalOpen(false);
      fetchTournaments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save tournament.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await tournamentService.delete(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchTournaments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete tournament.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#252a37]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-[#4cd7f6]" />
            <span>Tournaments & Championships</span>
          </h1>
          <p className="text-xs text-[#8c909f] mt-1">
            Browse active collegiate leagues, team brackets, and championship schedules
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tournament</span>
          </button>
        )}
      </div>

      {/* Filter and Search Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tournaments by name or location..."
            className="w-full bg-[#1a1f2c] border border-[#252a37] rounded pl-9 pr-3 py-2 text-xs text-[#dee2f4] placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff]"
          />
        </div>

        {/* Sport Type Filter */}
        <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'CRICKET', 'FOOTBALL', 'BASKETBALL'].map((sport) => (
            <button
              key={sport}
              onClick={() => setSportFilter(sport)}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                sportFilter === sport
                  ? 'bg-[#4d8eff] text-[#00285d] shadow-sm'
                  : 'bg-[#1a1f2c] border border-[#252a37] text-[#c2c6d6] hover:bg-[#252a37]'
              }`}
            >
              {sport === 'ALL' ? 'All Sports' : sport.charAt(0) + sport.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#1a1f2c] border border-[#252a37] rounded px-3 py-2 text-xs text-[#dee2f4] focus:outline-none focus:border-[#4d8eff]"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#8c909f]">
          Loading tournament directories...
        </div>
      ) : tournaments.length === 0 ? (
        <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-12 text-center space-y-3">
          <Trophy className="w-10 h-10 text-[#8c909f] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-white">No tournaments found</h3>
          <p className="text-xs text-[#8c909f]">
            Try adjusting your search criteria or create a new tournament.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <div
              key={t.id}
              className="rounded-xl bg-[#1a1f2c] border border-[#252a37] hover:border-[#4d8eff]/50 p-4 sm:p-5 flex flex-col justify-between shadow-lg transition-all space-y-4"
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#252a37] text-[#4cd7f6] uppercase tracking-wider">
                    {t.sportType}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      t.status === 'ONGOING'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : t.status === 'COMPLETED'
                        ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30'
                        : 'bg-[#252a37] text-[#8c909f]'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                {/* Tournament Info */}
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                    {t.name}
                  </h3>
                  <p className="text-xs text-[#8c909f] line-clamp-2 mt-1 leading-relaxed">
                    {t.description || 'Inter-collegiate championship series for registered campus department teams.'}
                  </p>
                </div>

                {/* Metadata Items */}
                <div className="space-y-1.5 pt-2 border-t border-[#252a37] text-xs text-[#c2c6d6]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#8c909f] shrink-0" />
                    <span>
                      {formatDate(t.startDate)} - {formatDate(t.endDate)}
                    </span>
                  </div>
                  {t.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#8c909f] shrink-0" />
                      <span className="truncate">{t.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#4cd7f6] shrink-0" />
                    <span>{t.teams?.length || 0} Participating Teams</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#252a37] flex items-center justify-between">
                <Link
                  to={`/tournaments/${t.id}`}
                  className="font-bold text-xs text-[#4cd7f6] hover:underline flex items-center gap-1"
                >
                  <span>Tournament Overview</span>
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

      {/* Create / Edit Tournament Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Tournament' : 'Create New Tournament'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Tournament Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Annual T20 Collegiate Trophy 2026"
              className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Sport Type *</label>
              <select
                value={formData.sportType}
                onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              >
                <option value="CRICKET">Cricket (T20)</option>
                <option value="FOOTBALL">Football</option>
                <option value="BASKETBALL">Basketball</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Location / Venue</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. University Main Sports Arena"
              className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tournament format, eligibility, rules..."
              className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
            />
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
              {formLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Tournament"
        message={`Are you sure you want to delete "${deleteDialog.name}"? This action will permanently remove all associated matches and point standings.`}
        confirmText="Delete Tournament"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
};

export default TournamentsPage;
