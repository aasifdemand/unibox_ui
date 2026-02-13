// hooks/useTemplates.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// Query keys
export const templateKeys = {
  all: ["templates"],
  lists: () => [...templateKeys.all, "list"],
  list: (filters) => [...templateKeys.lists(), { filters }],
  details: () => [...templateKeys.all, "detail"],
  detail: (id) => [...templateKeys.details(), id],
};

// =========================
// FETCH ALL TEMPLATES
// =========================
const fetchTemplates = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_URL}/templates?${params}`, {
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load templates");
  return data.data || [];
};

export const useTemplates = (filters = {}) => {
  return useQuery({
    queryKey: templateKeys.list(filters),
    queryFn: () => fetchTemplates(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// =========================
// FETCH SINGLE TEMPLATE
// =========================
const fetchTemplateById = async (templateId) => {
  const res = await fetch(`${API_URL}/templates/${templateId}`, {
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Template not found");
  return data.data;
};

export const useTemplate = (templateId) => {
  return useQuery({
    queryKey: templateKeys.detail(templateId),
    queryFn: () => fetchTemplateById(templateId),
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// =========================
// CREATE TEMPLATE
// =========================
const createTemplate = async (payload) => {
  const res = await fetch(`${API_URL}/templates`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create template");
  return data.data;
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTemplate,
    onSuccess: (newTemplate) => {
      // Update templates list cache
      queryClient.setQueryData(templateKeys.lists(), (old = []) => {
        return [newTemplate, ...old];
      });
      // Set as current template in detail cache
      queryClient.setQueryData(
        templateKeys.detail(newTemplate.id),
        newTemplate,
      );
      // Invalidate lists to ensure fresh data
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
};

// =========================
// UPDATE TEMPLATE
// =========================
const updateTemplate = async ({ templateId, ...payload }) => {
  const res = await fetch(`${API_URL}/templates/${templateId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update template");
  return data.data;
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTemplate,
    onSuccess: (updatedTemplate, { templateId }) => {
      // Update in lists
      queryClient.setQueryData(templateKeys.lists(), (old = []) => {
        return old.map((template) =>
          template.id === templateId ? updatedTemplate : template,
        );
      });
      // Update detail query
      queryClient.setQueryData(
        templateKeys.detail(templateId),
        updatedTemplate,
      );
    },
  });
};

// =========================
// DELETE TEMPLATE
// =========================
const deleteTemplate = async (templateId) => {
  const res = await fetch(`${API_URL}/templates/${templateId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete template");
  return { templateId, message: data.message };
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: (_, templateId) => {
      // Remove from lists
      queryClient.setQueryData(templateKeys.lists(), (old = []) => {
        return old.filter((template) => template.id !== templateId);
      });
      // Remove detail query
      queryClient.removeQueries({ queryKey: templateKeys.detail(templateId) });
    },
  });
};

// =========================
// DUPLICATE TEMPLATE
// =========================
const duplicateTemplate = async (templateId) => {
  const res = await fetch(`${API_URL}/templates/${templateId}/duplicate`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to duplicate template");
  return data.data;
};

export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateTemplate,
    onSuccess: (newTemplate) => {
      // Add to lists
      queryClient.setQueryData(templateKeys.lists(), (old = []) => {
        return [newTemplate, ...old];
      });
    },
  });
};

// =========================
// BULK DELETE TEMPLATES
// =========================
const bulkDeleteTemplates = async (templateIds) => {
  const res = await fetch(`${API_URL}/templates/bulk/delete`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateIds }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete templates");
  return { templateIds, message: data.message };
};

export const useBulkDeleteTemplates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteTemplates,
    onSuccess: (_, templateIds) => {
      // Remove from lists
      queryClient.setQueryData(templateKeys.lists(), (old = []) => {
        return old.filter((template) => !templateIds.includes(template.id));
      });
      // Remove individual detail queries
      templateIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: templateKeys.detail(id) });
      });
    },
  });
};

// =========================
// GET TEMPLATE PREVIEW
// =========================
const fetchTemplatePreview = async ({ templateId, variables = {} }) => {
  const res = await fetch(`${API_URL}/templates/${templateId}/preview`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variables }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to generate preview");
  return data.data;
};

export const useTemplatePreview = () => {
  return useMutation({
    mutationFn: fetchTemplatePreview,
  });
};

// =========================
// GET TEMPLATE STATS
// =========================
const fetchTemplateStats = async (templateId) => {
  const res = await fetch(`${API_URL}/templates/${templateId}/stats`, {
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Failed to fetch template stats");
  return data.data;
};

export const useTemplateStats = (templateId) => {
  return useQuery({
    queryKey: [...templateKeys.detail(templateId), "stats"],
    queryFn: () => fetchTemplateStats(templateId),
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// =========================
// SEARCH TEMPLATES
// =========================
const searchTemplates = async ({ query, filters = {} }) => {
  const params = new URLSearchParams({ query, ...filters }).toString();
  const res = await fetch(`${API_URL}/templates/search?${params}`, {
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to search templates");
  return data.data || [];
};

export const useSearchTemplates = (query, filters = {}) => {
  return useQuery({
    queryKey: [...templateKeys.lists(), "search", query, filters],
    queryFn: () => searchTemplates({ query, filters }),
    enabled: !!query && query.length > 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// =========================
// GET TEMPLATE CATEGORIES
// =========================
const fetchTemplateCategories = async () => {
  const res = await fetch(`${API_URL}/templates/categories`, {
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch categories");
  return data.data || [];
};

export const useTemplateCategories = () => {
  return useQuery({
    queryKey: [...templateKeys.all, "categories"],
    queryFn: fetchTemplateCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// =========================
// RENDER TEMPLATE
// =========================
const renderTemplate = async ({ templateId, variables }) => {
  const res = await fetch(`${API_URL}/templates/${templateId}/render`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variables }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to render template");
  return data.data;
};

export const useRenderTemplate = () => {
  return useMutation({
    mutationFn: renderTemplate,
  });
};

// =========================
// VALIDATE TEMPLATE
// =========================
const validateTemplate = async (content) => {
  const res = await fetch(`${API_URL}/templates/validate`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Template validation failed");
  return data.data;
};

export const useValidateTemplate = () => {
  return useMutation({
    mutationFn: validateTemplate,
  });
};

// =========================
// EXPORT TEMPLATE
// =========================
const exportTemplate = async ({ templateId, format = "html" }) => {
  const res = await fetch(
    `${API_URL}/templates/${templateId}/export?format=${format}`,
    {
      credentials: "include",
    },
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to export template");
  }

  return { blob: await res.blob(), templateId, format };
};

export const useExportTemplate = () => {
  return useMutation({
    mutationFn: exportTemplate,
    onSuccess: ({ blob, templateId, format }) => {
      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `template-${templateId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
};

// =========================
// IMPORT TEMPLATE
// =========================
const importTemplate = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/templates/import`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to import template");
  return data.data;
};

export const useImportTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importTemplate,
    onSuccess: (newTemplate) => {
      queryClient.setQueryData(templateKeys.lists(), (old = []) => {
        return [newTemplate, ...old];
      });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
};
