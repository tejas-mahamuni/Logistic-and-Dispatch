import { Outlet } from 'react-router-dom'
import SideBar from '../components/SideBar'

import {
  LayoutDashboard,
  Van,
  User,
  Users,
  Motorbike,
  PersonStanding,
  ClockArrowUp,
  BookOpenCheck,
  CircleCheckBig,
  Table,
  FileText,
  Cpu,
} from "lucide-react";

const AdminDashboard = () => {

    const SIDEBAR_CONFIG = [
    {
      category: "Overview",
      items: [
        {
          label: "System Overview",
          path: "/AdminDashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Drivers Detail Board",
          path: "/DriverDispatchBoard",
          icon: Van,
          isHtml: false,
        },
        {
          label: "Staff Accounts",
          path: "/StaffAccount",
          icon: User,
          isHtml: false,
        },
      ],
    },
    {
      category: "Master Entry",
      items: [
        {
          label: "Customer Master",
          path: "customer.html",
          icon: Users,
          isHtml: true,
        },
        {
          label: "Vehicle Master",
          path: "vehicle.html",
          icon: Motorbike,
          isHtml: true,
        },
        {
          label: "Driver Master",
          path: "driver.html",
          icon: PersonStanding,
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

  const dropdownSections = [
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
        { label: "Deliveries Table", path: "/tables/deliveries" },
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
        { label: "Vehicle Utilization", path: "/reports/vehicle" },
        { label: "Driver Assignment", path: "/reports/driver" },
      ],
    },
    {
      id: "processing",
      title: "Processing",
      icon: Cpu,
      items: [
        { label: "Status Update", path: "/processing/status" },
        { label: "Delivery Processing", path: "/processing/delivery" },
        { label: "Auto Assignment", path: "/processing/auto-assignment" },
        { label: "Audit Logs", path: "/processing/audit" },
        { label: "Archive Data", path: "/processing/archive" },
      ],
    },
  ];

  return (
    <div className='flex bg-gray-100 h-screen w-screen overflow-hidden py-3'>
      <SideBar role='Admin' menuConfig={SIDEBAR_CONFIG} dropdownConfig={dropdownSections}/>

      <main className='flex-1 h-full overflow-y-auto mx-3 bg-white border border-[#E8E8EA] rounded-lg'>
        <Outlet/>
      </main>
    </div>
  )
}

export default AdminDashboard
