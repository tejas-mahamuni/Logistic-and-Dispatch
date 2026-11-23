import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ item }) => {
  const location = useLocation();
  const Icon = item.icon;


  const pathSegments = location.pathname.split('/');
  const baseDashboard = pathSegments[1] || "AdminDashboard";

 
  let targetPath = item.path;
  if (item.isHtml) {
    targetPath = `/${baseDashboard}/html-view/${item.path}`;
  } else if (item.path.startsWith("/")) {
   
    const isDashboardRoot = item.path === "/AdminDashboard" || item.path === "/DispatcherDashboard" || item.path === "/DriverDashboard";
    if (!isDashboardRoot) {
      targetPath = `/${baseDashboard}${item.path}`;
    }
  } else {
    targetPath = `/${baseDashboard}/${item.path}`;
  }

  const isActive = location.pathname === targetPath;

  const activeStyles = isActive 
    ? "bg-white text-purple-700 font-medium shadow-xs" 
    : "text-slate-800 hover:bg-gray-200 hover:text-purple-700 font-medium"; 

  return (
    <Link 
      to={targetPath} 
      className={`flex items-center gap-3 px-3 py-2 my-0.5 rounded-lg text-sm no-underline transition-colors ${activeStyles}`} 
    >
      
      {Icon && <Icon size={16} strokeWidth={1.5} />}
      
      <span>{item.label || item.title}</span>
    </Link>
  );
};

export default NavItem;