import ShowTemplate from '../../../modals/showtemplate';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import Dialog from '../../../components/ui/dialog';

// Import custom hook and components
import { useTemplatesData } from './hooks/use-templates-data';
import Header from './components/header';
import SearchFilters from './components/search-filters';
import TemplateGrid from './components/template-grid';
import EmptyState from './components/empty-state';
import LoadingState from './components/loading-state';
import ErrorState from './components/error-state';

const Templates = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const { state, data, setters, handlers, mutations } = useTemplatesData();

  const {
    searchTerm,
    filterActive,
    showTemplateModal,
    editingTemplate,
    formData,
    editorMode,
    isPending,
    isLoading,
    error,
    defaultUserFields,
  } = state;

  const { templates, filteredTemplates } = data;
  const { setSearchTerm, setFilterActive, setShowTemplateModal, setFormData, setEditorMode } =
    setters;
  const {
    handleCreateNew,
    handleEditTemplate,
    handleSaveTemplate,
    handleDeleteTemplate,
    refetchTemplates,
  } = handlers;

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading && templates.length === 0) {
    return <LoadingState />;
  }

  const handleRequestDeleteTemplate = (template, e) => {
    e?.stopPropagation();
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    await handleDeleteTemplate(templateToDelete);
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-400 mx-auto p-4 sm:p-6 lg:p-10 space-y-2"
      >
        <Header onCreateNew={handleCreateNew} isPending={isPending} />

        <div className="space-y-8">
          {error && <ErrorState error={error} onRetry={() => refetchTemplates()} />}

          <SearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterActive={filterActive}
            setFilterActive={setFilterActive}
            isPending={isPending}
          />

          {!isLoading && templates.length === 0 && !error ? (
            <EmptyState onCreateNew={handleCreateNew} isPending={isPending} />
          ) : (
            !isLoading &&
            templates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <TemplateGrid
                  templates={templates}
                  filteredTemplates={filteredTemplates}
                  onEdit={handleEditTemplate}
                  onDelete={handleRequestDeleteTemplate}
                  onCreateNew={handleCreateNew}
                  isPending={isPending}
                  deleteMutation={mutations.deleteTemplate}
                  formatDate={formatDate}
                />
              </motion.div>
            )
          )}

          {/* Global Loading State for Refreshing */}
          {isLoading && templates.length > 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                Syncing Forge assets...
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {showTemplateModal && (
        <ShowTemplate
          showTemplateModal={showTemplateModal}
          defaultUserFields={defaultUserFields}
          setShowTemplateModal={setShowTemplateModal}
          editingTemplate={editingTemplate}
          formData={formData}
          handleSaveTemplate={handleSaveTemplate}
          setFormData={setFormData}
          editorMode={editorMode}
          setEditorMode={setEditorMode}
          isSaving={mutations.createTemplate.isPending || mutations.updateTemplate.isPending}
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        title="Delete Template"
        description={
          templateToDelete
            ? `Are u sure u want to selete "${templateToDelete.name}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={mutations.deleteTemplate.isPending}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleConfirmDeleteTemplate}
      />
    </>
  );
};

export default Templates;
