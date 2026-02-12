import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useTemplateStore = create((set) => ({
  /* =========================
     STATE
  ========================= */
  templates: [],
  currentTemplate: null,

  isLoading: false,
  isSaving: false,
  error: null,

  /* =========================
     FETCH ALL TEMPLATES
  ========================= */
  fetchTemplates: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });

      const params = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_URL}/templates?${params}`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load templates");

      set({
        templates: data.data || [],
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  /* =========================
     FETCH SINGLE TEMPLATE
  ========================= */
  fetchTemplateById: async (templateId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/templates/${templateId}`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Template not found");

      set({
        currentTemplate: data.data,
        isLoading: false,
      });

      return data.data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  /* =========================
     CREATE TEMPLATE
  ========================= */
  createTemplate: async (payload) => {
    try {
      set({ isSaving: true, error: null });

      const res = await fetch(`${API_URL}/templates`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create template");

      set((state) => ({
        templates: [data.data, ...state.templates],
        currentTemplate: data.data,
        isSaving: false,
      }));

      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isSaving: false });
      return { success: false, error: err.message };
    }
  },

  /* =========================
     UPDATE TEMPLATE
  ========================= */
  updateTemplate: async (templateId, payload) => {
    try {
      set({ isSaving: true, error: null });

      const res = await fetch(`${API_URL}/templates/${templateId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update template");

      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === templateId ? data.data : t,
        ),
        currentTemplate:
          state.currentTemplate?.id === templateId
            ? data.data
            : state.currentTemplate,
        isSaving: false,
      }));

      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isSaving: false });
      return { success: false, error: err.message };
    }
  },

  /* =========================
     DELETE TEMPLATE
  ========================= */
  deleteTemplate: async (templateId) => {
    try {
      set({ isSaving: true, error: null });

      const res = await fetch(`${API_URL}/templates/${templateId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete template");

      set((state) => ({
        templates: state.templates.filter((t) => t.id !== templateId),
        currentTemplate:
          state.currentTemplate?.id === templateId
            ? null
            : state.currentTemplate,
        isSaving: false,
      }));

      return { success: true };
    } catch (err) {
      set({ error: err.message, isSaving: false });
      return { success: false, error: err.message };
    }
  },

  /* =========================
     LOCAL STATE HELPERS
  ========================= */

  setCurrentTemplate: (template) => {
    set({ currentTemplate: template });
  },

  updateCurrentTemplateField: (field, value) => {
    set((state) => ({
      currentTemplate: state.currentTemplate
        ? { ...state.currentTemplate, [field]: value }
        : null,
    }));
  },

  clearCurrentTemplate: () => {
    set({ currentTemplate: null });
  },

  clearError: () => set({ error: null }),
}));
