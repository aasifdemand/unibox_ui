import { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from '../../../../hooks/useTemplate';

export const useTemplatesData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    isActive: true,
    isDefault: false,
    status: 'draft',
    variables: [],
  });
  const [editorMode, setEditorMode] = useState('rich');

  // React Query hooks
  const { data: templates = [], isLoading, error, refetch: refetchTemplates } = useTemplates();

  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  // Mock user fields for the editor
  const defaultUserFields = useMemo(
    () => [
      {
        fieldName: 'first_name',
        displayName: 'First Name',
        sampleValue: 'John',
      },
      { fieldName: 'last_name', displayName: 'Last Name', sampleValue: 'Doe' },
      {
        fieldName: 'email',
        displayName: 'Email',
        sampleValue: 'john@example.com',
      },
      {
        fieldName: 'company',
        displayName: 'Company',
        sampleValue: 'Acme Corp',
      },
      { fieldName: 'city', displayName: 'City', sampleValue: 'New York' },
      {
        fieldName: 'job_title',
        displayName: 'Job Title',
        sampleValue: 'Manager',
      },
      {
        fieldName: 'unsubscribe_link',
        displayName: 'Unsubscribe Link',
        sampleValue: '#',
      },
    ],
    [],
  );

  // Open create template modal
  const handleCreateNew = useCallback(() => {
    setFormData({
      name: 'New Template',
      subject: '',
      htmlContent: `<p>Hello {{first_name}},</p>\n<p>We're excited to share our latest updates with you!</p>\n<p>Best regards,<br>Your Team</p>`,
      isActive: true,
      isDefault: false,
      status: 'draft',
      variables: [],
    });
    setEditingTemplate(null);
    setEditorMode('rich');
    setShowTemplateModal(true);
  }, []);

  // Open edit template modal
  const handleEditTemplate = useCallback((template, e) => {
    e?.stopPropagation();
    setFormData({
      name: template.name || '',
      subject: template.subject || '',
      htmlContent:
        template.htmlContent ||
        `<p>Hello {{first_name}},</p>\n<p>We're excited to share our latest updates with you!</p>\n<p>Best regards,<br>Your Team</p>`,
      isActive: template.isActive || template.status === 'active' || true,
      isDefault: template.isDefault || false,
      status: template.status || 'draft',
      variables: template.variables || [],
    });
    setEditingTemplate(template);
    setEditorMode('rich');
    setShowTemplateModal(true);
  }, []);

  // Save template (create or update)
  const handleSaveTemplate = useCallback(async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Template name is required');
        return;
      }

      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          templateId: editingTemplate.id,
          ...formData,
        });
      } else {
        await createTemplate.mutateAsync(formData);
      }

      setShowTemplateModal(false);
      setEditingTemplate(null);
      refetchTemplates();
      toast.success(editingTemplate ? 'Template updated' : 'Template created');
    } catch (err) {
      console.error('Failed to save template:', err);
      toast.error(`Failed to save template: ${err.message}`);
    }
  }, [formData, editingTemplate, updateTemplate, createTemplate, refetchTemplates]);

  // Handle template deletion (without UI confirmation)
  const handleDeleteTemplate = useCallback(
    async (template) => {
      try {
        await deleteTemplate.mutateAsync(template.id);
        refetchTemplates();
        toast.success('Template deleted');
      } catch (err) {
        console.error('Failed to delete template:', err);
        toast.error(`Failed to delete template: ${err.message}`);
      }
    },
    [deleteTemplate, refetchTemplates],
  );

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterActive === 'all' ||
        (filterActive === 'active' &&
          (template.status === 'active' || template.status === 'draft')) ||
        (filterActive === 'inactive' && template.status === 'inactive');
      return matchesSearch && matchesFilter;
    });
  }, [templates, searchTerm, filterActive]);

  // Paginated templates
  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTemplates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTemplates, currentPage]);

  // Check if any mutation is pending
  const isPending =
    createTemplate.isPending || updateTemplate.isPending || deleteTemplate.isPending;

  return {
    state: {
      searchTerm,
      filterActive,
      showTemplateModal,
      editingTemplate,
      formData,
      editorMode,
      isPending,
      isLoading,
      error,
      currentPage,
      itemsPerPage: ITEMS_PER_PAGE,
      totalTemplates: filteredTemplates.length,
      defaultUserFields,
    },
    data: {
      templates,
      filteredTemplates,
      paginatedTemplates,
    },
    setters: {
      setSearchTerm: (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
      },
      setFilterActive: (filter) => {
        setFilterActive(filter);
        setCurrentPage(1);
      },
      setShowTemplateModal,
      setFormData,
      setEditorMode,
      setCurrentPage,
    },
    handlers: {
      handleCreateNew,
      handleEditTemplate,
      handleSaveTemplate,
      handleDeleteTemplate,
      refetchTemplates,
    },
    mutations: {
      deleteTemplate,
      createTemplate,
      updateTemplate,
    },
  };
};
