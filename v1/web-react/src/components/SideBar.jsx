import {
  Container,
  ChevronDown,
  ChevronRight,
  CircleUser,
} from "lucide-react";
import NavItem from "../components/NavItem";
import { useState } from "react";

const SideBar = ({ role = "Guest", menuConfig = [], dropdownConfig = [] }) => {
  const [openSection, setOpenSection] = useState({
    tables: false,
    reports: false,
    processing: false,
  });

  const toggleSection = (section) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const roleDetails = {
    Admin: { name: "System Admin", subtitle: "System Controller", color: "#800080" },
    Dispatcher: { name: "Dispatcher", subtitle: "Fleet Coordinator", color: "#0ea5e9" },
    Driver: { name: "Driver Account", subtitle: "Fleet Operator", color: "#10b981" },
  };

  const user = roleDetails[role] || { name: role, subtitle: "Staff Account", color: "#71717B" };


  return (
    <aside className="h-screen w-1/6 flex flex-col bg-gray-100 border-r border-[#E8E8EA] select-none shrink-0">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8EA] bg-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full flex justify-center items-center h-10 w-10 shadow-xl">
            <Container size={22} color="#9b009b" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-[18px] font-sf font-medium text-slate-800 tracking-tight leading-tight">
              Logistic & Dispatch
            </h3>
          </div>
        </div>
        <ChevronDown size={16} color="#71717B" strokeWidth={2.5} />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5">
        {menuConfig.map((group, idx) => (
          <div key={idx} className="space-y-1 border-b border-[#E8E8EA]">
            <p className="text-gray-400 font-semibold text-xs uppercase tracking-wider px-3 pb-1">
              {group.category}
            </p>
            {group.items.map((item, itemIdx) => (
              <NavItem key={itemIdx} item={item} />
            ))}
          </div>
        ))}

        <div className="space-y-1">
          <p className="text-gray-400 font-semibold text-xs uppercase tracking-wider px-3 pb-1">
            Explorer & Analytics
          </p>

          {dropdownConfig.map((section) => {
            const Icon = section.icon;
            const isOpen = openSection[section.id];

            return (
              <div key={section.id} className="space-y-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} strokeWidth={1.5} />
                    <span className="font-medium text-sm">{section.title}</span>
                  </div>

                  {isOpen ? (
                    <ChevronDown size={15} />
                  ) : (
                    <ChevronRight size={15} />
                  )}
                </button>

                {isOpen && (
                  <div className="ml-4 pl-3 border-l border-gray-200 space-y-0.5">
                    {section.items.map((subItem, idx) => (
                      <NavItem key={idx} item={subItem} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>


      <div className="flex px-5 py-4 mb-1 gap-3 items-center border-t border-[#E8E8EA] bg-gray-100 shrink-0">
        <div className="bg-white rounded-full p-0.5 flex items-center justify-center shadow-md h-10 w-10 shrink-0">
          <CircleUser size={38} color={user.color} strokeWidth={2} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-800">{user.name}</h3>
          <p className="text-[10px] text-slate-500 font-medium leading-none">
            {user.subtitle}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
