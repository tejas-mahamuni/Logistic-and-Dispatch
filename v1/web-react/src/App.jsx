import { Route, Routes, BrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

import AdminDashboard from "./pages/AdminDashboard";
import DispatcherDashboard from "./pages/DispatcherDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import HtmlViewer from "./components/HtmlViewer";
import DataTable from "./components/DataTable";
import SystemOverview from "./pages/SystemOverview";
import StaffAccount from "./pages/StaffAccount";
import DriverDispatchBoard from "./pages/DriverDispatchBoard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/AdminDashboard" element={<AdminDashboard />}>
          <Route index element={<SystemOverview />} />
          <Route path="html-view/:fileName" element={<HtmlViewer />} />
          <Route path="StaffAccount" element={<StaffAccount />} />
          <Route path="DriverDispatchBoard" element={<DriverDispatchBoard />} />

          <Route
            path="tables/customers"
            element={
              <DataTable
                title="Customers"
                fetchUrl="http://localhost:3000/customer"
                columns={[
                  { header: "ID", accessor: "customerId" },
                  { header: "Customer Name", accessor: "customerName" },
                  { header: "Billing Address", accessor: "customerAddress" },
                  { header: "Phone Number", accessor: "customerPhone" },
                ]}
              />
            }
          />

          <Route
            path="tables/vehicles"
            element={
              <DataTable
                title="Fleet Registry"
                fetchUrl="http://localhost:3000/vehicle"
                columns={[
                  { header: "ID", accessor: "vehicleId" },
                  { header: "Plate Number", accessor: "vehicleNumber" },
                  { header: "Classification", accessor: "vehicleType" },
                  { header: "Cargo Capacity (kg)", accessor: "capacity" }
                ]}
              />
            }
          />

          <Route
            path="tables/drivers"
            element={
              <DataTable
                title="Drivers"
                fetchUrl="http://localhost:3000/driver"
                columns={[
                  { header: "ID", accessor: "driverId" },
                  { header: "Driver Name", accessor: "driverName" },
                  { header: "License", accessor: "licenseNumber" },
                  { header: "Phone Number", accessor: "driverPhone" },
                ]}
              />
            }
          />

          <Route
            path="tables/orders"
            element={
              <DataTable
                title="Orders"
                fetchUrl="http://localhost:3000/dispatch-order"
                columns={[
                  { header: "ID", accessor: "orderId" },
                  { header: "Customer ID", accessor: "customerId" },
                  { header: "Dispatch Date", accessor: "dispatchDate" },
                  { header: "Source Address", accessor: "source" },
                  { header: "Destination Address", accessor: "destination" },
                  { header: "Status", accessor: "status" },
                ]}
              />
            }
          />

          <Route
            path="tables/assignments"
            element={
              <DataTable
                title="Dispatch Assignment"
                fetchUrl="http://localhost:3000/dispatch-assignment"
                columns={[
                  { header: "ID", accessor: "assignmentId" },
                  { header: "Order ID", accessor: "orderId" },
                  { header: "Driver", accessor: "driverId" },
                  { header: "Vehicle", accessor: "vehicleId" },
                  { header: "Dispatch Date", accessor: "assignedDate" },
                ]}
              />
            }
          />

          <Route
            path="tables/deliveries"
            element={
              <DataTable
                title="Completed Orders"
                fetchUrl="http://localhost:3000/delivery"
                columns={[
                  { header: "ID", accessor: "deliveryId" },
                  { header: "Order ID", accessor: "orderId" },
                  { header: "Delivery Date", accessor: "deliveryDate" },
                  { header: "Remarks", accessor: "remarks" },
                  { header: "Proof of Delivery", accessor: "proofOfDelivery" },
                ]}
              />
            }
          />

        </Route>

        <Route path="/DispatcherDashboard" element={<DispatcherDashboard />}>
          <Route path="html-view/:fileName" element={<HtmlViewer />} />
        </Route>

        <Route path="/DriverDashboard" element={<DriverDashboard />}>
          <Route path="html-view/:fileName" element={<HtmlViewer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
