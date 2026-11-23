import React, { useState, useEffect } from 'react';
import { KpiCard } from '../components/KpiCard';
import { hubApi } from '../api/hubs';

export const AdminDashboard = () => {
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newHub, setNewHub] = useState({
    regionId: 1,
    code: '',
    name: '',
    hubType: 'HUB',
    addressLine: '',
    pincode: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadHubs = async () => {
    try {
      setLoading(true);
      const data = await hubApi.list();
      setHubs(data);
    } catch (err) {
      console.error('Failed to load hubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHubs();
  }, []);

  const handleCreateHub = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await hubApi.create(newHub);
      setShowModal(false);
      setNewHub({
        regionId: 1,
        code: '',
        name: '',
        hubType: 'HUB',
        addressLine: '',
        pincode: ''
      });
      await loadHubs();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create hub');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 heading-v1">
            Global Administration & Hub Infrastructure
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pune Central Distribution Network Master Configuration
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Add New Hub
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Active Hubs" value={hubs.length} subtext="Pune Metropolitan Area" />
        <KpiCard label="Central Sorting" value={hubs.filter(h => h.hubType === 'WAREHOUSE').length} subtext="Chakan Main Hub" />
        <KpiCard label="Last-Mile Hubs" value={hubs.filter(h => h.hubType === 'HUB').length} subtext="City Distribution" highlight />
      </div>

      {/* Hubs Table */}
      <div className="card-v1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-800">
            Registered Hub Facilities
          </span>
          <span className="text-xs text-slate-500">
            Showing {hubs.length} active facilities
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-v1">
            <thead>
              <tr>
                <th>Code</th>
                <th>Facility Name</th>
                <th>Type</th>
                <th>Location / Address</th>
                <th>Pincode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    Loading hubs...
                  </td>
                </tr>
              ) : hubs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    No hubs registered. Click "Add New Hub" to create one.
                  </td>
                </tr>
              ) : (
                hubs.map((h) => (
                  <tr key={h.id}>
                    <td className="font-mono text-xs font-semibold text-blue-700">
                      {h.code}
                    </td>
                    <td className="font-medium text-slate-900">
                      {h.name}
                    </td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        h.hubType === 'WAREHOUSE' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {h.hubType}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600 max-w-xs truncate">
                      {h.addressLine}
                    </td>
                    <td className="font-mono text-xs text-slate-600">
                      {h.pincode}
                    </td>
                    <td>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Hub Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card-v1 max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 heading-v1 mb-4">
              Register New Distribution Hub
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateHub} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hub Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PUN-HUB-06"
                    value={newHub.code}
                    onChange={(e) => setNewHub({ ...newHub, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newHub.hubType}
                    onChange={(e) => setNewHub({ ...newHub, hubType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="HUB">HUB (Last-Mile)</option>
                    <option value="WAREHOUSE">WAREHOUSE (Central)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hub Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Baner Delivery Hub"
                  value={newHub.name}
                  onChange={(e) => setNewHub({ ...newHub, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address Line
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street / Area / Landmark"
                  value={newHub.addressLine}
                  onChange={(e) => setNewHub({ ...newHub, addressLine: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  required
                  pattern="^[1-9][0-9]{5}$"
                  placeholder="411045"
                  value={newHub.pincode}
                  onChange={(e) => setNewHub({ ...newHub, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
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
                  {submitting ? 'Creating...' : 'Register Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
