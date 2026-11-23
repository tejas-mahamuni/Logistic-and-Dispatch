import { useEffect, useState } from "react";
import SelectDropdown from "../components/SelectDropdown";
import DataTable from "../components/DataTable";
import KpiCard from "../components/KpiCard";
import { CheckCircle, Truck, Clock } from "lucide-react";

const DriverAssignment = () => {
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [kpiDriver, setKpiDriver] = useState({
    pending: 0,
    transit: 0,
    completed: 0,
  });
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiErr, setKpiErr] = useState(null);

  const assignmentColumns = [
    { header: "Assignment ID", accessor: "assignmentId" },
    { header: "Order ID", accessor: "orderId" },
    { header: "Vehicle ID", accessor: "vehicleId" },
    { header: "Assigned Date", accessor: "assignedDate" },
    { header: "Order Status", accessor: "status" },
  ];

  useEffect(() => {
    if (!selectedDriverId) return;

    const fetchDriverKpis = async () => {
      setKpiLoading(true);
      setKpiErr(null);
      try {
        const res = await fetch(
          `http://localhost:3000/admin-dashboard/kpis-driver/${selectedDriverId}`
        );

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        setKpiDriver(data);
      } catch (error) {
        setKpiErr(error.message);
      } finally {
        setKpiLoading(false);
      }
    };

    fetchDriverKpis();
  }, [selectedDriverId]);

  return (
    <div className="p-6 space-y-6">
      {/* Dropdown Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Driver Assignment Explorer
        </h2>

        <SelectDropdown
          fetchUrl="http://localhost:3000/driver"
          label="Select a Driver to view assignments:"
          name="driverId"
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(e.target.value)}
        />
      </div>

      {selectedDriverId ? (
        
        <div className="space-y-6">
          
          {kpiLoading ? (
            <div className="p-4 flex items-center gap-3 text-purple-700 font-medium text-sm">
              <div className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
              <span>Fetching driver metrics...</span>
            </div>
          ) : kpiErr ? (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              <strong>Error loading KPIs:</strong> {kpiErr}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KpiCard
                title="Completed Orders"
                Icon={CheckCircle}
                count={kpiDriver.completed}
              />
              <KpiCard
                title="In Transit Orders"
                Icon={Truck}
                count={kpiDriver.transit}
              />
              <KpiCard
                title="Pending Orders"
                Icon={Clock}
                count={kpiDriver.pending}
              />
            </div>
          )}

        
          <DataTable
            title={`Assignments for Driver #${selectedDriverId}`}
            fetchUrl={`http://localhost:3000/admin-dashboard/driver/${selectedDriverId}`}
            columns={assignmentColumns}
          />
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm">
          Please select a driver from the dropdown above to view their assignments.
        </div>
      )}
    </div>
  );
};

export default DriverAssignment;