import React, { useState } from 'react';
import { orderApi } from '../../api/orders';

const SAMPLE_CSV = `recipientName,recipientPhone,deliveryAddressText,deliveryPincode,weightG,priority,paymentMode,codAmount
Aarav Gupta,9822110001,"Flat 102, Silver Birch, Wakad",411033,450,NORMAL,PREPAID,0
Tanvi Kulkarni,9822110002,"B-404, Megapolis, Hinjawadi Phase 3",411057,720,EXPRESS,COD,1450
Kunal Joshi,9822110003,"14, Gokhale Road, Model Colony",411005,320,NORMAL,PREPAID,0
Ananya Deshmukh,9822110004,"88, Mayur Colony, Kothrud",411038,600,NORMAL,PREPAID,0
Siddharth Shinde,9822110005,"Tower 7, Amanora Park Town, Hadapsar",411028,1100,EXPRESS,COD,2800`;

export const BulkOrderUpload = () => {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successCount, setSuccessCount] = useState(null);
  const [error, setError] = useState('');

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_bulk_orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const parsedRows = [];

    for (let i = 1; i < lines.length; i++) {
      // Regex handling commas inside quoted strings
      const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));

      if (values.length >= 4) {
        parsedRows.push({
          recipientName: values[0] || 'Customer',
          recipientPhone: values[1] || '9822000000',
          deliveryAddressText: values[2] || 'Address',
          deliveryPincode: values[3] || '411057',
          weightG: Number(values[4]) || 500,
          priority: values[5] || 'NORMAL',
          paymentMode: values[6] || 'PREPAID',
          codAmount: Number(values[7]) || 0
        });
      }
    }
    return parsedRows;
  };

  const handleFileChange = (e) => {
    setError('');
    setSuccessCount(null);
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setError('CSV file appears empty or headers do not match template.');
          setRows([]);
        } else {
          setRows(parsed);
        }
      } catch (err) {
        setError('Failed to parse CSV file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (rows.length === 0) return;
    setSubmitting(true);
    setError('');
    setSuccessCount(null);

    try {
      const res = await orderApi.bulkCreate(rows);
      setSuccessCount(res.length);
      setRows([]);
      setFileName('');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Bulk batch intake failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 heading-v1">
            Bulk Order Batch Intake (CSV)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload e-commerce manifest files for high-throughput batch order ingestion
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadSample}
          className="px-3.5 py-1.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Download Sample CSV
        </button>
      </div>

      {successCount !== null && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Batch Intake Completed
          </span>
          <p className="text-xs text-emerald-700 mt-1">
            Successfully imported and routed <span className="font-bold">{successCount}</span> consignments into the pipeline!
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
          {error}
        </div>
      )}

      {/* Upload Zone */}
      <div className="card-v1 p-8 text-center border-dashed border-2 border-slate-300 hover:border-blue-500 transition-colors bg-white">
        <label className="cursor-pointer block">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="text-sm font-semibold text-blue-600 hover:text-blue-700 block">
            {fileName ? `Selected: ${fileName}` : 'Select or Drop CSV Manifest File'}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">
            Supports CSV with columns: recipientName, recipientPhone, deliveryAddressText, deliveryPincode, weightG, priority, paymentMode, codAmount
          </span>
        </label>
      </div>

      {/* Preview Table */}
      {rows.length > 0 && (
        <div className="card-v1 overflow-hidden space-y-4 p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-800">
              CSV Manifest Preview ({rows.length} rows detected)
            </span>
            <button
              onClick={handleUpload}
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Ingesting Batch...' : `Confirm & Book ${rows.length} Orders`}
            </button>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="table-v1">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Recipient</th>
                  <th>Phone</th>
                  <th>Delivery Address</th>
                  <th>Pincode</th>
                  <th>Weight</th>
                  <th>Priority</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx}>
                    <td className="text-xs font-mono text-slate-400">{idx + 1}</td>
                    <td className="font-semibold text-slate-800">{r.recipientName}</td>
                    <td className="font-mono text-xs">{r.recipientPhone}</td>
                    <td className="text-xs text-slate-600 max-w-xs truncate">{r.deliveryAddressText}</td>
                    <td className="font-mono text-xs font-bold text-blue-700">{r.deliveryPincode}</td>
                    <td className="text-xs">{r.weightG}g</td>
                    <td className="text-[11px] font-semibold">{r.priority}</td>
                    <td className="text-xs">{r.paymentMode} {r.codAmount > 0 ? `(₹${r.codAmount})` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
