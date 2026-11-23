import React, { useState, useEffect } from 'react';
import { KpiCard } from '../components/KpiCard';
import { useAuth } from '../context/AuthContext';
import { hubApi } from '../api/hubs';
import { orderApi } from '../api/orders';

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState(() => {
    return user?.hubId ? String(user.hubId) : '2';
  });
  const [orders, setOrders] = useState([]);
  const [warehouseQueue, setWarehouseQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hubApi.list().then(setHubs).catch(console.error);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hubOrders, whOrders] = await Promise.all([
        orderApi.list(selectedHub).catch(() => []),
        orderApi.getWarehouseQueue().catch(() => [])
      ]);
      setOrders(hubOrders || []);
      setWarehouseQueue(whOrders || []);
    } catch (err) {
      console.error('Failed to load hub orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedHub]);

  const handleDispatchTruck = async (orderId, targetHubId) => {
    try {
      setLoading(true);
      await orderApi.dispatchTrunkRoute([orderId], targetHubId, 'Trunk Truck Line-Haul');
      await loadData();
    } catch (err) {
      alert('Trunk dispatch error: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAutoShipAll = async () => {
    if (warehouseQueue.length === 0) return;
    try {
      setLoading(true);
      const res = await orderApi.autoShipAll();
      await loadData();
      alert(`Auto-Shipment Successful! Dispatched ${res.length || warehouseQueue.length} parcels from Central Warehouse to their destination hubs.`);
    } catch (err) {
      alert('Auto-ship error: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveAtHub = async (orderId, targetHubId) => {
    try {
      setLoading(true);
      await orderApi.receiveAtHub([orderId], targetHubId);
      await loadData();
    } catch (err) {
      alert('Hub receipt error: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const currentHubName = hubs.find((h) => String(h.id) === selectedHub)?.name || 'Hinjawadi Delivery Hub';

  // Order status counts
  const outForDeliveryCount = orders.filter((o) => (o.currentStatus || o.status) === 'OUT_FOR_DELIVERY').length;
  const deliveredCount = orders.filter((o) => (o.currentStatus || o.status) === 'DELIVERED').length;
  const pendingCount = orders.filter((o) => (o.currentStatus || o.status) === 'PENDING' || (o.currentStatus || o.status) === 'CREATED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 heading-v1">
            Hub Operations Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pipeline, vehicle dispatches &amp; last-mile delivery tracking
          </p>
        </div>

        {/* Hub Filter Selector: Admin selects any hub; Manager locked to their facility */}
        {isAdmin ? (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-300 rounded-lg shadow-sm">
            <label htmlFor="mgr-hub-select" className="text-xs font-bold text-slate-600 whitespace-nowrap">
              Selected Hub:
            </label>
            <select
              id="mgr-hub-select"
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="text-xs font-bold text-blue-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.code} — {h.name} {h.hubType === 'WAREHOUSE' ? '(Warehouse)' : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Assigned Facility:</span>
            <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {currentHubName}
            </span>
          </div>
        )}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Hub Intake Orders" value={orders.length} subtext={currentHubName} />
        <KpiCard label="Out For Delivery" value={outForDeliveryCount} subtext="Active driver routes" highlight={outForDeliveryCount > 0} />
        <KpiCard label="Delivered Today" value={deliveredCount} subtext="Successful stops" />
        <KpiCard label="Pending Assignment" value={pendingCount} subtext="Waiting dispatcher" />
      </div>

      {/* Central Warehouse Trunk Route Transfer Section */}
      <div className="card-v1 overflow-hidden border-indigo-200">
        <div className="p-4 border-b border-indigo-100 bg-indigo-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
              Central Warehouse Trunk Route Transfers (Line-Haul to Hubs)
            </h2>
            <p className="text-xs text-indigo-700 mt-0.5">
              Parcels originating at Pune Central Sorting Warehouse (Chakan) awaiting truck haulage to local delivery hubs
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-white text-indigo-900 border border-indigo-200">
              {warehouseQueue.length} trunk parcels in queue
            </span>
            {warehouseQueue.length > 0 && (
              <button
                type="button"
                onClick={handleAutoShipAll}
                className="px-3.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded-md text-xs font-bold shadow-sm transition inline-flex items-center gap-1.5"
                title="Automatically route and ship all parcels to their destination delivery hubs"
              >
                <span>⚡ Auto-Ship All to Hubs</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {warehouseQueue.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs italic">
              All warehouse parcels have been trunk-shipped and received at their respective local delivery hubs.
            </div>
          ) : (
            <table className="table-v1">
              <thead>
                <tr>
                  <th>Tracking No</th>
                  <th>Destination Address</th>
                  <th>Pincode</th>
                  <th>Target Destination Hub</th>
                  <th>Current Location</th>
                  <th className="text-right">Trunk Transfer Action</th>
                </tr>
              </thead>
              <tbody>
                {warehouseQueue.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono text-xs font-bold text-blue-700">
                      {o.trackingNo}
                    </td>
                    <td className="text-xs text-slate-700 max-w-xs truncate">
                      {o.destinationAddress}
                    </td>
                    <td className="font-mono text-xs font-semibold text-slate-800">
                      {o.destinationPincode}
                    </td>
                    <td className="text-xs font-bold text-indigo-900">
                      {o.targetHubName || o.hubName || `Hub #${o.targetHubId || o.hubId}`}
                    </td>
                    <td>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
                        📦 Central Warehouse (Chakan)
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDispatchTruck(o.id, o.targetHubId || o.hubId)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-sm transition inline-flex items-center gap-1"
                      >
                        Ship Truck to Hub
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-v1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-800">
            Active Orders Pipeline ({currentHubName})
          </span>
          <span className="text-xs text-slate-500">
            {orders.length} orders recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-v1">
            <thead>
              <tr>
                <th>Tracking No</th>
                <th>Customer</th>
                <th>Destination Address</th>
                <th>Pincode</th>
                <th>Amount &amp; Mode</th>
                <th>Weight (kg)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No orders currently assigned to this hub. Use the order intake form to book an order.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const status = o.currentStatus || o.status || 'PENDING';
                  const tracking = o.trackingNo || o.trackingNumber || `ORD-#${o.id}`;
                  const address = o.destinationAddress || o.deliveryAddress || '—';
                  const pincode = o.destinationPincode || o.pincode || '—';
                  const customer = o.customerName || o.recipientName || 'Customer';
                  const weight = o.weightKg ? `${o.weightKg} kg` : (o.weightGrams ? `${o.weightGrams / 1000} kg` : '1.0 kg');
                  const amount = o.orderAmount || o.codAmount || 0;
                  const payMode = o.paymentMode || 'PREPAID';

                  return (
                    <tr key={o.id}>
                      <td className="font-mono text-xs font-semibold text-blue-700">
                        {tracking}
                      </td>
                      <td className="text-xs font-semibold text-slate-900">
                        {customer}
                      </td>
                      <td className="text-xs text-slate-700 max-w-xs truncate">
                        {address}
                      </td>
                      <td className="font-mono text-xs text-slate-600">
                        {pincode}
                      </td>
                      <td className="text-xs">
                        <span className="font-bold text-slate-900">₹{amount}</span>
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          payMode === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {payMode}
                        </span>
                      </td>
                      <td className="font-medium text-slate-700 text-xs">
                        {weight}
                      </td>
                      <td>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : status === 'OUT_FOR_DELIVERY'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : status === 'DELAYED'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
