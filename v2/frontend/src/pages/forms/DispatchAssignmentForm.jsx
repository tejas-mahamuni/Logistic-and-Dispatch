import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assignmentApi, orderApi } from '../../api/orders';
import { driverApi, vehicleApi } from '../../api/fleet';
import { hubApi } from '../../api/hubs';

export const DispatchAssignmentForm = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [searchParams] = useSearchParams();
  const urlHubId = searchParams.get('hubId');
  const urlOrderId = searchParams.get('orderId');

  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState(() => {
    if (isAdmin) {
      return urlHubId ? String(urlHubId) : '2';
    }
    return user?.hubId ? String(user.hubId) : '2';
  });

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
      const [driversData, vehiclesData, ordersData, tripsData] = await Promise.all([
        driverApi.list(hubId).catch(() => []),
        vehicleApi.list(hubId).catch(() => []),
        orderApi.list(hubId).catch(() => []),
        assignmentApi.list(hubId).catch(() => [])
      ]);

      setDrivers(driversData || []);
      setVehicles(vehiclesData || []);

      const assignedOrderIds = new Set((tripsData || []).map((t) => t.orderId).filter(Boolean));
      const unassigned = (ordersData || []).filter((o) => {
        const st = (o.currentStatus || o.status || '').toUpperCase();
        return (st === 'PENDING' || st === 'RECEIVED_AT_HUB' || st === 'CREATED') && !assignedOrderIds.has(o.id);
      });
      setPendingOrders(unassigned);

      if (driversData && driversData.length > 0) setSelectedDriver(String(driversData[0].id));
      if (vehiclesData && vehiclesData.length > 0) setSelectedVehicle(String(vehiclesData[0].id));

      if (urlOrderId) {
        setSelectedOrderIds([Number(urlOrderId)]);
      } else {
        setSelectedOrderIds([]);
      }
    } catch (err) {
      console.error('Failed to load dispatch data:', err);
    }
  };

  useEffect(() => {
    hubApi.list()
      .then((hubsData) => {
        setHubs(hubsData || []);
        const targetHub = isAdmin
          ? (urlHubId ? String(urlHubId) : '2')
          : (user?.hubId ? String(user.hubId) : '2');
        setSelectedHub(targetHub);
        loadHubData(targetHub);
      })
      .catch(console.error);
  }, [user]);

  const handleHubChange = (hubId) => {
    if (!isAdmin) return; // Prevent non-admin from changing hub
    setSelectedHub(hubId);
    loadHubData(hubId);
  };

  const toggleOrderSelection = (id) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === pendingOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(pendingOrders.map((o) => o.id));
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

  const currentHubDisplay = hubs.find((h) => String(h.id) === String(selectedHub));

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
              {isAdmin ? (
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
              ) : (
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm font-semibold text-slate-800">
                  {currentHubDisplay ? `${currentHubDisplay.code} — ${currentHubDisplay.name}` : `Hub #${selectedHub}`}
                </div>
              )}
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
                {drivers.length === 0 ? (
                  <option value="">No drivers available at this hub</option>
                ) : (
                  drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName || d.driverName} ({d.phone})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign Fleet Vehicle
              </label>
              <select
                required
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
              >
                {vehicles.length === 0 ? (
                  <option value="">No vehicles available at this hub</option>
                ) : (
                  vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNo} — {v.vehicleType} ({v.capacityKg} kg cap)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Order Selection */}
        <div className="card-v1 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                2. Select Orders to Bundle ({selectedOrderIds.length} of {pendingOrders.length} selected)
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Only unassigned pending consignments at {currentHubDisplay?.name || `Hub #${selectedHub}`} are displayed.
              </p>
            </div>

            {pendingOrders.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {selectedOrderIds.length === pendingOrders.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {pendingOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
              No unassigned pending parcels available at this hub. All consignments are assigned!
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {pendingOrders.map((o) => {
                const isSelected = selectedOrderIds.includes(o.id);
                return (
                  <div
                    key={o.id}
                    onClick={() => toggleOrderSelection(o.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by div click
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {o.trackingNo || o.trackingNumber}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              (o.paymentMode || 'PREPAID') === 'COD'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {o.paymentMode === 'COD' ? `COD: ₹${o.orderAmount || o.codAmount}` : 'PREPAID'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-700 font-medium block">
                          {o.customerName || o.recipientName} • {o.destinationAddress || o.deliveryAddress}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          PIN: {o.destinationPincode || o.pincode} • Weight: {o.weightKg ? `${o.weightKg} kg` : '1 kg'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={submitting || selectedOrderIds.length === 0}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? 'Generating Trip...' : `Dispatch Trip with ${selectedOrderIds.length} Parcels`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DispatchAssignmentForm;
