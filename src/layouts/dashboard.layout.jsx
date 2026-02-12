import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Mail,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  HelpCircle,
  FileText,
  TrendingUp,
  Zap,
  Mailbox,
} from "lucide-react";
import Sidebar from "../components/shared/sidebar";
import { useAuthStore } from "../store/auth.store";

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
      badge: "3",
    },
    {
      icon: Mailbox,
      label: "Mailboxes",
      path: "/dashboard/mailboxes",
      badge: "3",
    },
    {
      icon: Mail,
      label: "Campaigns",
      path: "/dashboard/campaigns",
      badge: "12",
    },
    { icon: Users, label: "Audience", path: "/dashboard/audience" },
    {
      icon: FileText,
      label: "Templates",
      path: "/dashboard/templates",
      badge: "45",
    },
    { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/20 to-gray-50">
      {/* Sidebar */}
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        navItems={navItems}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}
      >
        {/* Top Bar - Enhanced */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-6 h-16 flex items-center justify-between shadow-sm">
          {/* Left: Breadcrumb with gradient */}
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {navItems.find((item) => item.path === location.pathname)
                  ?.label || "Dashboard"}
              </h2>
              <p className="text-xs text-gray-500 flex items-center">
                <Zap className="w-3 h-3 text-blue-500 mr-1" />
                Real-time updates enabled
              </p>
            </div>
          </div>

          {/* Right: Actions - Enhanced */}
          <div className="flex items-center space-x-4">
            {/* Stats Badge */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-linear-to-r from-blue-50 to-indigo-50/50 border border-blue-100/50">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                98% Deliverability
              </span>
            </div>

            {/* Search - Enhanced */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search campaigns, templates..."
                className="pl-10 pr-4 py-2.5 w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none bg-white/50 shadow-sm transition-all duration-200 focus:shadow-md focus:shadow-blue-500/10"
              />
            </div>

            {/* Help - Enhanced */}
            <button className="p-2 rounded-xl hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 group relative">
              <HelpCircle className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Notifications - Enhanced */}
            <div className="relative group">
              <button className="p-2 rounded-xl hover:bg-blue-50 transition-all hover:scale-105 active:scale-95">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
              <span className="absolute top-1 right-1 w-3 h-3 bg-linear-to-r from-red-500 to-pink-600 rounded-full border-2 border-white shadow-sm"></span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-75"></div>
            </div>

            {/* User Profile - Enhanced */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text">
                  {user?.email}
                </p>
              </div>
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                  {user?.name?.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area - Enhanced */}
        <main className="p-6 min-h-[calc(100vh-64px)]">
          {" "}
          {/* Changed from rounded-2xl bg-white/80... */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg h-full">
            {" "}
            {/* Added h-full */}
            <Outlet />
          </div>
        </main>

        {/* Footer - Enhanced */}
        <footer className="bg-linear-to-r from-white to-blue-50/30 border-t border-gray-200/50 px-6 py-4 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <Mail className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                © {new Date().getFullYear()} Unibox
              </span>
              <span className="text-xs text-gray-500">Email Campaign Tool</span>
            </div>
            <div className="flex items-center space-x-6 mt-2 md:mt-0">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-blue-600 transition-all hover:scale-105 font-medium"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-blue-600 transition-all hover:scale-105 font-medium"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-blue-600 transition-all hover:scale-105 font-medium"
              >
                Help
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-blue-600 transition-all hover:scale-105 font-medium"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center md:text-left flex items-center justify-between">
            <span>
              v1.0.0 • Last updated: {new Date().toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              All systems operational
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
