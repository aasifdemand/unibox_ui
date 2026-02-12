import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  Trash2,
  Edit3,
  Eye,
  Filter,
  Download,
  Search,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Button from "../../../components/ui/button";
import { useTemplateStore } from "../../../store/template.store";
import ShowTemplate from "../../../modals/showtemplate";

const Templates = () => {
  const {
    templates,
    currentTemplate,
    isLoading,
    error,
    fetchTemplates,
    setCurrentTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    clearError,
  } = useTemplateStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    htmlContent: "",
    isActive: true,
    variables: [],
  });
  const [editorMode, setEditorMode] = useState("rich");

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Mock user fields for the editor
  const defaultUserFields = [
    { fieldName: "first_name", displayName: "First Name", sampleValue: "John" },
    { fieldName: "last_name", displayName: "Last Name", sampleValue: "Doe" },
    {
      fieldName: "email",
      displayName: "Email",
      sampleValue: "john@example.com",
    },
    { fieldName: "company", displayName: "Company", sampleValue: "Acme Corp" },
    { fieldName: "city", displayName: "City", sampleValue: "New York" },
    {
      fieldName: "job_title",
      displayName: "Job Title",
      sampleValue: "Manager",
    },
    {
      fieldName: "unsubscribe_link",
      displayName: "Unsubscribe Link",
      sampleValue: "#",
    },
  ];

  // Open create template modal
  const handleCreateNew = () => {
    setFormData({
      name: "New Template",
      subject: "",
      htmlContent: `<p>Hello {{first_name}},</p>
<p>We're excited to share our latest updates with you!</p>
<p>Best regards,<br>Your Team</p>`,
      isActive: true,
      variables: [],
    });
    setEditingTemplate(null);
    setEditorMode("rich");
    setShowTemplateModal(true);
  };

  // Open edit template modal
  const handleEditTemplate = (template, e) => {
    e?.stopPropagation();
    setFormData({
      name: template.name || "",
      subject: template.subject || "",
      htmlContent:
        template.htmlContent ||
        `<p>Hello {{first_name}},</p>
<p>We're excited to share our latest updates with you!</p>
<p>Best regards,<br>Your Team</p>`,
      isActive: template.isActive || true,
      variables: template.variables || [],
    });
    setEditingTemplate(template);
    setEditorMode("rich");
    setShowTemplateModal(true);
  };

  // Select template for viewing/editing
  const handleSelectTemplate = (template) => {
    setCurrentTemplate(template);
  };

  // Save template (create or update)
  const handleSaveTemplate = async () => {
    try {
      // Validate form data
      if (!formData.name.trim()) {
        alert("Template name is required");
        return;
      }

      if (editingTemplate) {
        // Update existing template
        const result = await updateTemplate(editingTemplate.id, formData);
        if (result.success) {
          console.log("Template updated successfully");
          setShowTemplateModal(false);
          setEditingTemplate(null);
        }
      } else {
        // Create new template
        const result = await createTemplate(formData);
        if (result.success) {
          console.log("Template created successfully");
          setShowTemplateModal(false);
        }
      }
    } catch (err) {
      console.error("Failed to save template:", err);
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (template, e) => {
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      const result = await deleteTemplate(template.id);
      if (result.success) {
        console.log("Template deleted successfully");
      }
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && template.isActive) ||
      (filterActive === "inactive" && !template.isActive);
    return matchesSearch && matchesFilter;
  });

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Quick Actions
  const quickActions = [
    {
      title: "Create Template",
      description: "Design a new email template",
      icon: <Sparkles className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-linear-to-br from-blue-50 to-indigo-50",
      onClick: handleCreateNew,
    },
    {
      title: "Import Template",
      description: "Upload existing templates",
      icon: <Download className="w-5 h-5" />,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-linear-to-br from-green-50 to-emerald-50",
      onClick: () => console.log("Import template"),
    },
    {
      title: "Template Analytics",
      description: "View template performance",
      icon: <Eye className="w-5 h-5" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-linear-to-br from-purple-50 to-purple-50",
      onClick: () => console.log("Analytics"),
    },
  ];

  if (isLoading && templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 p-6">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-indigo-600/20 blur-xl rounded-full"></div>
        </div>
        <p className="text-gray-600 font-medium mt-6">Loading templates...</p>
        <p className="text-sm text-gray-500 mt-2">
          Please wait while we fetch your templates
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Email Templates
            </h1>
            <p className="text-gray-600 mt-1">
              Design and manage reusable email templates for your campaigns
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-linear-to-r from-red-50 to-red-50/30 rounded-2xl p-6 border border-red-200/50">
            <div className="flex items-start">
              <div className="p-3 rounded-xl bg-red-100 mr-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  Failed to load templates
                </h3>
                <p className="text-red-700">{error}</p>
                <p className="text-sm text-red-600 mt-2">
                  Please check your connection and try again
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={clearError}
                  className="px-4 py-2 text-sm bg-white border border-red-300 text-red-700 hover:bg-red-50"
                >
                  Dismiss
                </Button>
                <Button
                  onClick={fetchTemplates}
                  className="px-4 py-2 text-sm bg-linear-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/50 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setFilterActive("all")}
                  className={`px-4 py-2 text-sm ${filterActive === "all" ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  All
                </Button>
                <Button
                  onClick={() => setFilterActive("active")}
                  className={`px-4 py-2 text-sm ${filterActive === "active" ? "bg-linear-to-r from-green-600 to-emerald-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Active
                </Button>
                <Button
                  onClick={() => setFilterActive("inactive")}
                  className={`px-4 py-2 text-sm ${filterActive === "inactive" ? "bg-linear-to-r from-gray-600 to-gray-700 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Inactive
                </Button>
              </div>
              <Button className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!isLoading && templates.length === 0 && !error && (
          <div className="bg-linear-to-br from-blue-50 to-indigo-50/30 rounded-2xl p-12 border border-gray-200/50 text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-indigo-600/20 blur-xl rounded-full"></div>
              <div className="relative w-24 h-24 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <FileText className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No templates yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Start by creating your first email template to streamline your
              communication workflow
            </p>
            <Button
              onClick={handleCreateNew}
              className="px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your First Template
            </Button>
          </div>
        )}

        {/* Content Grid */}
        {!isLoading && templates.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Templates List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/50">
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Templates
                      </h3>
                      <p className="text-sm text-gray-600">
                        {filteredTemplates.length} template
                        {filteredTemplates.length !== 1 ? "s" : ""} found
                      </p>
                    </div>
                    <Button className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Templates Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className={`
                          group cursor-pointer rounded-xl border p-5 transition-all duration-300
                          ${
                            currentTemplate?.id === template.id
                              ? "border-blue-500 bg-linear-to-br from-blue-50 to-blue-50/30 ring-2 ring-blue-500 ring-opacity-20"
                              : "border-gray-200/50 bg-white hover:border-blue-300 hover:shadow-lg"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div
                              className={`
                              w-12 h-12 rounded-xl flex items-center justify-center mr-4
                              ${
                                currentTemplate?.id === template.id
                                  ? "bg-linear-to-r from-blue-600 to-indigo-600"
                                  : "bg-linear-to-br from-gray-100 to-gray-50"
                              }
                            `}
                            >
                              <FileText
                                className={`
                                w-6 h-6
                                ${currentTemplate?.id === template.id ? "text-white" : "text-gray-600"}
                              `}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {template.name}
                              </h4>
                              <div className="flex items-center mt-1">
                                <span
                                  className={`
                                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${
                                    template.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }
                                `}
                                >
                                  {template.isActive ? "Active" : "Inactive"}
                                </span>
                                <span className="text-xs text-gray-500 ml-3">
                                  {template.variables?.length || 0} variables
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleEditTemplate(template, e)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              aria-label={`Edit template ${template.name}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteTemplate(template, e)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              aria-label={`Delete template ${template.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {template.subject || "No subject line"}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="text-sm text-gray-500">
                            Updated {formatDate(template.updatedAt)}
                          </div>
                          <div className="flex items-center text-sm text-blue-600 font-medium">
                            Edit
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </div>

                        {/* Selected Indicator */}
                        {currentTemplate?.id === template.id && (
                          <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                            <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Quick Actions
                </h3>
                <div className="space-y-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={`w-full p-4 rounded-xl ${action.bgColor} border border-gray-200/50 hover:shadow-md transition-all text-left group`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`p-3 rounded-lg bg-linear-to-r ${action.color} bg-opacity-20`}
                        >
                          <div
                            className={`text-transparent bg-linear-to-r ${action.color} bg-clip-text`}
                          >
                            {action.icon}
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium text-gray-900">
                            {action.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {action.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-gray-600 transition" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50/30 rounded-2xl p-6 border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Template Stats
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Active Templates
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {templates.filter((t) => t.isActive).length}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-linear-to-r from-green-500 to-emerald-600 rounded-full"
                        style={{
                          width: `${(templates.filter((t) => t.isActive).length / Math.max(templates.length, 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Average Variables
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {templates.length > 0
                          ? Math.round(
                              templates.reduce(
                                (sum, t) => sum + (t.variables?.length || 0),
                                0,
                              ) / templates.length,
                            )
                          : 0}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Recently Updated
                      </span>
                      <span className="text-sm text-gray-500">
                        {templates.length > 0
                          ? formatDate(templates[0].updatedAt)
                          : "Never"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200/50">
                  <h4 className="font-medium text-gray-900 mb-4">Usage Tips</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3"></div>
                      <p className="text-sm text-gray-600">
                        Use variables for personalization
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3"></div>
                      <p className="text-sm text-gray-600">
                        Test templates before sending
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3"></div>
                      <p className="text-sm text-gray-600">
                        Duplicate successful templates
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State for Existing Templates */}
        {isLoading && templates.length > 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-3" />
            <span className="text-gray-600">Refreshing templates...</span>
          </div>
        )}
      </div>

      {showTemplateModal && (
        <ShowTemplate
          showTemplateModal={showTemplateModal} // ADD THIS LINE
          defaultUserFields={defaultUserFields}
          setShowTemplateModal={setShowTemplateModal}
          editingTemplate={editingTemplate}
          formData={formData}
          handleSaveTemplate={handleSaveTemplate}
          setFormData={setFormData}
          editorMode={editorMode}
          setEditorMode={setEditorMode}
        />
      )}
    </>
  );
};

export default Templates;
