import React, { useState } from "react";
import {
  User,
  Shield,
  Box,
  Settings as SettingsIcon,
  Loader2,
  Bell,
  Smartphone,
  CreditCard,
} from "lucide-react";

// Components
import ProfileTab from "./components/profile-tab";
import SecurityTab from "./components/security-tab";
import ResourcesTab from "./components/resources-tab";
import Dialog from "../../../components/ui/dialog";

// Hooks
import { useCurrentUser } from "../../../hooks/useAuth";
import { useSenders, useDeleteSender } from "../../../hooks/useSenders";
import { useTemplates, useDeleteTemplate } from "../../../hooks/useTemplate";
import { useBatches } from "../../../hooks/useBatches";
import { useCampaigns } from "../../../hooks/useCampaign";
import toast from "react-hot-toast";

const Settings = () => {
  const [activeMenu, setActiveMenu] = useState("profile");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch Current User
  const { data: user, isLoading: userLoading } = useCurrentUser();

  // Fetch Resources Data
  const { data: senders = [], isLoading: sendersLoading } = useSenders();
  const { data: templates = [], isLoading: templatesLoading } = useTemplates();
  const { data: batches = [], isLoading: batchesLoading } = useBatches();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();

  // Resource Mutations
  const deleteSender = useDeleteSender();
  const deleteTemplate = useDeleteTemplate();

  const handleOnDeleteSender = (id) => {
    const sender = senders.find((s) => s.id === id);
    setDeleteTarget(
      sender
        ? { type: "sender", id, label: sender.displayName || sender.email }
        : { type: "sender", id, label: "this sender" },
    );
    setDeleteDialogOpen(true);
  };

  const handleOnDeleteTemplate = (id) => {
    const template = templates.find((t) => t.id === id);
    setDeleteTarget(
      template
        ? { type: "template", id, label: template.name }
        : { type: "template", id, label: "this template" },
    );
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "sender") {
        await deleteSender.mutateAsync({ senderId: deleteTarget.id });
        toast.success("Sender deleted");
      } else if (deleteTarget.type === "template") {
        await deleteTemplate.mutateAsync(deleteTarget.id);
        toast.success("Template deleted");
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const menuItems = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Personal details & avatar",
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Password & authentication",
    },
    {
      id: "workspace",
      label: "Resources",
      icon: Box,
      description: "Senders, lists & templates",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Manage alerts",
      disabled: true,
    },
    {
      id: "billing",
      label: "Billing",
      icon: CreditCard,
      description: "Plans & invoices",
      disabled: true,
    },
  ];

  if (userLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-blue-500/20"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="premium-card bg-white border-slate-200/60 p-6 md:p-8 flex items-center justify-between shadow-2xl shadow-slate-900/2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Settings
            </h1>
            <p className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Personal account · Workspace resources · Security controls
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
            Account Ready
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:w-72 shrink-0 space-y-6">
          <div className="premium-card bg-white border-slate-200/60 p-3 space-y-1 shadow-2xl shadow-slate-900/3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveMenu(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center p-3 rounded-2xl transition-all duration-200 group ${
                  activeMenu === item.id
                    ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10"
                    : item.disabled
                      ? "opacity-50 cursor-not-allowed grayscale"
                      : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`p-2 rounded-xl mr-3 transition-colors ${
                    activeMenu === item.id
                      ? "bg-white shadow-sm text-blue-600"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm tracking-tight">
                    {item.label}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">
                    {item.description}
                  </p>
                </div>
                {item.disabled && (
                  <span className="ml-auto text-[8px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6 rounded-3xl bg-linear-to-br from-indigo-900 to-blue-900 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-bold mb-1">Need help?</h4>
              <p className="text-xs text-blue-100 mb-4 opacity-80 font-medium">
                Check our documentation or contact support for advanced
                settings.
              </p>
              <button className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition duration-300">
                Open Support
              </button>
            </div>
            <SettingsIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="premium-card bg-white rounded-4xl border border-slate-200/60 shadow-2xl shadow-slate-900/2 min-h-150 overflow-hidden">
            {activeMenu === "profile" && <ProfileTab user={user} />}
            {activeMenu === "security" && <SecurityTab />}
            {activeMenu === "workspace" && (
              <ResourcesTab
                senders={senders}
                templates={templates}
                batches={batches}
                campaigns={campaigns}
                loading={{
                  senders: sendersLoading,
                  templates: templatesLoading,
                  batches: batchesLoading,
                  campaigns: campaignsLoading,
                }}
                onDeleteSender={handleOnDeleteSender}
                onDeleteTemplate={handleOnDeleteTemplate}
              />
            )}
          </div>
        </main>
      </div>

      <Dialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        title={
          deleteTarget?.type === "sender"
            ? "Delete Sender"
            : deleteTarget?.type === "template"
              ? "Delete Template"
              : "Delete Item"
        }
        description={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.label}? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={
          deleteTarget?.type === "sender"
            ? deleteSender.isPending
            : deleteTarget?.type === "template"
              ? deleteTemplate.isPending
              : false
        }
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Settings;
