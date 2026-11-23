import React, { useState, useEffect } from 'react';
import { reportApi } from '../api/reports';
import { hubApi } from '../api/hubs';
import { useAuth } from '../context/AuthContext';

export const Reports = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [hubs, setHubs] = useState([]);
  const [selectedHubId, setSelectedHubId] = useState(user?.hubId ? String(user.hubId) : '');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load hubs for filter
  useEffect(() => {
    const fetchHubs = async () => {
      try {
        const list = await hubApi.list();
        setHubs(list || []);
      } catch (err) {
        console.error('Failed to load hubs:', err);
      }
    };
    fetchHubs();
  }, []);

  const fetchTabReport = async (tab, hubId) => {
    setLoading(true);
    try {
      let res = [];
      if (tab === 'pipeline') res = await reportApi.pipeline(hubId);
      else if (tab === 'overdue') res = await reportApi.overdue(hubId);
      else if (tab === 'driver') res = await reportApi.driverPerformance(hubId);
      else if (tab === 'vehicle') res = await reportApi.vehicleUtilization(hubId);
      setData(res || []);
    } catch (err) {
      console.error('Failed to load report:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabReport(activeTab, selectedHubId);
  }, [activeTab, selectedHubId]);

  const currentHubName = hubs.find(h => String(h.id) === String(selectedHubId))?.name || (selectedHubId ? `Hub #${selectedHubId}` : 'All Operational Hubs (Pune Region)');

  const getReportTitle = (tab) => {
    switch (tab) {
      case 'pipeline': return 'ORDER PIPELINE & DELIVERY STATUS STATEMENT';
      case 'overdue': return 'OVERDUE SLA DELIVERY & EXCEPTION AUDIT';
      case 'driver': return 'FLEET DRIVER DELIVERY QUOTA PERFORMANCE REPORT';
      case 'vehicle': return 'TRANSPORT VEHICLE ASSET UTILIZATION STATEMENT';
      default: return 'LOGISTIC OPERATIONAL REPORT';
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((h) => {
        const val = row[h] !== null && row[h] !== undefined ? String(row[h]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${activeTab}_hub${selectedHubId || 'all'}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const printDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="space-y-6">
      {/* Print-specific style rules to guarantee clean Times New Roman bill layout */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: white !important;
            color: black !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 heading-v1">
            Operational Intelligence &amp; SLA Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official delivery ledgers, SLA compliance audits, driver quota performance, and fleet utilization statements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Hub Level Filter */}
          {user?.role === 'ADMIN' ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm">
              <span className="text-xs font-bold text-slate-600">Hub:</span>
              <select
                value={selectedHubId}
                onChange={(e) => setSelectedHubId(e.target.value)}
                className="text-xs font-semibold bg-transparent border-0 focus:outline-none text-slate-800"
              >
                <option value="">All Operational Hubs</option>
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
              Hub: {user?.hubId ? `Hub #${user.hubId}` : 'Assigned Hub'}
            </span>
          )}

          <button
            onClick={handleExportCSV}
            disabled={data.length === 0}
            className="px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold disabled:opacity-50 transition shadow-sm"
          >
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            disabled={data.length === 0}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-md text-xs font-serif font-bold tracking-wide transition shadow-sm"
          >
            Print Official Report / Bill
          </button>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-slate-200 gap-6 no-print">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'pipeline'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Order Pipeline Status
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'overdue'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overdue SLA Deliveries
        </button>
        <button
          onClick={() => setActiveTab('driver')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'driver'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Driver Performance
        </button>
        <button
          onClick={() => setActiveTab('vehicle')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'vehicle'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Vehicle Utilization
        </button>
      </div>

      {/* Formal Bill / Ledger Report Container */}
      <div id="printable-report" className="bg-white border border-slate-300 rounded shadow-sm p-8 text-black" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        {/* Formal Bill Header */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold tracking-tight uppercase">
                LOGISTIC &amp; DISPATCH MANAGEMENT SYSTEM
              </h2>
              <p className="text-sm italic text-gray-700 mt-0.5">
                Centralized Supply Chain &amp; Last-Mile Delivery Network
              </p>
            </div>
            <div className="text-right text-xs space-y-0.5">
              <div className="font-bold">DOC REF: LDM-RPT-{activeTab.toUpperCase()}-{selectedHubId || 'ALL'}</div>
              <div>DATE: {printDate}</div>
              <div>OPERATOR: {user?.fullName || user?.username || 'SYSTEM'} ({user?.role || 'STAFF'})</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-400 flex justify-between items-center text-sm">
            <div>
              <span className="font-bold">REPORT: </span>
              <span>{getReportTitle(activeTab)}</span>
            </div>
            <div>
              <span className="font-bold">FACILITY / HUB: </span>
              <span>{currentHubName}</span>
            </div>
          </div>
        </div>

        {/* Report Content Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500 italic">
              Compiling official operational ledger...
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-gray-500 italic">
              No operational records recorded for this query criteria.
            </div>
          ) : (
            <div>
              <table className="w-full text-left border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="border border-black px-3 py-2 text-center w-12 font-bold">#</th>
                    {Object.keys(data[0]).map((col) => (
                      <th key={col} className="border border-black px-3 py-2 font-bold uppercase tracking-wider">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50">
                      <td className="border border-black px-3 py-1.5 text-center font-bold">
                        {idx + 1}
                      </td>
                      {Object.keys(row).map((col) => (
                        <td key={col} className="border border-black px-3 py-1.5">
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bill Summary & Sign-off Footer */}
              <div className="mt-6 pt-4 border-t border-black flex justify-between items-end text-xs">
                <div>
                  <p className="font-bold">TOTAL LINE ITEMS: {data.length}</p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    * This is a computer-generated operational statement extracted directly from the system database.
                  </p>
                </div>
                <div className="text-center border-t border-black pt-1 w-56">
                  <p className="font-bold">AUTHORIZED SIGNATORY</p>
                  <p className="text-[10px] text-gray-600">Hub Dispatch Supervisor / Manager</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
