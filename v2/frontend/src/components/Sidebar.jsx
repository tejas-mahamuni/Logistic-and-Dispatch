import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const getNavigationSections = () => {
    if (role === 'ADMIN') {
      return [
        {
          heading: 'Dashboards',
          links: [
            { to: '/admin', label: 'Global Overview' },
            { to: '/manager', label: 'Hub Operations' },
            { to: '/dispatcher', label: 'Dispatch Board' },
            { to: '/driver', label: 'Driver Runsheets' },
            { to: '/reports', label: 'Operational Reports' },
          ]
        },
        {
          heading: 'Data Entry Forms',
          links: [
            { to: '/forms/order', label: 'Single Order Intake' },
            { to: '/forms/bulk-orders', label: 'Bulk CSV Manifest' },
            { to: '/forms/dispatch', label: 'Trip Route Assignment' },
            { to: '/forms/customer', label: 'Register Customer' },
            { to: '/forms/driver', label: 'Onboard Driver' },
            { to: '/forms/vehicle', label: 'Register Vehicle' },
          ]
        },
        {
          heading: 'Table Explorers',
          links: [
            { to: '/tables/orders', label: 'Orders Explorer' },
            { to: '/admin/users', label: 'User Directory' },
            { to: '/tables/customers', label: 'Customers Directory' },
            { to: '/tables/drivers', label: 'Drivers Fleet' },
            { to: '/tables/vehicles', label: 'Vehicle Assets' },
            { to: '/tables/trips', label: 'Trip Manifests' },
          ]
        }
      ];
    }

    if (role === 'MANAGER') {
      return [
        {
          heading: 'Dashboards',
          links: [
            { to: '/manager', label: 'Hub Operations' },
            { to: '/dispatcher', label: 'Live Dispatch' },
            { to: '/reports', label: 'Hub Analytics' }
          ]
        },
        {
          heading: 'Data Entry Forms',
          links: [
            { to: '/forms/order', label: 'Order Booking' },
            { to: '/forms/bulk-orders', label: 'Bulk CSV Upload' },
            { to: '/forms/dispatch', label: 'Create Trip' }
          ]
        },
        {
          heading: 'Table Explorers',
          links: [
            { to: '/tables/orders', label: 'Orders Master' },
            { to: '/tables/trips', label: 'Trip Manifests' },
            { to: '/tables/drivers', label: 'Assigned Drivers' },
            { to: '/tables/vehicles', label: 'Assigned Fleet' }
          ]
        }
      ];
    }

    if (role === 'DISPATCHER') {
      return [
        {
          heading: 'Dispatch Control',
          links: [
            { to: '/dispatcher', label: 'Live Dispatch Board' },
            { to: '/forms/dispatch', label: 'Assign Orders to Trip' }
          ]
        },
        {
          heading: 'Order Intake',
          links: [
            { to: '/forms/order', label: 'Single Order Intake' },
            { to: '/forms/bulk-orders', label: 'Bulk CSV Import' }
          ]
        },
        {
          heading: 'Records',
          links: [
            { to: '/tables/orders', label: 'All Orders' },
            { to: '/tables/trips', label: 'Active Trips' },
            { to: '/tables/drivers', label: 'Driver Availability' }
          ]
        }
      ];
    }

    if (role === 'DRIVER') {
      return [
        {
          heading: 'Driver Console',
          links: [
            { to: '/driver', label: 'Today\'s Run Sheet' },
            { to: '/tables/trips', label: 'My Trip History' }
          ]
        }
      ];
    }

    if (role === 'CUSTOMER') {
      return [
        {
          heading: 'Customer Portal',
          links: [
            { to: '/customer', label: 'Track Consignments' }
          ]
        }
      ];
    }

    return [];
  };

  const sections = getNavigationSections();

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-3.5rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx}>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-2">
              {sec.heading}
            </span>
            <nav className="mt-1.5 space-y-0.5">
              {sec.links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `block px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 px-2">
        Hub Base: <span className="font-semibold text-slate-700">{user?.hubId ? `Hub #${user.hubId}` : 'Global Master'}</span>
      </div>
    </aside>
  );
};
