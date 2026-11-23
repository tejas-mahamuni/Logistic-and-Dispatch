import React, { useState, useEffect } from 'react';
import { userApi } from '../api/users';
import { hubApi } from '../api/hubs';
import { KpiCard } from '../components/KpiCard';

export const UserDirectory = () => {
  const [users, setUsers] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'MANAGER',
    hubId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, hubsData] = await Promise.all([
        userApi.list(),
        hubApi.list()
      ]);
      setUsers(usersData);
      setHubs(hubsData);
    } catch (err) {
      console.error('Failed to load user directory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      ...newUser,
      hubId: (newUser.role === 'ADMIN' || newUser.role === 'CUSTOMER') ? null : (newUser.hubId ? Number(newUser.hubId) : null)
    };

    try {
      await userApi.create(payload);
      setShowModal(false);
      setNewUser({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'MANAGER',
        hubId: ''
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const getHubName = (hubId) => {
    if (!hubId) return 'Global (Unscoped)';
    const hub = hubs.find(h => h.id === hubId);
    return hub ? `${hub.code} — ${hub.name}` : `Hub ID: ${hubId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 heading-v1">
            System User Directory & Access Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage authenticated administrators, hub managers, dispatchers, and drivers
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Add New User
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Total Users" value={users.length} subtext="System accounts" />
        <KpiCard label="Hub Managers" value={users.filter(u => u.role === 'MANAGER').length} subtext="Facility heads" />
        <KpiCard label="Dispatchers" value={users.filter(u => u.role === 'DISPATCHER').length} subtext="Operations staff" />
        <KpiCard label="Drivers" value={users.filter(u => u.role === 'DRIVER').length} subtext="Last-mile delivery" highlight />
      </div>

      {/* Users Table */}
      <div className="card-v1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-800">
            Registered System Accounts
          </span>
          <span className="text-xs text-slate-500">
            {users.length} accounts active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-v1">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Assigned Hub</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    No accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-mono text-xs font-semibold text-blue-700">
                      {u.username}
                    </td>
                    <td className="font-medium text-slate-900">
                      {u.fullName}
                    </td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700'
                          : u.role === 'MANAGER'
                          ? 'bg-blue-50 text-blue-700'
                          : u.role === 'DISPATCHER'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600">
                      {getHubName(u.hubId)}
                    </td>
                    <td className="text-xs text-slate-500">
                      {u.email || u.phone || '—'}
                    </td>
                    <td>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-v1 max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 heading-v1 mb-4">
              Create New System Account
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. kothrud.mgr"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kulkarni"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="ADMIN">ADMIN (Global)</option>
                    <option value="MANAGER">MANAGER (Hub)</option>
                    <option value="DISPATCHER">DISPATCHER (Hub)</option>
                    <option value="DRIVER">DRIVER (Hub)</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Hub
                  </label>
                  <select
                    disabled={newUser.role === 'ADMIN' || newUser.role === 'CUSTOMER'}
                    value={newUser.hubId}
                    onChange={(e) => setNewUser({ ...newUser, hubId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">-- Select Hub --</option>
                    {hubs.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.code} — {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="user@logistic.local"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+919800000000"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
