import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { KpiCard } from '../components/KpiCard';
import { useAuth } from '../context/AuthContext';
import { orderApi, assignmentApi } from '../api/orders';
import { driverApi, vehicleApi } from '../api/fleet';
import { hubApi } from '../api/hubs';

export const DispatcherDashboard = () => {
  const { user } = useAuth();
  const [hubInfo, setHubInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentHubId = user?.hubId || 2;

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, tripsData, driversData, vehiclesData, hubsList] = await Promise.all([
        orderApi.list(currentHubId).catch(() => []),
        assignmentApi.list(currentHubId).catch(() => []),
        driverApi.list(currentHubId).catch(() => []),
        vehicleApi.list(currentHubId).catch(() => []),
        hubApi.list().catch(() => [])
      ]);
      setOrders(ordersData || []);
      setTrips(tripsData || []);
      setDrivers(driversData || []);
      setVehicles(vehiclesData || []);
      if (hubsList && currentHubId) {
        const found = hubsList.find(h => String(h.id) === String(currentHubId));
        setHubInfo(found);
      }
    } catch (err) {
      console.error('Error loading dispatcher board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const assignedOrderIds = new Set(trips.map(t => t.orderId).filter(Boolean));
  const unassignedOrders = orders.filter(
    (o) => {
      const st = (o.currentStatus || o.status || '').toUpperCase();
      return (st === 'PENDING' || st === 'RECEIVED_AT_HUB') && !assignedOrderIds.has(o.id);
    }
  );

  const handleAutoAssign = async () => {
    try {
      setLoading(true);
      await assignmentApi.autoAssign(currentHubId);
      await loadData();
    } catch (err) {
      alert('Auto-assign notice: ' + (err.message || 'Complete'));
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 heading-v1">
              Last-Mile Dispatch Board
            </h1>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full">
              {hubInfo ? `${hubInfo.name} (${hubInfo.code})` : `Hub #${currentHubId}`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Strict local hub isolation: vehicle allocation, driver route assignment &amp; pending parcel queue
          </p>
        </div>

        <button
          onClick={handleAutoAssign}
          disabled={loading || unassignedOrders.length === 0}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
        >
          Auto-Assign Hub Pending Orders
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Queue (Unassigned)" value={unassignedOrders.length} subtext="Awaiting route creation" highlight={unassignedOrders.length > 0} />
        <KpiCard label="Active Assignments" value={trips.length} subtext="Live driver dispatches" />
        <KpiCard label="Available Drivers" value={drivers.length} subtext="Fleet active quota" />
        <KpiCard label="Vehicles Ready" value={vehicles.length} subtext="Fleet status: AVAILABLE" />
      </div>

      {/* Two-Column Dispatch Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Unassigned Orders */}
        <div className="card-v1 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-800">
              Unassigned Orders Queue
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold font-mono">
              {unassignedOrders.length} pending
            </span>
          </div>

          <div className="p-2 space-y-2 max-h-[460px] overflow-y-auto">
            {unassignedOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No orders waiting for assignment. All parcels dispatched!
              </div>
            ) : (
              unassignedOrders.map((o) => (
                <div
                  key={o.id}
                  className="p-3 border border-slate-200 rounded-lg hover:border-blue-400 transition-colors bg-white flex justify-between items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">
                        {o.trackingNo || o.trackingNumber}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        (o.paymentMode || 'PREPAID') === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {o.paymentMode === 'COD' ? `COD: ₹${o.orderAmount || o.codAmount}` : 'PREPAID'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-700 font-semibold block mt-0.5">
                      {o.customerName || o.recipientName || 'Customer'}
                    </span>
                    <span className="text-xs text-slate-500 block truncate">
                      {o.destinationAddress || o.deliveryAddress}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      PIN: {o.destinationPincode || o.pincode} • {o.weightKg ? `${o.weightKg}kg` : '1kg'}
                    </span>
                  </div>

                  <Link
                    to="/forms/dispatch"
                    className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-semibold border border-blue-200 whitespace-nowrap"
                  >
                    Assign
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Dispatches */}
        <div className="card-v1 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-800">
              Live Dispatch Assignments
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold font-mono">
              {trips.length} assigned
            </span>
          </div>

          <div className="p-2 space-y-2 max-h-[460px] overflow-y-auto">
            {trips.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No active dispatches. Use the assignment form or Auto-Assign to allocate orders.
              </div>
            ) : (
              trips.map((t) => (
                <div
                  key={t.id}
                  className="p-3 border border-slate-200 rounded-lg bg-white space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      Assignment #{t.id} — {t.trackingNo || `Order #${t.orderId}`}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                      {t.status || 'ASSIGNED'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Driver: <span className="font-semibold text-slate-800">{t.driverName || `Driver #${t.driverId}`}</span> • Vehicle: <span className="font-semibold text-slate-800">{t.vehicleRegNo || `Vehicle #${t.vehicleId}`}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    Destination: {t.destinationAddress || 'Pune'} ({t.destinationPincode})
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatcherDashboard;
