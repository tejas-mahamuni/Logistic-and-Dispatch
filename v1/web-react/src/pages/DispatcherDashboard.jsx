import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";

import {
  Van,
  ClockArrowUp,
  BookOpenCheck,
  CircleCheckBig,
  Table,
  FileText,
} from "lucide-react";

const DispatcherDashboard = () => {
  // ── MAIN MENU SECTIONS ──
  const DISPATCHER_MENU = [
    {
      category: "Overview",
      items: [
        {
          label: "Dispatcher Board",
          path: "dispatcher-dashboard.html",
          icon: Van,
          isHtml: true,
        },
      ],
    },
    {
      category: "Transactions",
      items: [
        {
          label: "Dispatch Order",
          path: "dispatchOrder.html",
          icon: ClockArrowUp,
          isHtml: true,
        },
        {
          label: "Dispatch Assignment",
          path: "dispatch-assignment.html",
          icon: BookOpenCheck,
          isHtml: true,
        },
        {
          label: "Delivery Confirmation",
          path: "delivery.html",
          icon: CircleCheckBig,
          isHtml: true,
        },
      ],
    },
  ];

  // ── EXPANSION DROPDOWN SECTIONS ──
  const DISPATCHER_DROPDOWNS = [
    {
      id: "tables",
      title: "Live Tables Explorer",
      icon: Table,
      items: [
        { label: "Customers Table", path: "/tables/customers" },
        { label: "Vehicles Table", path: "/tables/vehicles" },
        { label: "Drivers Table", path: "/tables/drivers" },
        { label: "Dispatch Orders Table", path: "/tables/orders" },
        { label: "Assignments Table", path: "/tables/assignments" },
      ],
    },
    {
      id: "reports",
      title: "Reports",
      icon: FileText,
      items: [
        { label: "Dispatch Report", path: "/reports/dispatch" },
        { label: "Delivery Report", path: "/reports/delivery" },
        { label: "Pending Orders", path: "/reports/pending" },
      ],
    },
  ];

  return (
    <div className="flex bg-gray-100 h-screen w-screen overflow-hidden py-3">
      <SideBar
        role="Dispatcher"
        menuConfig={DISPATCHER_MENU}
        dropdownConfig={DISPATCHER_DROPDOWNS}
      />

      <main className="flex-1 h-full overflow-y-auto mx-3 bg-white border border-[#E8E8EA] rounded-lg">
        <Outlet/>
      </main>
    </div>
  );
};

export default DispatcherDashboard;
