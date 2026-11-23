import React, { useState, useEffect } from 'react';
import { KpiCard } from '../components/KpiCard';
import { useAuth } from '../context/AuthContext';
import { assignmentApi } from '../api/orders';
import { driverApi } from '../api/fleet';

export const DriverDashboard = () => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [deliveryModalItem, setDeliveryModalItem] = useState(null);
  const [codPaymentType, setCodPaymentType] = useState('CASH'); // CASH or UPI
  const [codConfirmed, setCodConfirmed] = useState(false);

  const [delayModalItem, setDelayModalItem] = useState(null);
  const [delayReason, setDelayReason] = useState('Customer Unreachable');
  const [delayRemarks, setDelayRemarks] = useState('');

  // 1. Fetch available drivers for selection
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const list = await driverApi.list();
        setDrivers(list);

        // If currently logged in user is a DRIVER, match their driver ID
        if (user?.role === 'DRIVER') {
          const currentUserId = user?.userId || user?.id;
          let matched = null;
          if (currentUserId) {
            try {
              matched = await driverApi.getByUserId(currentUserId);
            } catch {
              // fallback to list matching
            }
          }
          if (!matched) {
            matched = list.find((d) => 
              (currentUserId && String(d.userId) === String(currentUserId)) || 
              (user?.username && d.username === user?.username) ||
              (d.phone && user?.username && (d.phone === user.username || d.phone.endsWith(user.username))) ||
              (d.phone && user?.phone && d.phone === user.phone)
            );
          }
          if (matched) {
            setSelectedDriverId(String(matched.id));
          } else {
            // Driver is logged in but has no driver profile or no assignments
            setSelectedDriverId('');
            setAssignments([]);
          }
          return;
        }

        // Default to first driver for supervisory roles (ADMIN / MANAGER / DISPATCHER)
        if (list.length > 0) {
          setSelectedDriverId(String(list[0].id));
        }
      } catch (err) {
        console.error('Failed to load drivers list:', err);
      }
    };

    fetchDrivers();
  }, [user]);

  // 2. Fetch assignments whenever selected driver changes
  useEffect(() => {
    if (!selectedDriverId) return;

    const loadDriverTrips = async () => {
      try {
        setLoading(true);
        const data = await assignmentApi.getTodayByDriver(selectedDriverId);
        setAssignments(data || []);
      } catch (err) {
        console.error('Failed to load driver runsheet:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDriverTrips();
  }, [selectedDriverId]);

  const confirmDelivery = async () => {
    if (!deliveryModalItem) return;
    try {
      const remark = deliveryModalItem.paymentMode === 'COD'
        ? `Delivered via ${codPaymentType}. Cash collected: ₹${deliveryModalItem.orderAmount}`
        : 'Delivered successfully (Prepaid order).';
      
      await assignmentApi.updateStopStatus(deliveryModalItem.id, deliveryModalItem.orderId || 0, 'DELIVERED', remark);
      
      setDeliveryModalItem(null);
      setCodConfirmed(false);
      setCodPaymentType('CASH');

      // Reload assignments
      const data = await assignmentApi.getTodayByDriver(selectedDriverId);
      setAssignments(data || []);
    } catch (err) {
      alert('Failed to update delivery status: ' + (err.message || 'Error'));
    }
  };

  const confirmDelay = async () => {
    if (!delayModalItem) return;
    try {
      const fullRemark = delayRemarks.trim() 
        ? `${delayReason} - ${delayRemarks.trim()}`
        : delayReason;

      await assignmentApi.updateStopStatus(delayModalItem.id, delayModalItem.orderId || 0, 'DELAYED', fullRemark);
      
      setDelayModalItem(null);
      setDelayReason('Customer Unreachable');
      setDelayRemarks('');

      // Reload assignments
      const data = await assignmentApi.getTodayByDriver(selectedDriverId);
      setAssignments(data || []);
    } catch (err) {
      alert('Failed to update delay status: ' + (err.message || 'Error'));
    }
  };

  const selectedDriver = drivers.find((d) => String(d.id) === String(selectedDriverId));

  // KPI Calculations
  const totalDeliveries = assignments.length;
  const remainingDeliveries = assignments.filter((a) => a.status !== 'DELIVERED').length;
  const completedDeliveries = assignments.filter((a) => a.status === 'DELIVERED').length;
  const codToCollect = assignments
    .filter((a) => a.status !== 'DELIVERED' && a.paymentMode === 'COD')
    .reduce((sum, a) => sum + (Number(a.orderAmount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 heading-v1">
            Driver Run Sheet &amp; Deliveries
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daily assigned parcel deliveries, COD cash collection, and verified status updates
          </p>
        </div>

        {/* If logged in as driver, show personalized identity pill. If admin/dispatcher, show switcher */}
        {user?.role === 'DRIVER' ? (
          <div className="flex items-center gap-2 bg-blue-50 px-3.5 py-2 rounded-lg border border-blue-200 shadow-sm">
            <span className="text-xs font-bold text-blue-900">Current Driver:</span>
            <span className="text-xs font-bold text-blue-800">
              {selectedDriver?.driverName || user?.fullName || 'Assigned Driver'}
            </span>
            <span className="text-[11px] text-blue-600 font-mono">
              ({selectedDriver?.phone || user?.username})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-lg shadow-sm">
            <label htmlFor="driver-select" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Select Driver:
            </label>
            <select
              id="driver-select"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
            >
              {drivers.length === 0 ? (
                <option value="">No drivers registered</option>
              ) : (
                drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.driverName || d.fullName || d.username || `Driver #${d.id}`} (Mobile: {d.phone || '—'})
                  </option>
                ))
              )}
            </select>
          </div>
        )}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label="Today's Total Stops"
          value={totalDeliveries}
          subtext={`Driver: ${selectedDriver?.driverName || selectedDriver?.fullName || `ID #${selectedDriverId}`}`}
        />
        <KpiCard
          label="Remaining Stops"
          value={remainingDeliveries}
          subtext="Pending deliveries"
          highlight={remainingDeliveries > 0}
        />
        <KpiCard
          label="Delivered Today"
          value={completedDeliveries}
          subtext="Successful handovers"
        />
        <KpiCard
          label="Pending COD Cash"
          value={`₹${codToCollect.toFixed(2)}`}
          subtext="To collect from customers"
          highlight={codToCollect > 0}
        />
      </div>

      {/* Driver Deliveries Table */}
      <div className="card-v1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Run Sheet Stops for {selectedDriver?.driverName || selectedDriver?.fullName || 'Assigned Fleet'}
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Vehicle: {assignments[0]?.vehicleRegNo || selectedDriver?.licenseNumber || 'Assigned Unit'}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
            {assignments.length} assigned parcels
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Loading driver delivery manifest...
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No active deliveries assigned to this driver for today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-v1">
              <thead>
                <tr>
                  <th>Stop #</th>
                  <th>Tracking No</th>
                  <th>Customer &amp; Address</th>
                  <th>Pincode</th>
                  <th>Payment Mode</th>
                  <th>Collection</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((item, index) => (
                  <tr key={item.id} className={item.status === 'DELIVERED' ? 'bg-slate-50/50' : ''}>
                    <td className="font-mono text-xs font-bold text-slate-500">
                      #{index + 1}
                    </td>
                    <td className="font-mono text-xs font-semibold text-blue-700">
                      {item.trackingNo || `Order #${item.orderId}`}
                    </td>
                    <td className="text-xs text-slate-800">
                      <div className="font-semibold">{item.customerName || 'Customer'}</div>
                      <div className="text-slate-500 truncate max-w-xs">{item.destinationAddress || 'Pune'}</div>
                    </td>
                    <td className="font-mono text-xs text-slate-600">
                      {item.destinationPincode || '—'}
                    </td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.paymentMode === 'COD'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-green-100 text-green-900 border border-green-300'
                        }`}
                      >
                        {item.paymentMode || 'PREPAID'}
                      </span>
                    </td>
                    <td className="text-xs font-bold text-slate-900">
                      {item.paymentMode === 'COD' ? `Collect ₹${item.orderAmount}` : '₹0 (Prepaid)'}
                    </td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'DELAYED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {item.status || 'ASSIGNED'}
                      </span>
                    </td>
                    <td className="text-right">
                      {item.status !== 'DELIVERED' ? (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => {
                              setDeliveryModalItem(item);
                              setCodConfirmed(item.paymentMode !== 'COD');
                              setCodPaymentType('CASH');
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition shadow-sm"
                          >
                            Delivered
                          </button>
                          <button
                            onClick={() => {
                              setDelayModalItem(item);
                              setDelayReason('Customer Unreachable');
                              setDelayRemarks('');
                            }}
                            className="px-2.5 py-1 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold transition"
                          >
                            Delayed
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold">
                          ✓ Handed Over
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DELIVERY CONFIRMATION POPUP MODAL */}
      {deliveryModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in duration-150">
            <div className="p-4 bg-emerald-700 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-wide">
                Confirm Parcel Delivery Handover
              </h3>
              <button
                onClick={() => setDeliveryModalItem(null)}
                className="text-white hover:text-emerald-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <div><span className="font-bold">Tracking No:</span> <span className="font-mono text-blue-700 font-bold">{deliveryModalItem.trackingNo}</span></div>
                <div><span className="font-bold">Customer:</span> {deliveryModalItem.customerName}</div>
                <div><span className="font-bold">Address:</span> {deliveryModalItem.destinationAddress}</div>
                <div><span className="font-bold">Payment Type:</span> <span className="font-bold uppercase text-slate-900">{deliveryModalItem.paymentMode}</span></div>
              </div>

              {deliveryModalItem.paymentMode === 'COD' ? (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-sm">AMOUNT TO COLLECT:</span>
                    <span className="text-lg font-extrabold text-amber-900">₹{deliveryModalItem.orderAmount}</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-amber-200">
                    <span className="font-bold text-amber-950 block">Payment Method Received:</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-800">
                        <input
                          type="radio"
                          name="paymentType"
                          value="CASH"
                          checked={codPaymentType === 'CASH'}
                          onChange={() => setCodPaymentType('CASH')}
                        />
                        Cash Received
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-800">
                        <input
                          type="radio"
                          name="paymentType"
                          value="UPI / QR"
                          checked={codPaymentType === 'UPI / QR'}
                          onChange={() => setCodPaymentType('UPI / QR')}
                        />
                        UPI / Online QR
                      </label>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 pt-2 border-t border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={codConfirmed}
                      onChange={(e) => setCodConfirmed(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="text-[11px] text-amber-900 font-semibold leading-tight">
                      I confirm that ₹{deliveryModalItem.orderAmount} has been collected in full from the customer.
                    </span>
                  </label>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-900 font-medium">
                  ✓ <strong>Prepaid Order (₹0 Due)</strong>: No cash collection required. Confirm that parcel has been safely handed over to the recipient.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setDeliveryModalItem(null)}
                className="px-3.5 py-1.5 border border-slate-300 hover:bg-white text-slate-700 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelivery}
                disabled={deliveryModalItem.paymentMode === 'COD' && !codConfirmed}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold disabled:opacity-50 transition shadow-sm"
              >
                Confirm Delivered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELAY REPORTING POPUP MODAL */}
      {delayModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in duration-150">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-wide">
                Report Delivery Delay / Exception
              </h3>
              <button
                onClick={() => setDelayModalItem(null)}
                className="text-white hover:text-slate-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <div><span className="font-bold">Tracking No:</span> <span className="font-mono text-blue-700 font-bold">{delayModalItem.trackingNo}</span></div>
                <div><span className="font-bold">Customer:</span> {delayModalItem.customerName}</div>
                <div><span className="font-bold">Address:</span> {delayModalItem.destinationAddress}</div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Delay Reason:
                </label>
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Customer Unreachable">Customer Unreachable / Phone Switched Off</option>
                  <option value="Customer Requested Reschedule">Customer Requested Reschedule / Next Day</option>
                  <option value="Door Locked / Recipient Not Available">Door Locked / Nobody Available</option>
                  <option value="Incorrect / Incomplete Address">Incorrect or Incomplete Address</option>
                  <option value="Traffic Congestion / Weather Block">Heavy Traffic Congestion / Weather Delay</option>
                  <option value="Customer Refused Delivery">Customer Refused Delivery / Return</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Remarks / Notes <span className="text-slate-400 font-normal">(Optional)</span>:
                </label>
                <textarea
                  value={delayRemarks}
                  onChange={(e) => setDelayRemarks(e.target.value)}
                  placeholder="e.g. Called customer 3 times, neighbor confirmed they are away until evening"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setDelayModalItem(null)}
                className="px-3.5 py-1.5 border border-slate-300 hover:bg-white text-slate-700 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelay}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition shadow-sm"
              >
                Mark Delayed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
