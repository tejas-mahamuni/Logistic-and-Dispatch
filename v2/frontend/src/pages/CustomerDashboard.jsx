import React, { useState, useEffect } from 'react';
import { orderApi } from '../api/orders';
import { useAuth } from '../context/AuthContext';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [myOrders, setMyOrders] = useState([]);
  const [trackingNo, setTrackingNo] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch logged in customer's order history
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const data = await orderApi.getMyOrders();
        setMyOrders(data || []);
      } catch (err) {
        console.error('Failed to load my orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  const handleTrack = async (trackNumber) => {
    const numToTrack = trackNumber || trackingNo;
    if (!numToTrack || !numToTrack.trim()) return;

    setTrackingLoading(true);
    setError('');
    setTrackedOrder(null);

    try {
      const data = await orderApi.track(numToTrack.trim());
      setTrackedOrder(data);
      setTrackingNo(numToTrack.trim());
    } catch (err) {
      setError('No package found matching tracking number: ' + numToTrack);
    } finally {
      setTrackingLoading(false);
    }
  };

  const steps = ['PENDING', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  const getStepIndex = (status) => {
    const norm = (status || '').toUpperCase();
    if (norm === 'CREATED') return 0;
    if (norm === 'PENDING') return 0;
    if (norm === 'ASSIGNED' || norm === 'AT_HUB') return 1;
    if (norm === 'OUT_FOR_DELIVERY' || norm === 'IN_TRANSIT') return 2;
    if (norm === 'DELIVERED') return 3;
    return 0;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 heading-v1">
          Customer Portal &amp; Package Tracking
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Welcome, <span className="font-semibold text-slate-800">{user?.fullName || user?.username}</span>! View your orders and live consignment status.
        </p>
      </div>

      {/* Tracking Input Card */}
      <div className="card-v1 p-6">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Real-Time Waybill Tracker
        </span>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            required
            value={trackingNo}
            onChange={(e) => setTrackingNo(e.target.value)}
            placeholder="Enter Waybill / Tracking No (e.g. TRK-PUN-1001)"
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
          <button
            type="submit"
            disabled={trackingLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {trackingLoading ? 'Searching...' : 'Track Package'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Tracking Results Card */}
      {trackedOrder && (
        <div className="card-v1 p-6 space-y-6 border-l-4 border-l-blue-600">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-200 gap-2">
            <div>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Waybill Number
              </span>
              <h2 className="text-xl font-bold font-mono text-blue-700">
                {trackedOrder.trackingNumber || trackedOrder.trackingNo || trackingNo}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded text-xs font-bold ${
                  trackedOrder.paymentMode === 'COD'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-green-100 text-green-900 border border-green-300'
                }`}
              >
                {trackedOrder.paymentMode === 'COD'
                  ? `Amount Payable on Delivery: ₹${trackedOrder.orderAmount || trackedOrder.codAmount || 0} (Cash / UPI)`
                  : '✓ Paid Online (₹0 Due on Delivery)'}
              </span>
              <span className="px-3 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Status: {trackedOrder.status || trackedOrder.currentStatus || 'PENDING'}
              </span>
            </div>
          </div>

          {/* Timeline Bar */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-4">
              Consignment Progress
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              {steps.map((st, i) => {
                const currentIndex = getStepIndex(trackedOrder.status || trackedOrder.currentStatus);
                const isPassed = i <= currentIndex;
                const isCurrent = i === currentIndex;

                return (
                  <div key={st} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isCurrent
                          ? 'text-blue-700 font-bold'
                          : isPassed
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Destination:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                {trackedOrder.destinationAddress || trackedOrder.deliveryAddress || 'Standard Delivery Address'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Pincode:</span>
              <span className="font-semibold font-mono text-slate-800 mt-0.5 block">
                {trackedOrder.destinationPincode || trackedOrder.pincode || '411033'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Promised Delivery:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {trackedOrder.promisedDate || 'Within 24 Hours'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* My Consignments Table */}
      <div className="card-v1 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800">
            My Orders &amp; Consignments ({myOrders.length})
          </h3>
          <span className="text-xs text-slate-500">
            Click any row or tracking number to track
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-v1">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Destination</th>
                <th>Pincode</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-400 text-xs">
                    Loading your orders...
                  </td>
                </tr>
              ) : myOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-400 text-xs">
                    No orders booked under your account yet. Use the tracker above to track by waybill number.
                  </td>
                </tr>
              ) : (
                myOrders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => handleTrack(o.trackingNo)}
                    className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="font-mono text-xs font-bold text-blue-700">
                      {o.trackingNo}
                    </td>
                    <td className="text-xs text-slate-700 max-w-xs truncate">
                      {o.destinationAddress}
                    </td>
                    <td className="font-mono text-xs text-slate-600">
                      {o.destinationPincode}
                    </td>
                    <td className="text-xs font-semibold text-slate-800">
                      ₹{o.orderAmount || 0}
                    </td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.paymentMode === 'COD'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-green-100 text-green-900 border border-green-300'
                        }`}
                      >
                        {o.paymentMode}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          o.currentStatus === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.currentStatus === 'DELAYED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {o.currentStatus}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrack(o.trackingNo);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition"
                      >
                        Track
                      </button>
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

export default CustomerDashboard;
