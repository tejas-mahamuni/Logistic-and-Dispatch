import React, { useState, useEffect } from 'react';
import { customerApi } from '../../api/customer';

export const CustomerForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    city: 'Pune',
    pincode: ''
  });

  const [savedCustomer, setSavedCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const phoneRegex = /^[6-9]\d{9}$/;
  const pincodeRegex = /^\d{6}$/;

  const isPhoneValid = !formData.phone || phoneRegex.test(formData.phone);
  const isPincodeValid = !formData.pincode || pincodeRegex.test(formData.pincode);

  const loadCustomers = async () => {
    try {
      setLoadingList(true);
      const data = await customerApi.list();
      setCustomers(Array.isArray(data) ? data : (data?.content || []));
    } catch (err) {
      console.error('Failed to load customers from database:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handlePhoneChange = (e) => {
    // Only accept numeric digits, up to 10 characters
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: val });
  };

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData({ ...formData, pincode: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSavedCustomer(null);

    // Strict validation check
    if (!phoneRegex.test(formData.phone)) {
      setError('Invalid Mobile Number: Must be exactly 10 digits starting with 6, 7, 8, or 9.');
      return;
    }

    if (!pincodeRegex.test(formData.pincode)) {
      setError('Invalid Pincode: Must be exactly 6 digits (e.g. 411057).');
      return;
    }

    setSubmitting(true);

    const payload = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email ? formData.email.trim() : null,
      addressLine1: formData.addressLine1.trim(),
      city: formData.city.trim(),
      pincode: formData.pincode.trim()
    };

    try {
      const res = await customerApi.create(payload);
      setSavedCustomer(res);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        addressLine1: '',
        city: 'Pune',
        pincode: ''
      });
      // Refresh database table
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 heading-v1">
          Customer Master Registration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Register corporate or retail customers with verified 10-digit mobile numbers and delivery addresses
        </p>
      </div>

      {savedCustomer && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Customer Profile Registered Successfully
          </span>
          <p className="text-xs text-emerald-700">
            Customer ID #{savedCustomer.id} ({savedCustomer.fullName}) saved to database with phone {savedCustomer.phone}.
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
                Customer Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Anand Kulkarni"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number (10 Digits) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400 font-mono select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="9822000000"
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
                  10 digits Indian mobile number (e.g. 9822012345)
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="customer@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Delivery Address *
            </label>
            <input
              type="text"
              required
              placeholder="House/Flat No, Apartment, Street, Area"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City
              </label>
              <input
                type="text"
                disabled
                value="Pune"
                className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-md text-sm text-slate-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pincode (6 Digits) *
              </label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="411057"
                value={formData.pincode}
                onChange={handlePincodeChange}
                className={`w-full px-3 py-2 border rounded-md text-sm font-mono focus:outline-none ${
                  formData.pincode && !isPincodeValid
                    ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-1 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-1 focus:ring-blue-600'
                }`}
              />
              {formData.pincode && !isPincodeValid && (
                <p className="text-[11px] text-red-600 mt-1">Must be 6 digits</p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting || (formData.phone && !isPhoneValid) || (formData.pincode && !isPincodeValid)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Customer'}
            </button>
          </div>
        </form>
      </div>

      {/* Live Database Records */}
      <div className="card-v1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              Registered Customers in Database
            </span>
            <span className="text-xs text-slate-500">
              {loadingList ? 'Fetching from database...' : `${customers.length} customer records loaded`}
            </span>
          </div>
          <button
            type="button"
            onClick={loadCustomers}
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
                <th className="p-2 text-left">Full Name</th>
                <th className="p-2 text-left">Mobile Number</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loadingList ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-400">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-400">No customers registered yet.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono text-slate-500">#{c.id}</td>
                    <td className="p-2 font-medium text-slate-800">{c.fullName}</td>
                    <td className="p-2 font-mono text-blue-600">{c.phone}</td>
                    <td className="p-2 text-slate-500">{c.email || '—'}</td>
                    <td className="p-2 text-slate-600 truncate max-w-xs">{c.address || c.addressLine || 'Pune'}</td>
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
