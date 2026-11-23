import { 
  User, 
  CircleCheckBig 
} from "lucide-react";

import SideBar from '../components/SideBar'
import { Outlet } from "react-router-dom";


const DRIVER_MENU = [
  {
    category: "Driver Portal",
    items: [
      { label: "Driver Console", path: "driver-dashboard.html", icon: User, isHtml: true },
      { label: "Confirm Delivery", path: "delivery.html", icon: CircleCheckBig, isHtml: true },
    ]
  }
];

const DRIVER_DROPDOWNS = [];

const DriverDashboard = () => {
  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden py-3">
      <SideBar role="Driver" menuConfig={DRIVER_MENU} dropdownConfig={DRIVER_DROPDOWNS} />

      <main className="flex-1 h-full overflow-y-auto mx-3 bg-white border border-[#E8E8EA] rounded-lg">
        <Outlet/>
      </main>
    </div>
  )
}

export default DriverDashboard