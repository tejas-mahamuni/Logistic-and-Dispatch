import React, { useState } from 'react';
import { orderApi } from '../../api/orders';

const PINCODE_MAP = {
  '411057': 'PUN-HUB-01 (Hinjawadi Phase 1, 2, 3)',
  '411033': 'PUN-HUB-01 (Wakad & Thergaon)',
  '411005': 'PUN-HUB-02 (Shivajinagar & Deccan)',
  '411004': 'PUN-HUB-02 (Prabhat Road & FC Road)',
  '411038': 'PUN-HUB-03 (Kothrud & Ideal Colony)',
  '411029': 'PUN-HUB-03 (Karve Nagar & Warje)',
  '411028': 'PUN-HUB-04 (Hadapsar & Sasane Nagar)',
  '411013': 'PUN-HUB-04 (Magarpatta City & Amanora)',
  '411014': 'PUN-HUB-05 (Viman Nagar & Airport Area)',
  '411006': 'PUN-HUB-05 (Yerwada & Shastri Nagar)'
};

export const OrderIntakeForm = () => {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    deliveryAddressText: '',
    deliveryPincode: '',
    weightG: 500,
    priority: 'NORMAL',
    paymentMode: 'PREPAID',
    codAmount: 0
  });

  const [createdOrder, setCreatedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const detectedHub = PINCODE_MAP[formData.deliveryPincode.trim()] || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setCreatedOrder(null);

    const payload = {
      ...formData,
      weightG: Number(formData.weightG),
      codAmount: formData.paymentMode === 'COD' ? Number(formData.codAmount) : 0
    };

    try {
      const res = await orderApi.create(payload);
      setCreatedOrder(res);
      setFormData({
        recipientName: '',
        recipientPhone: '',
        deliveryAddressText: '',
        deliveryPincode: '',
        weightG: 500,
        priority: 'NORMAL',
        paymentMode: 'PREPAID',
        codAmount: 0
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to book order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 heading-v1">
          Single Order Intake & Booking
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Book last-mile parcel with automatic customer creation and intelligent hub routing
        </p>
      </div>

      {createdOrder && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Order Booked Successfully
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-xs font-mono font-bold">
              {createdOrder.trackingNumber}
            </span>
          </div>
          <p className="text-xs text-emerald-700">
            Assigned to delivery facility: <span className="font-semibold">{createdOrder.hubName || 'Pune Delivery Hub'}</span>. Consignment status initialized to CREATED.
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
                Recipient Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kulkarni"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recipient Mobile (10 digits) *
              </label>
              <input
                type="tel"
                required
                placeholder="9822000000"
                value={formData.recipientPhone}
                onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Delivery Address (Flat / Street / Landmark) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flat 301, Ganga Towers, Paud Road"
              value={formData.deliveryAddressText}
              onChange={(e) => setFormData({ ...formData, deliveryAddressText: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pune Delivery Pincode *
              </label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="411038"
                value={formData.deliveryPincode}
                onChange={(e) => setFormData({ ...formData, deliveryPincode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
              {detectedHub ? (
                <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                  Mapped: {detectedHub}
                </span>
              ) : formData.deliveryPincode.length === 6 ? (
                <span className="text-[11px] text-amber-600 font-medium mt-1 block">
                  Checking postal service zone...
                </span>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parcel Weight (Grams)
              </label>
              <input
                type="number"
                min="50"
                step="50"
                value={formData.weightG}
                onChange={(e) => setFormData({ ...formData, weightG: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Delivery Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
              >
                <option value="NORMAL">Standard Delivery (48h)</option>
                <option value="EXPRESS">Express Priority (24h)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Collection Mode
              </label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
              >
                <option value="PREPAID">Prepaid Online</option>
                <option value="COD">Cash On Delivery (COD)</option>
              </select>
            </div>

            {formData.paymentMode === 'COD' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  COD Amount to Collect (INR) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  value={formData.codAmount}
                  onChange={(e) => setFormData({ ...formData, codAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Booking Consignment...' : 'Book Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
