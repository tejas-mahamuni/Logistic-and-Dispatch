import React, { useState, useEffect } from 'react';
import { orderApi } from '../../api/orders';
import { hubApi } from '../../api/hubs';
import { useAuth } from '../../context/AuthContext';
import { KpiCard } from '../../components/KpiCard';

export const OrdersExplorer = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState(user?.hubId ? String(user.hubId) : '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, hubsData] = await Promise.all([
        orderApi.list(selectedHub),
        hubApi.list()
      ]);
      setOrders(ordersData || []);
      setHubs(hubsData || []);
    } catch (err) {
      console.error('Failed to load orders explorer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedHub]);

  const filteredOrders = orders.filter((o) => {
    const status = o.currentStatus || o.status || '';
    const tracking = o.trackingNo || o.trackingNumber || '';
    const address = o.destinationAddress || o.deliveryAddress || '';
    const pincode = o.destinationPincode || o.pincode || '';
    const customer = o.customerName || o.recipientName || '';

    const matchesStatus = !selectedStatus || status === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      tracking.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pincode.includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 heading-v1">
            Orders Master Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive audit, search, and status tracking for all parcel consignments
          </p>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Total Consignments" value={orders.length} subtext="Network-wide records" />
        <KpiCard
          label="Pending Queue"
          value={orders.filter((o) => (o.currentStatus || o.status) === 'PENDING').length}
          subtext="Awaiting dispatch"
        />
        <KpiCard
          label="Out For Delivery"
          value={orders.filter((o) => (o.currentStatus || o.status) === 'OUT_FOR_DELIVERY').length}
          subtext="Active driver routes"
          highlight
        />
        <KpiCard
          label="Delivered"
          value={orders.filter((o) => (o.currentStatus || o.status) === 'DELIVERED').length}
          subtext="Successful deliveries"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="card-v1 p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by Tracking #, Customer Name, Address, or Pincode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {user?.role === 'ADMIN' ? (
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium bg-white text-slate-700"
            >
              <option value="">All Operational Hubs</option>
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.code} — {h.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="px-3 py-1.5 border border-blue-200 rounded-md text-xs font-semibold bg-blue-50 text-blue-800">
              Hub #{user?.hubId || selectedHub}
            </span>
          )}

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium bg-white text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="DELAYED">DELAYED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-v1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-800">
            Consignment Records
          </span>
          <span className="text-xs text-slate-500">
            Showing {filteredOrders.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-v1">
            <thead>
              <tr>
                <th>Tracking No</th>
                <th>Facility Hub</th>
                <th>Customer</th>
                <th>Destination Address</th>
                <th>Pincode</th>
                <th>Amount &amp; Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    Loading consignment records...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const status = o.currentStatus || o.status || 'PENDING';
                  const tracking = o.trackingNo || o.trackingNumber;
                  const address = o.destinationAddress || o.deliveryAddress;
                  const pincode = o.destinationPincode || o.pincode;
                  const customer = o.customerName || o.recipientName || 'Customer';
                  const amount = o.orderAmount || o.codAmount || 0;
                  const payMode = o.paymentMode || 'PREPAID';

                  return (
                    <tr key={o.id}>
                      <td className="font-mono text-xs font-semibold text-blue-700">
                        {tracking}
                      </td>
                      <td className="text-xs text-slate-700">
                        {o.hubName || `Hub #${o.hubId}`}
                      </td>
                      <td className="text-xs font-semibold text-slate-800">
                        {customer}
                      </td>
                      <td className="text-xs text-slate-600 max-w-xs truncate">
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

export default OrdersExplorer;
