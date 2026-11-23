import React, { useState, useEffect } from 'react';
import { customerApi } from '../../api/customer';
import { KpiCard } from '../../components/KpiCard';

export const CustomersExplorer = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.list(searchQuery);
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 heading-v1">
            Customers Master Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered customer accounts, normalized contact numbers, and delivery addresses
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-72 px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Registered Customers" value={customers.length} subtext="Retail & Enterprise" />
        <KpiCard label="Active Status" value={customers.filter(c => c.status === 'ACTIVE').length} subtext="Account standing: ACTIVE" />
        <KpiCard label="Coverage Area" value="Pune Region" subtext="All 10 Postal Zones" />
      </div>

      <div className="card-v1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-800">
            Customer Directory
          </span>
          <span className="text-xs text-slate-500">
            Showing {customers.length} profiles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-v1">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Primary Address</th>
                <th>City / Pincode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    No customers found matching search query.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono text-xs font-bold text-blue-700">
                      #{c.id}
                    </td>
                    <td className="font-semibold text-slate-900">
                      {c.fullName}
                    </td>
                    <td className="font-mono text-xs text-slate-700">
                      {c.phone}
                    </td>
                    <td className="text-xs text-slate-700 max-w-sm truncate">
                      {c.addressLine1 || c.addresses?.[0]?.line1 || 'Primary Delivery Address'}
                    </td>
                    <td className="font-mono text-xs text-slate-600">
                      {c.city || 'Pune'} {c.pincode ? `(${c.pincode})` : ''}
                    </td>
                    <td>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        {c.status || 'ACTIVE'}
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
