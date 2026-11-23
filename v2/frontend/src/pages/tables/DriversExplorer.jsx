import React, { useState, useEffect } from 'react';
import { driverApi } from '../../api/fleet';
import { hubApi } from '../../api/hubs';
import { KpiCard } from '../../components/KpiCard';

export const DriversExplorer = () => {
  const [drivers, setDrivers] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [driversData, hubsData] = await Promise.all([
        driverApi.list(selectedHub),
        hubApi.list()
      ]);
      setDrivers(driversData);
      setHubs(hubsData);
    } catch (err) {
      console.error('Failed to load drivers explorer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedHub]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 heading-v1">
            Fleet Drivers Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Certified delivery personnel, active driving permits, and daily delivery allocations
          </p>
        </div>

        <select
          value={selectedHub}
          onChange={(e) => setSelectedHub(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium bg-white text-slate-700"
        >
          <option value="">All Pune Hubs</option>
          {hubs.map((h) => (
            <option key={h.id} value={h.id}>{h.code} — {h.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Enrolled Drivers" value={drivers.length} subtext="Commercial Operators" />
        <KpiCard label="Active Status" value={drivers.filter(d => (d.status || d.employmentStatus) === 'ACTIVE').length} subtext="Ready for dispatch" />
        <KpiCard label="Max Fleet Daily Stops" value={drivers.reduce((acc, d) => acc + (d.maxDailyOrders || 60), 0)} subtext="Combined parcel quota" highlight />
      </div>

      <div className="card-v1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-800">
            Driver Personnel List
          </span>
          <span className="text-xs text-slate-500">
            {drivers.length} drivers enlisted
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-v1">
            <thead>
              <tr>
                <th>Driver ID</th>
                <th>Full Name</th>
                <th>Mobile / Phone</th>
                <th>Assigned Hub</th>
                <th>License Number</th>
                <th>Daily Limit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    Loading driver directory...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No drivers registered under selected hub.
                  </td>
                </tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d.id}>
                    <td className="font-mono text-xs font-bold text-blue-700">
                      #{d.id}
                    </td>
                    <td className="font-semibold text-slate-900">
                      {d.driverName || d.fullName || `Driver #${d.id}`}
                    </td>
                    <td className="font-mono text-xs text-slate-800 font-semibold">
                      {d.phone || '—'}
                    </td>
                    <td className="text-xs text-slate-700 font-medium">
                      {d.hubName || `Hub ID ${d.hubId}`}
                    </td>
                    <td className="font-mono text-xs text-slate-800">
                      {d.licenseNumber}
                    </td>
                    <td className="font-semibold text-slate-800">
                      {d.maxDailyOrders || 60} stops/day
                    </td>
                    <td>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        {d.status || d.employmentStatus || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
