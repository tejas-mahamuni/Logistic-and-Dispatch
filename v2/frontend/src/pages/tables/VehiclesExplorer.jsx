import React, { useState, useEffect } from 'react';
import { vehicleApi } from '../../api/fleet';
import { hubApi } from '../../api/hubs';
import { KpiCard } from '../../components/KpiCard';

export const VehiclesExplorer = () => {
  const [vehicles, setVehicles] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiclesData, hubsData] = await Promise.all([
        vehicleApi.list(selectedHub),
        hubApi.list()
      ]);
      setVehicles(vehiclesData);
      setHubs(hubsData);
    } catch (err) {
      console.error('Failed to load vehicles explorer:', err);
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
            Fleet Vehicles Master Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Active delivery transport assets, volumetric capacities, and hub station allocations
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Total Vehicles" value={vehicles.length} subtext="Network fleet" />
        <KpiCard label="EV Bikes" value={vehicles.filter(v => v.vehicleType === 'BIKE').length} subtext="Quick urban delivery" />
        <KpiCard label="Three-Wheelers" value={vehicles.filter(v => v.vehicleType === 'THREE_WHEELER').length} subtext="Medium cargo" />
        <KpiCard label="Mini-Vans" value={vehicles.filter(v => v.vehicleType === 'MINI_VAN').length} subtext="Heavy bulk haulage" highlight />
      </div>

      <div className="card-v1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-800">
            Transport Assets List
          </span>
          <span className="text-xs text-slate-500">
            {vehicles.length} vehicles registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-v1">
            <thead>
              <tr>
                <th>Registration No</th>
                <th>Vehicle Class</th>
                <th>Hub Base</th>
                <th>Payload (kg)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">
                    Loading vehicle inventory...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">
                    No vehicles registered for selected hub.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="font-mono text-xs font-bold text-blue-700">
                      {v.registrationNo}
                    </td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        v.vehicleType === 'MINI_VAN'
                          ? 'bg-purple-50 text-purple-700'
                          : v.vehicleType === 'THREE_WHEELER'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {v.vehicleType}
                      </span>
                    </td>
                    <td className="text-xs text-slate-700 font-medium">
                      {v.hubName || `Hub ID ${v.hubId}`}
                    </td>
                    <td className="font-semibold text-slate-800">
                      {v.capacityKg} kg
                    </td>
                    <td>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        {v.status || 'AVAILABLE'}
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
