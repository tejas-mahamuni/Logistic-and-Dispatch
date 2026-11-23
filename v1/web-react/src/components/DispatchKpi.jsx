import { useEffect, useState } from "react";
import KpiCard from "../components/KpiCard";
import { Clock, Truck, CheckCircle, PackageCheck } from "lucide-react";

const DispatchKpi = () => {
  const fetchUrl = `http://localhost:3000/admin-dashboard/kpis-orders`;

  const [orderKpis, setOrderKpis] = useState({
    pending: 0,
    transit: 0,
    completed: 0,
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(fetchUrl);

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        setOrderKpis(data);
      } catch (error) {
        setErr(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUrl]);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-purple-700 font-medium">
        <div className="w-5 h-5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading dispatch metrics...</span>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <strong>Failed to load dispatch KPIs:</strong> {err}
        </div>
      </div>
    );
  }

  const totalOrders = orderKpis.pending + orderKpis.transit + orderKpis.completed;

  return (
    <div className="p-6 bg-linear-to-r from-white to-purple-100 rounded-xl shadow-lg">
      <div className="ml-2 mb-6">
        <h2 className="text-3xl font-times italic font-bold text-slate-800 tracking-tight">
          Dispatch Status Summary
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Real-time tracking of order fulfillment and transit status
        </p>
      </div>

      <div className="px-2 pb-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Pending Orders"
          Icon={Clock}
          count={orderKpis.pending}
        />
        <KpiCard
          title="In-Transit Orders"
          Icon={Truck}
          count={orderKpis.transit}
        />
        <KpiCard
          title="Delivered Orders"
          Icon={CheckCircle}
          count={orderKpis.completed}
        />
        <KpiCard
          title="Total Tracked Orders"
          Icon={PackageCheck}
          count={totalOrders}
        />
      </div>
    </div>
  );
};

export default DispatchKpi;