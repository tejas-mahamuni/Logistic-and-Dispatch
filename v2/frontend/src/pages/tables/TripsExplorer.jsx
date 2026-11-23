import React, { useState, useEffect } from 'react';
import { assignmentApi } from '../../api/orders';
import { hubApi } from '../../api/hubs';
import { driverApi } from '../../api/fleet';
import { useAuth } from '../../context/AuthContext';
import { KpiCard } from '../../components/KpiCard';

export const TripsExplorer = () => {
  const { user } = useAuth();
  const isDriver = user?.role === 'DRIVER';

  const [assignments, setAssignments] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [driverProfile, setDriverProfile] = useState(null);
  const [selectedHub, setSelectedHub] = useState('');
  const [loading, setLoading] = useState(true);

  // Load hubs and driver profile if applicable
  useEffect(() => {
    const init = async () => {
      try {
        const hubsData = await hubApi.list();
        setHubs(hubsData || []);

        if (isDriver) {
          const currentUserId = user?.userId || user?.id;
          let matched = null;
          if (currentUserId) {
            try {
              matched = await driverApi.getByUserId(currentUserId);
            } catch {
              // fallback to list scan
            }
          }
          if (!matched) {
            const driversList = await driverApi.list();
            matched = driversList.find((d) =>
              (currentUserId && String(d.userId) === String(currentUserId)) ||
              (user?.username && d.username === user.username) ||
              (d.phone && user?.username && (d.phone === user.username || d.phone.endsWith(user.username))) ||
              (d.phone && user?.phone && d.phone === user.phone)
            );
          }
          setDriverProfile(matched || null);
          if (matched?.hubId || user?.hubId) {
            setSelectedHub(String(matched?.hubId || user?.hubId));
          }
        }
      } catch (err) {
        console.error('Failed to initialize trips explorer:', err);
      }
    };

    init();
  }, [user, isDriver]);

  // Load assignments when selectedHub or driverProfile changes
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);

        if (isDriver) {
          // If logged in as driver, must strictly isolate to their driverId
          if (!driverProfile?.id) {
            // Driver profile not yet linked or resolved
            setAssignments([]);
            setLoading(false);
            return;
          }

          const driverHub = driverProfile.hubId || user?.hubId || '';
          const assignData = await assignmentApi.list(driverHub, driverProfile.id);
          // Redundant frontend safety filter
          const myAssignments = (assignData || []).filter(
            (t) => String(t.driverId) === String(driverProfile.id)
          );
          setAssignments(myAssignments);
        } else {
          // Supervisor view: All or selected hub
          const assignData = await assignmentApi.list(selectedHub);
          setAssignments(assignData || []);
        }
      } catch (err) {
        console.error('Failed to load trips:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [selectedHub, driverProfile, isDriver]);

  // Resolve assigned hub name for driver badge
  const assignedHubObj = hubs.find(
    (h) => String(h.id) === String(driverProfile?.hubId || user?.hubId || selectedHub)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 heading-v1">
            {isDriver ? 'My Delivery Trip History' : 'Dispatch Assignments & Route Manifests'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isDriver
              ? 'Personal delivery run manifests, assigned shipments, status history, and cash collection summary'
              : 'Dispatch trip records, assigned drivers, delivery route execution, and stop completion'}
          </p>
        </div>

        {/* Hub selector for supervisors vs locked badge for bound driver */}
        {isDriver ? (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>
              Assigned Hub:{' '}
              {assignedHubObj
                ? `${assignedHubObj.code} — ${assignedHubObj.name}`
                : driverProfile?.hubName || (user?.hubId ? `Hub #${user.hubId}` : 'Assigned Base')}
            </span>
          </div>
        ) : (
          <select
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium bg-white text-slate-700 shadow-sm"
          >
            <option value="">All Operational Hubs</option>
            {hubs.map((h) => (
              <option key={h.id} value={h.id}>
                {h.code} — {h.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label={isDriver ? 'My Total Trips' : 'Total Assignments'}
          value={assignments.length}
          subtext={isDriver ? 'Assigned shipments' : 'Dispatch records'}
        />
        <KpiCard
          label={isDriver ? 'Active Runs' : 'Active Dispatches'}
          value={assignments.filter((t) => t.status === 'ASSIGNED' || t.status === 'OUT_FOR_DELIVERY').length}
          subtext={isDriver ? 'Pending / On road' : 'On road / queued'}
          highlight
        />
        <KpiCard
          label="Delivered"
          value={assignments.filter((t) => t.status === 'DELIVERED').length}
          subtext={isDriver ? 'Completed drop-offs' : 'Completed stops'}
        />
        <KpiCard
          label={isDriver ? 'Delayed / Issues' : 'Delayed'}
          value={assignments.filter((t) => t.status === 'DELAYED').length}
          subtext="Delivery exceptions"
        />
      </div>

      <div className="card-v1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-800">
            {isDriver ? 'My Assignment Records' : 'Dispatch Assignment Records'}
          </span>
          <span className="text-xs text-slate-500">
            {assignments.length} {isDriver ? 'assignments assigned to you' : 'assignments recorded'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-v1">
            <thead>
              <tr>
                <th>Assignment #</th>
                <th>Order Tracking #</th>
                <th>Customer &amp; Destination</th>
                <th>Assigned Driver</th>
                <th>Assigned Vehicle</th>
                <th>Facility Hub</th>
                <th>Amount &amp; Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">
                    Loading assignment records...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">
                    {isDriver
                      ? 'No delivery assignments found for your driver account at this hub.'
                      : 'No dispatch assignments recorded for selected hub.'}
                  </td>
                </tr>
              ) : (
                assignments.map((t) => (
                  <tr key={t.id}>
                    <td className="font-mono text-xs font-bold text-slate-900">
                      #{t.id}
                    </td>
                    <td className="font-mono text-xs font-semibold text-blue-700">
                      {t.trackingNo || `Order #${t.orderId}`}
                    </td>
                    <td className="text-xs text-slate-800">
                      <div className="font-semibold">{t.customerName || 'Customer'}</div>
                      <div className="text-slate-500 truncate max-w-xs">{t.destinationAddress} ({t.destinationPincode})</div>
                    </td>
                    <td className="text-xs text-slate-700">
                      <div className="font-semibold text-slate-800">{t.driverName || `Driver #${t.driverId}`}</div>
                      <div className="text-slate-500 text-[11px]">{t.driverPhone}</div>
                    </td>
                    <td className="text-xs font-mono text-slate-700">
                      {t.vehicleRegNo || `Vehicle #${t.vehicleId}`} ({t.vehicleType || 'VAN'})
                    </td>
                    <td className="text-xs text-slate-600">
                      {t.hubName || `Hub #${t.hubId}`}
                    </td>
                    <td className="text-xs">
                      <span className="font-bold text-slate-900">₹{t.orderAmount || 0}</span>
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        t.paymentMode === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {t.paymentMode || 'PREPAID'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          t.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : t.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : t.status === 'DELAYED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {t.status || 'ASSIGNED'}
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

export default TripsExplorer;
