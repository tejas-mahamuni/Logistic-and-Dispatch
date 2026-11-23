import { useEffect, useState } from "react";
import KpiCard from "../components/KpiCard";
import { Users, Truck, UserCheck, ClipboardList, Package, CheckCircle2 } from "lucide-react";

const MasterKpi = () => {
  const fetchUrl = `http://localhost:3000/admin-dashboard/kpis`;

  const [kpis, setKpis] = useState({
    customers: 0,
    vehicles: 0,
    drivers: 0,
    assignments: 0,
    orders: 0,
    deliveries: 0,
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
        setKpis(data);
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
        <span>Loading overview metrics...</span>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <strong>Failed to load KPI metrics:</strong> {err}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 bg-linear-to-r from-white to-purple-100 rounded-xl shadow-lg">
      
      <div className="ml-6 mb-6">
        <h1 className="text-4xl font-times italic font-bold text-slate-800 tracking-tight">
          System Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time metrics and operations summary
        </p>
      </div>

      
      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <KpiCard title="Total Customers" Icon={Users} count={kpis.customers} />
        <KpiCard title="Fleet Vehicles" Icon={Truck} count={kpis.vehicles} />
        <KpiCard title="Active Drivers" Icon={UserCheck} count={kpis.drivers} />
        <KpiCard title="Dispatch Orders" Icon={Package} count={kpis.orders} />
        <KpiCard title="Active Assignments" Icon={ClipboardList} count={kpis.assignments} />
        <KpiCard title="Completed Deliveries" Icon={CheckCircle2} count={kpis.deliveries} />
      </div>

    </div>
  );
};

export default MasterKpi;