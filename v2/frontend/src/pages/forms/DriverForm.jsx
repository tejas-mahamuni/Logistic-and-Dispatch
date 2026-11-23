import React, { useState, useEffect } from 'react';
import { driverApi } from '../../api/fleet';
import { hubApi } from '../../api/hubs';

export const DriverForm = () => {
  const [hubs, setHubs] = useState([]);
  const [loadingHubs, setLoadingHubs] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    hubId: '',
    licenseNumber: '',
    licenseExpiry: '2030-12-31',
    maxDailyOrders: 60
  });

  const [savedDriver, setSavedDriver] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const phoneRegex = /^[6-9]\d{9}$/;
  const isPhoneValid = !formData.phone || phoneRegex.test(formData.phone);

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

  const loadDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const data = await driverApi.list();
      setDrivers(Array.isArray(data) ? data : (data?.content || []));
    } catch (err) {
      console.error('Failed to load drivers from database:', err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  useEffect(() => {
    loadHubs();
    loadDrivers();
  }, []);

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSavedDriver(null);

    if (!formData.fullName.trim()) {
      setError('Driver full name is required.');
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      setError('Invalid Mobile Number: Driver phone must be exactly 10 digits starting with 6, 7, 8, or 9.');
      return;
    }

    if (!formData.hubId) {
      setError('Please select an assigned delivery hub.');
      return;
    }

    if (!formData.licenseNumber.trim()) {
      setError('Driving license number is required.');
      return;
    }

    setSubmitting(true);

    const payload = {
      fullName: formData.fullName.trim(),
      driverName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      hubId: Number(formData.hubId),
      licenseNumber: formData.licenseNumber.trim().toUpperCase(),
      licenseExpiry: formData.licenseExpiry,
      maxDailyOrders: Number(formData.maxDailyOrders)
    };

    try {
      const res = await driverApi.create(payload);
      setSavedDriver(res);
      setFormData({
        fullName: '',
        phone: '',
        hubId: hubs.length > 0 ? hubs[0].id : '',
        licenseNumber: '',
        licenseExpiry: '2030-12-31',
        maxDailyOrders: 60
      });
      loadDrivers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to register driver');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 heading-v1">
          Driver Fleet Onboarding
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Register last-mile delivery personnel with commercial driving permits, verified phone numbers, and hub assignments
        </p>
      </div>

      {savedDriver && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Driver Onboarded Successfully
          </span>
          <p className="text-xs text-emerald-700">
            Driver ID #{savedDriver.id} ({savedDriver.driverName || savedDriver.fullName}) enrolled with License {savedDriver.licenseNumber} for Hub {savedDriver.hubName || savedDriver.hubId}.
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
                Driver Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Pawar"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile / Phone Number (10 Digits) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400 font-mono select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="9822123456"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={`w-full pl-11 pr-3 py-2 border rounded-md text-sm font-mono focus:outline-none ${
                    formData.phone && !isPhoneValid
                      ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-1 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-1 focus:ring-blue-600'
                  }`}
                />
              </div>
              {formData.phone && !isPhoneValid ? (
                <p className="text-[11px] text-red-600 mt-1">
                  Enter valid 10 digits starting with 6, 7, 8, or 9
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  Driver communication & login contact
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Delivery Hub *
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Driving License Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MH12-2022-0087654"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                License Expiry Date *
              </label>
              <input
                type="date"
                required
                value={formData.licenseExpiry}
                onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Daily Parcel Stops
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={formData.maxDailyOrders}
                onChange={(e) => setFormData({ ...formData, maxDailyOrders: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting || (formData.phone && !isPhoneValid)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Enrolling Driver...' : 'Enroll Driver'}
            </button>
          </div>
        </form>
      </div>

      {/* Live Database Records */}
      <div className="card-v1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              Enrolled Drivers in Database
            </span>
            <span className="text-xs text-slate-500">
              {loadingDrivers ? 'Fetching from database...' : `${drivers.length} drivers registered`}
            </span>
          </div>
          <button
            type="button"
            onClick={loadDrivers}
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
                <th className="p-2 text-left">Driver Name</th>
                <th className="p-2 text-left">Mobile / Phone</th>
                <th className="p-2 text-left">Assigned Hub</th>
                <th className="p-2 text-left">License No</th>
                <th className="p-2 text-left">Max Daily Stops</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loadingDrivers ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-slate-400">Loading drivers from database...</td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-slate-400">No drivers enrolled yet.</td>
                </tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono text-slate-500">#{d.id}</td>
                    <td className="p-2 font-medium text-slate-800">{d.driverName || d.fullName}</td>
                    <td className="p-2 font-mono text-blue-600">{d.phone}</td>
                    <td className="p-2 text-slate-700">{d.hubName || `Hub #${d.hubId}`}</td>
                    <td className="p-2 font-mono text-slate-600">{d.licenseNumber}</td>
                    <td className="p-2 text-slate-700">{d.maxDailyOrders || 60}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {d.status || 'ACTIVE'}
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
