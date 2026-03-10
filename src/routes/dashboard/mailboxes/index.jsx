import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useMailboxesData } from './hooks/use-mailboxes-data';
import Header from './components/header';
import MailboxList from './components/mailbox-list';
import MessagesView from './components/messages-view';
import MessageDetailView from './components/messagedetails-view';
import ComposeView from './components/compose-view';
import Loader from './components/loader';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Dialog from '../../../components/ui/dialog';
import Pagination from './components/pagination';

const Mailboxes = () => {
  const { t } = useTranslation();
  const { state, data, isLoading, error, setters, handlers, utils } = useMailboxesData();

  const composeRef = useRef(null);
  const [showComposePreview, setShowComposePreview] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteContext, setDeleteContext] = useState(null);

  const {
    handleDisconnect: disconnectAction,
    handleBulkDelete: bulkDeleteAction,
    handleBulkDeleteSenders: bulkSenderDeleteAction,
    handleCheckSender,
    handleCheckAllSenders,
  } = handlers;

  const handleRequestDisconnect = () => {
    setDeleteContext({ type: 'disconnect' });
    setDeleteDialogOpen(true);
  };

  const handleRequestBulkSenderDelete = () => {
    if (!state.selectedSenderIds || state.selectedSenderIds.length === 0) return;
    setDeleteContext({
      type: 'bulkSenderDelete',
      count: state.selectedSenderIds.length,
    });
    setDeleteDialogOpen(true);
  };

  const handleRequestBulkDelete = () => {
    if (!state.selectedMessages || state.selectedMessages.length === 0) return;
    setDeleteContext({
      type: 'bulkDelete',
      count: state.selectedMessages.length,
    });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteContext) return;
    if (deleteContext.type === 'disconnect') {
      await disconnectAction();
    } else if (deleteContext.type === 'bulkDelete') {
      await bulkDeleteAction();
    } else if (deleteContext.type === 'bulkSenderDelete') {
      await bulkSenderDeleteAction();
    }
    setDeleteDialogOpen(false);
    setDeleteContext(null);
  };

  if (isLoading.isMailboxes && data.mailboxes.length === 0) {
    return <Loader isLoading={isLoading.isMailboxes} mailboxes={data.mailboxes} />;
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 min-w-0">
      <Header
        view={state.view}
        selectedMailbox={state.selectedMailbox}
        selectedFolder={state.selectedFolder}
        currentMessage={data.currentMessage}
        mailboxesCount={data.mailboxes.length}
        getFolderUnreadCount={data.getFolderUnreadCount}
        filterUnread={state.filterUnread}
        filterStarred={state.filterStarred}
        filterAttachments={state.filterAttachments}
        totalMessages={state.totalMessages}
        startMessageCount={data.startMessageCount}
        endMessageCount={data.endMessageCount}
        getSubject={utils.getSubject}
        onBack={
          state.view === 'message' ? handlers.handleBackToMessages : handlers.handleBackToMailboxes
        }
        onRefresh={handlers.refetchMailboxes}
        isLoading={isLoading.isMailboxes}
        onCompose={handlers.handleCompose}
        onSync={handlers.handleSync}
        isSyncing={isLoading.isSyncing}
        onFilterUnread={() => setters.setFilterUnread(!state.filterUnread)}
        filterUnreadActive={state.filterUnread}
        onRefreshToken={handlers.handleRefreshToken}
        showRefreshToken={state.selectedMailbox?.type !== 'smtp'}
        onDisconnect={handleRequestDisconnect}
        selectedMessages={state.selectedMessages}
        onBulkMarkRead={handlers.handleBulkMarkRead}
        onBulkMarkUnread={handlers.handleBulkMarkUnread}
        onBulkDelete={handleRequestBulkDelete}
        onClearSelection={() => setters.setSelectedMessages([])}
        mailboxType={state.selectedMailbox?.type}
        onReply={() => handlers.handleReply(data.currentMessage)}
        onForward={() => handlers.handleForward(data.currentMessage)}
        onDeleteMessage={() => handlers.handleDeleteMessage(state.currentMessageId)}
        showMessageActions={state.view === 'message'}
        mailboxViewMode={state.mailboxViewMode}
        onToggleMailboxViewMode={handlers.handleToggleMailboxViewMode}
        mailboxSearch={state.mailboxSearch}
        onMailboxSearchChange={handlers.handleMailboxSearchChange}
        mailboxTypeFilter={state.mailboxTypeFilter}
        onMailboxTypeChange={handlers.handleMailboxTypeChange}
        onBulkSenderDelete={handleRequestBulkSenderDelete}
        onClearSenderSelection={() => setters.setSelectedSenderIds([])}
        // Compose props for header
        onSendCompose={() => composeRef.current?.handleSend()}
        onSaveDraft={() => composeRef.current?.handleSaveDraft()}
        isSending={isLoading.isSending}
        composeType={state.replyToMessage ? 'reply' : state.forwardMessage ? 'forward' : 'new'}
        onTogglePreview={() => setShowComposePreview(!showComposePreview)}
        showPreview={showComposePreview}
        onAttach={() => composeRef.current?.triggerFileUpload()}
        onAttachImage={() => composeRef.current?.triggerImageUpload()}
      />

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 me-3" />
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
          <button
            onClick={handlers.handleResetQueries}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            {t('mailboxes.dismiss')}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative min-w-0">
        <AnimatePresence mode="wait">
          {state.view === 'list' && (
            <motion.div
              key="mailbox-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col min-h-0 h-full"
            >
              <div className="flex-1 overflow-y-auto">
                <MailboxList
                  mailboxes={data.mailboxes}
                  onSelect={handlers.handleSelectMailbox}
                  getProviderIcon={utils.getProviderIcon}
                  timeAgo={utils.timeAgo}
                  format={format}
                  viewMode={state.mailboxViewMode}
                  selectedSenderIds={state.selectedSenderIds}
                  onCheckSender={handleCheckSender}
                  onCheckAllSenders={handleCheckAllSenders}
                />
              </div>
              {data.mailboxMeta && data.mailboxMeta.totalPages > 1 && (
                <div className="py-4 shrink-0">
                  <Pagination
                    currentPage={state.mailboxPage}
                    hasNextPage={state.mailboxPage < data.mailboxMeta.totalPages}
                    hasPreviousPage={state.mailboxPage > 1}
                    isLoadingMessages={isLoading.isMailboxes}
                    onNextPage={() => handlers.handleMailboxPageChange(state.mailboxPage + 1)}
                    onPrevPage={() => handlers.handleMailboxPageChange(state.mailboxPage - 1)}
                    onPageChange={handlers.handleMailboxPageChange}
                    totalMessages={data.mailboxMeta.total}
                    itemsPerPage={data.mailboxMeta.limit}
                    startMessageCount={(state.mailboxPage - 1) * data.mailboxMeta.limit + 1}
                    endMessageCount={Math.min(
                      state.mailboxPage * data.mailboxMeta.limit,
                      data.mailboxMeta.total,
                    )}
                  />
                </div>
              )}
            </motion.div>
          )}

          {(state.view === 'messages' || state.view === 'message' || state.view === 'compose') && state.selectedMailbox && (
            <motion.div
              key="messages-view-container"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <MessagesView
                ref={composeRef}
                view={state.view}
                currentMessage={data.currentMessage}
                isMessageLoading={isLoading.isMessageLoading}
                onBack={
                  state.view === 'message' || state.view === 'compose'
                    ? handlers.handleBackToMessages
                    : handlers.handleBackToMailboxes
                }
                onDelete={() => handlers.handleDeleteMessage(state.currentMessageId)}
                onReply={() => handlers.handleReply(data.currentMessage)}
                onForward={() => handlers.handleForward(data.currentMessage)}
                onMarkRead={() => handlers.handleMarkMessageAsRead(state.currentMessageId)}
                onMarkUnread={() => handlers.handleMarkMessageAsUnread(state.currentMessageId)}
                onStar={(id, starred) => handlers.handleToggleStar(id, starred)}
                onPrint={() => window.print()}
                onDownload={(id, filename) => handlers.handleDownloadAttachment(id, filename)}
                selectedMailbox={state.selectedMailbox}
                selectedFolder={state.selectedFolder}
                folders={data.folders}
                showStats={state.showStats}
                filteredMessages={data.filteredMessages}
                isLoadingMessages={isLoading.isMessages}
                viewMode={state.viewMode}
                selectedMessages={state.selectedMessages}
                onSelectFolder={handlers.handleSelectFolder}
                showAllFolders={state.showAllFolders}
                onToggleShowAllFolders={() => setters.setShowAllFolders(!state.showAllFolders)}
                onSelectMessage={handlers.handleSelectMessage}
                onCheckMessage={handlers.handleCheckMessage}
                formatMessageDate={utils.formatMessageDate}
                getSender={utils.getSenderInfo}
                getSubject={utils.getSubject}
                getPreview={utils.getPreview}
                getInitials={utils.getInitials}
                searchQuery={state.searchQuery}
                onSearchChange={setters.setSearchQuery}
                onSearchClear={() => setters.setSearchQuery('')}
                dateRange={state.dateRange}
                onDateRangeChange={setters.setDateRange}
                filterStarred={state.filterStarred}
                onFilterStarred={() => setters.setFilterStarred(!state.filterStarred)}
                filterAttachments={state.filterAttachments}
                onFilterAttachments={() => setters.setFilterAttachments(!state.filterAttachments)}
                filterUnread={state.filterUnread}
                pagination={{
                  currentPage: state.currentPage,
                  hasNextPage: state.hasNextPage,
                  hasPreviousPage: state.hasPreviousPage,
                  totalMessages: state.totalMessages,
                }}
                onNextPage={handlers.handleNextPage}
                onPrevPage={handlers.handlePreviousPage}
                startMessageCount={data.startMessageCount}
                endMessageCount={data.endMessageCount}
                totalMessages={state.totalMessages}
                onCompose={handlers.handleCompose}
                onCloseCompose={handlers.handleCloseCompose}
                onSendCompose={() => composeRef.current?.handleSend()}
                onSaveDraft={() => composeRef.current?.handleSaveDraft()}
                replyToMessage={state.replyToMessage}
                forwardMessage={state.forwardMessage}
                isIntegrated={true}
                showPreview={showComposePreview}
                onTogglePreview={() => setShowComposePreview(!showComposePreview)}
              />
            </motion.div>
          )}



        </AnimatePresence>
      </div>

      <Dialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        title={
          deleteContext?.type === 'disconnect'
            ? t('mailboxes.disconnect_title')
            : deleteContext?.type === 'bulkDelete'
              ? t('mailboxes.delete_messages_title')
              : deleteContext?.type === 'bulkSenderDelete'
                ? t('mailboxes.delete_mailboxes_title')
                : t('mailboxes.confirm_action')
        }
        description={
          deleteContext?.type === 'disconnect'
            ? t('mailboxes.disconnect_description')
            : deleteContext?.type === 'bulkDelete'
              ? t('mailboxes.delete_messages_description', { count: deleteContext.count })
              : deleteContext?.type === 'bulkSenderDelete'
                ? t('mailboxes.delete_mailboxes_description', { count: deleteContext.count })
                : ''
        }
        confirmText={t('mailboxes.confirm')}
        confirmVariant="danger"
        isLoading={false}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteContext(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Mailboxes;
