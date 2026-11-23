import React, { useState, useEffect } from 'react';
import { assignmentApi, orderApi } from '../../api/orders';
import { driverApi, vehicleApi } from '../../api/fleet';
import { hubApi } from '../../api/hubs';

export const DispatchAssignmentForm = () => {
  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState('2');
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);

  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  const [createdTrip, setCreatedTrip] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadHubData = async (hubId) => {
    try {
      const [driversData, vehiclesData, ordersData] = await Promise.all([
        driverApi.list(hubId),
        vehicleApi.list(hubId),
        orderApi.list(hubId)
      ]);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setPendingOrders(ordersData.filter(o => o.status === 'AT_HUB' || o.status === 'CREATED'));

      if (driversData.length > 0) setSelectedDriver(String(driversData[0].id));
      if (vehiclesData.length > 0) setSelectedVehicle(String(vehiclesData[0].id));
      setSelectedOrderIds([]);
    } catch (err) {
      console.error('Failed to load dispatch data:', err);
    }
  };

  useEffect(() => {
    hubApi.list().then(hubsData => {
      setHubs(hubsData);
      if (hubsData.length > 0) {
        setSelectedHub(String(hubsData[0].id));
        loadHubData(String(hubsData[0].id));
      }
    }).catch(console.error);
  }, []);

  const handleHubChange = (hubId) => {
    setSelectedHub(hubId);
    loadHubData(hubId);
  };

  const toggleOrderSelection = (id) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === pendingOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(pendingOrders.map(o => o.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedOrderIds.length === 0) {
      setError('Please select at least one pending order to create a trip.');
      return;
    }

    setSubmitting(true);
    setError('');
    setCreatedTrip(null);

    const payload = {
      hubId: Number(selectedHub),
      driverId: Number(selectedDriver),
      vehicleId: Number(selectedVehicle),
      orderIds: selectedOrderIds.map(Number)
    };

    try {
      const res = await assignmentApi.create(payload);
      setCreatedTrip(res);
      await loadHubData(selectedHub);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to dispatch trip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 heading-v1">
          Route Dispatch & Trip Manifest Creation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Bundle queued hub parcels into driver runsheets with assigned transport vehicles
        </p>
      </div>

      {createdTrip && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Trip Dispatched Successfully
          </span>
          <p className="text-xs text-emerald-700">
            Trip #{createdTrip.id} generated with {createdTrip.stopCount || selectedOrderIds.length} stops. Consignments updated to OUT_FOR_DELIVERY!
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Resource Configuration */}
        <div className="card-v1 p-6 space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            1. Dispatch Allocation Parameters
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch Hub
              </label>
              <select
                value={selectedHub}
                onChange={(e) => handleHubChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
              >
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.code} — {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign Driver
              </label>
              <select
                required
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName || `Driver #${d.id}`} ({d.licenseNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign Transport Vehicle
              </label>
              <select
                required
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNo} ({v.vehicleType}, {v.capacityKg}kg)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Parcel Selection */}
        <div className="card-v1 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <span className="text-sm font-bold text-slate-800 block">
                2. Select Orders to Bundle into Trip
              </span>
              <span className="text-xs text-slate-500">
                {selectedOrderIds.length} of {pendingOrders.length} orders selected
              </span>
            </div>

            {pendingOrders.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                {selectedOrderIds.length === pendingOrders.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          <div className="overflow-x-auto max-h-80">
            <table className="table-v1">
              <thead>
                <tr>
                  <th className="w-10">Select</th>
                  <th>Tracking Number</th>
                  <th>Destination Address</th>
                  <th>Pincode</th>
                  <th>Weight</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400 text-xs">
                      No unassigned parcels currently waiting at this hub.
                    </td>
                  </tr>
                ) : (
                  pendingOrders.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => toggleOrderSelection(o.id)}
                      className="cursor-pointer hover:bg-blue-50/50"
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(o.id)}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="font-mono text-xs font-bold text-blue-700">
                        {o.trackingNumber}
                      </td>
                      <td className="text-xs text-slate-700 max-w-xs truncate">
                        {o.deliveryAddress}
                      </td>
                      <td className="font-mono text-xs font-semibold">
                        {o.pincode}
                      </td>
                      <td className="text-xs">
                        {o.weightGrams ? `${o.weightGrams}g` : 'Standard'}
                      </td>
                      <td>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || selectedOrderIds.length === 0}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-bold transition-colors disabled:opacity-50"
          >
            {submitting ? 'Generating Trip & Dispatching...' : `Dispatch Trip with ${selectedOrderIds.length} Parcels`}
          </button>
        </div>
      </form>
    </div>
  );
};
