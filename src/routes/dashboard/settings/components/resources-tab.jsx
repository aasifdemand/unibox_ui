import React, { useState } from "react";
import {
  Mail,
  MessageSquare,
  Users,
  Globe,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../../../../components/ui/pagination";

const ResourcesTab = ({
  senders,
  templates,
  batches,
  campaigns,
  loading,
  onDeleteSender,
  onDeleteTemplate,
}) => {
  const [subTab, setSubTab] = useState("senders");
  const [pages, setPages] = useState({
    senders: 1,
    templates: 1,
    lists: 1,
    campaigns: 1,
  });

  const ITEMS_PER_PAGE = 6;

  const handlePageChange = (tab, page) => {
    setPages((prev) => ({ ...prev, [tab]: page }));
  };

  const getPaginatedData = (data, tab) => {
    const startIndex = (pages[tab] - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
      case "completed":
      case "sent":
        return "bg-green-100 text-green-800";
      case "pending":
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "bounced":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const resourceTabs = [
    { id: "senders", label: "Senders", icon: Mail, count: senders.length },
    {
      id: "templates",
      label: "Templates",
      icon: MessageSquare,
      count: templates.length,
    },
    { id: "lists", label: "Email Lists", icon: Users, count: batches.length },
    {
      id: "campaigns",
      label: "Campaigns",
      icon: Globe,
      count: campaigns.length,
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-150">
      {/* Sub Tabs */}
      <div className="flex items-center space-x-1 p-1 bg-gray-100/50 rounded-xl m-6 mb-2">
        {resourceTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              subTab === tab.id
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span
              className={`px-2 py-0.5 text-[10px] rounded-full ${
                subTab === tab.id
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Senders Content */}
          {subTab === "senders" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold text-gray-900">Email Senders</h4>
                <Link
                  to="/dashboard/audience?sender=true"
                  className="text-sm font-medium text-blue-600 hover:underline flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add New
                </Link>
              </div>
              {loading.senders ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : senders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getPaginatedData(senders, "senders").map((sender) => (
                    <div
                      key={sender.id}
                      className="p-4 border border-gray-100 rounded-xl bg-gray-50/30 hover:bg-white hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {sender.email}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                              {sender.type}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteSender(sender.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500 text-sm">
                  No senders found.
                </p>
              )}
            </div>
          )}

          {/* Templates Content */}
          {subTab === "templates" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold text-gray-900">Email Templates</h4>
                <Link
                  to="/dashboard/templates/create"
                  className="text-sm font-medium text-blue-600 hover:underline flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Create Template
                </Link>
              </div>
              {loading.templates ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getPaginatedData(templates, "templates").map((template) => (
                    <div
                      key={template.id}
                      className="p-4 border border-gray-100 rounded-xl bg-gray-50/30 hover:bg-white hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {template.name}
                        </h5>
                        <button
                          onClick={() => onDeleteTemplate(template.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                        {template.subject}
                      </p>
                      <Link
                        to="/dashboard/templates"
                        className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center"
                      >
                        Manage <ChevronRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500 text-sm">
                  No templates found.
                </p>
              )}
            </div>
          )}

          {/* Lists Content */}
          {subTab === "lists" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold text-gray-900">Contact Lists</h4>
                <Link
                  to="/dashboard/audience"
                  className="text-sm font-medium text-blue-600 hover:underline flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Upload New
                </Link>
              </div>
              {loading.batches ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : batches.length > 0 ? (
                <div className="space-y-3">
                  {getPaginatedData(batches, "lists").map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {batch.originalFilename}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusColor(batch.status)}`}
                      >
                        {batch.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500 text-sm">
                  No lists found.
                </p>
              )}
            </div>
          )}

          {/* Campaigns Content */}
          {subTab === "campaigns" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold text-gray-900">
                  Active Campaigns
                </h4>
                <Link
                  to="/dashboard/campaigns"
                  className="text-sm font-medium text-blue-600 hover:underline flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-1" /> View All
                </Link>
              </div>
              {loading.campaigns ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : campaigns.length > 0 ? (
                <div className="space-y-3">
                  {getPaginatedData(campaigns, "campaigns").map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-700">
                          {campaign.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusColor(campaign.status)}`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500 text-sm">
                  No campaigns found.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Pagination Component */}
        <div className="mt-auto">
          {subTab === "senders" && senders.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={pages.senders}
              totalItems={senders.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(p) => handlePageChange("senders", p)}
            />
          )}
          {subTab === "templates" && templates.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={pages.templates}
              totalItems={templates.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(p) => handlePageChange("templates", p)}
            />
          )}
          {subTab === "lists" && batches.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={pages.lists}
              totalItems={batches.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(p) => handlePageChange("lists", p)}
            />
          )}
          {subTab === "campaigns" && campaigns.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={pages.campaigns}
              totalItems={campaigns.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(p) => handlePageChange("campaigns", p)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesTab;
