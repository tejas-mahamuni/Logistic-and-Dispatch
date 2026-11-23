import React, { useState, useEffect } from 'react';
import { vehicleApi } from '../../api/fleet';
import { hubApi } from '../../api/hubs';

export const VehicleForm = () => {
  const [hubs, setHubs] = useState([]);
  const [loadingHubs, setLoadingHubs] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [formData, setFormData] = useState({
    registrationNo: '',
    hubId: '',
    vehicleType: 'BIKE',
    capacityKg: 35,
    capacityVolumeL: 100
  });

  const [savedVehicle, setSavedVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadHubs = async () => {
    try {
      setLoadingHubs(true);
      const data = await hubApi.list();
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setHubs(list);
      if (list.length > 0) {
        setFormData(prev => ({
          ...prev,
          hubId: prev.hubId ? prev.hubId : list[0].id
        }));
      }
    } catch (err) {
      console.error('Failed to load hubs from database:', err);
    } finally {
      setLoadingHubs(false);
    }
  };

  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const data = await vehicleApi.list();
      setVehicles(Array.isArray(data) ? data : (data?.content || []));
    } catch (err) {
      console.error('Failed to load vehicles from database:', err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    loadHubs();
    loadVehicles();
  }, []);

  const handleTypeChange = (type) => {
    let capKg = 35;
    let capVol = 100;
    if (type === 'THREE_WHEELER') {
      capKg = 350;
      capVol = 1200;
    } else if (type === 'MINI_VAN') {
      capKg = 800;
      capVol = 2800;
    } else if (type === 'TRUCK') {
      capKg = 2500;
      capVol = 8000;
    }
    setFormData({
      ...formData,
      vehicleType: type,
      capacityKg: capKg,
      capacityVolumeL: capVol
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSavedVehicle(null);

    if (!formData.registrationNo.trim()) {
      setError('Vehicle registration number is required (e.g. MH12-EV-2025).');
      return;
    }

    if (!formData.hubId) {
      setError('Please select an assigned hub base.');
      return;
    }

    setSubmitting(true);

    const payload = {
      registrationNo: formData.registrationNo.trim().toUpperCase().replace(/\s+/g, '-'),
      hubId: Number(formData.hubId),
      vehicleType: formData.vehicleType,
      capacityKg: Number(formData.capacityKg),
      capacityVolumeL: Number(formData.capacityVolumeL)
    };

    try {
      const res = await vehicleApi.create(payload);
      setSavedVehicle(res);
      setFormData({
        registrationNo: '',
        hubId: hubs.length > 0 ? hubs[0].id : '',
        vehicleType: 'BIKE',
        capacityKg: 35,
        capacityVolumeL: 100
      });
      loadVehicles();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to register vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 heading-v1">
          Fleet Vehicle Registration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Enlist EV bikes, 3-wheelers, and vans with designated payload limits and hub bases
        </p>
      </div>

      {savedVehicle && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Vehicle Enlisted Successfully
          </span>
          <p className="text-xs text-emerald-700">
            Vehicle #{savedVehicle.id} ({savedVehicle.registrationNo}) registered under {savedVehicle.hubName || `Hub #${savedVehicle.hubId}`} with payload capacity {savedVehicle.capacityKg} kg.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
          {error}
        </div>
      )}

      <div className="card-v1 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Registration No *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MH12-EV-2025"
                value={formData.registrationNo}
                onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none uppercase"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Indian RTO format (e.g. MH12-RN-1001)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Hub Base *
              </label>
              <select
                required
                value={formData.hubId}
                onChange={(e) => setFormData({ ...formData, hubId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
              >
                {loadingHubs ? (
                  <option value="" disabled>Loading hubs from database...</option>
                ) : hubs.length === 0 ? (
                  <option value="" disabled>No active hubs found in database</option>
                ) : (
                  hubs.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.code || h.hubCode} — {h.name || h.hubName} {h.pincode ? `(PIN: ${h.pincode})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vehicle Class & Type
            </label>
            <select
              value={formData.vehicleType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
            >
              <option value="BIKE">Two-Wheeler EV Bike (Payload: 35 kg / 100 L)</option>
              <option value="THREE_WHEELER">Three-Wheeler Cargo Auto (Payload: 350 kg / 1200 L)</option>
              <option value="MINI_VAN">Mini Van Cargo (Payload: 800 kg / 2800 L)</option>
              <option value="TRUCK">Heavy Logistics Truck (Payload: 2500 kg / 8000 L)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payload Weight Limit (kg)
              </label>
              <input
                type="number"
                min="10"
                value={formData.capacityKg}
                onChange={(e) => setFormData({ ...formData, capacityKg: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Volumetric Capacity (Litres)
              </label>
              <input
                type="number"
                min="50"
                value={formData.capacityVolumeL}
                onChange={(e) => setFormData({ ...formData, capacityVolumeL: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Registering Vehicle...' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </div>

      {/* Live Database Records */}
      <div className="card-v1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              Enlisted Fleet Vehicles in Database
            </span>
            <span className="text-xs text-slate-500">
              {loadingVehicles ? 'Fetching from database...' : `${vehicles.length} fleet vehicles loaded`}
            </span>
          </div>
          <button
            type="button"
            onClick={loadVehicles}
            className="px-3 py-1 text-xs border border-slate-300 bg-white hover:bg-slate-50 rounded text-slate-600 transition"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="table-v1 w-full text-xs">
            <thead className="bg-slate-100 text-slate-600 sticky top-0">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Registration No</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Assigned Hub</th>
                <th className="p-2 text-left">Payload (kg)</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loadingVehicles ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-slate-400">Loading vehicles from database...</td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-slate-400">No vehicles enlisted yet.</td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono text-slate-500">#{v.id}</td>
                    <td className="p-2 font-mono font-bold text-slate-800">{v.registrationNo}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {v.vehicleType}
                      </span>
                    </td>
                    <td className="p-2 text-slate-700">{v.hubName || `Hub #${v.hubId}`}</td>
                    <td className="p-2 text-slate-700">{v.capacityKg} kg</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
