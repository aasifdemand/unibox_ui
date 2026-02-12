// Sidebar.jsx - Enhanced version
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Mail,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import Dialog from "../../components/ui/dialog";

const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed, navItems }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);
  const loading = useAuthStore((state) => state.loading);
  const user = useAuthStore((state) => state.user);

  // console.log("USER:", user);

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [activeHover, setActiveHover] = useState(null);

  const handleLogout = async () => {
    const success = await logout();

    if (success) {
      setShowLogoutDialog(false);
      navigate("/auth/login");
    }
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen bg-linear-to-b from-white via-blue-50/30 to-white border-r border-gray-200/50 transition-all duration-300 z-30 shadow-xl backdrop-blur-sm ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
        style={{
          boxShadow: "4px 0 20px rgba(59, 130, 246, 0.08)",
        }}
      >
        {/* Logo Section - Enhanced */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-linear-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  Unibox
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Email Campaigns</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 border border-gray-200/50"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-blue-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-blue-600" />
            )}
          </button>
        </div>

        {/* Navigation - Enhanced */}
        <div className="p-3">
          <div className="mb-4 px-3 py-2 rounded-lg bg-linear-to-r from-blue-50/80 to-indigo-50/50 border border-blue-100/50">
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 text-blue-500" />
              {!sidebarCollapsed && (
                <p className="ml-2 text-xs font-medium text-blue-700">
                  Daily Campaigns: 12
                </p>
              )}
            </div>
          </div>

          <nav className="space-y-1 overflow-y-auto h-[calc(100vh-10rem)] pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => setActiveHover(item.path)}
                  onMouseLeave={() => setActiveHover(null)}
                  className={`relative flex items-center rounded-xl px-3 py-3 transition-all duration-200 ${
                    isActive
                      ? "bg-linear-to-r from-blue-500/10 to-indigo-500/5 text-blue-700 shadow-sm shadow-blue-500/10 border-l-4 border-blue-500"
                      : "text-gray-700 hover:bg-gray-50/80 hover:shadow-sm"
                  } ${activeHover === item.path ? "translate-x-1" : ""}`}
                >
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-all ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-blue-500"
                      }`}
                    />
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="ml-3 font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-linear-to-r from-blue-500 to-blue-600 text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer - Enhanced */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm p-4">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                {user?.name?.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            {!sidebarCollapsed && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name}
                </p>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">{user?.role}</span>
                  {/* <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-linear-to-r from-green-500 to-emerald-600 text-white">
                    Pro
                  </span> */}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowLogoutDialog(true)}
              onMouseEnter={(e) =>
                e.currentTarget.classList.add("animate-pulse")
              }
              onMouseLeave={(e) =>
                e.currentTarget.classList.remove("animate-pulse")
              }
              className="p-1.5 rounded-lg hover:bg-red-50 transition-all hover:scale-110 active:scale-95 ml-auto group"
            >
              <LogOut className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Dialog */}
      <Dialog
        open={showLogoutDialog}
        title="Logout Confirmation"
        description="Are you sure you want to log out? Your session will be terminated."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={loading}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Sidebar;
