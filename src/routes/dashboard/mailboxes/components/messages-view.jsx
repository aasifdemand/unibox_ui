import { useTranslation } from 'react-i18next';
import { forwardRef } from 'react';
import { ChevronRight, Paperclip, Search, Star, Plus, RefreshCw, ShieldCheck, X } from 'lucide-react';
import Pagination from './pagination';
import MessageListItem from './messagelist-item';
import EmptyMessages from './empty-messages';
import FolderTree from './folder-tree';
import MessageDetailView from './messagedetails-view';
import ComposeView from './compose-view';
import { getDisplayId, getMessageId } from '../utils/getmessage-id';
import { isFolderType } from '../utils/folder-utils';

const MessagesView = forwardRef(
  (
    {
      selectedMailbox,
      selectedFolder,
      folders,
      filteredMessages,
      isLoadingMessages,
      viewMode,
      selectedMessages,
      onSelectFolder,
      folderLoading,
      showAllFolders,
      onToggleShowAllFolders,
      onSelectMessage,
      onCheckMessage,
      formatMessageDate,
      getSender,
      getSubject,
      getPreview,
      getInitials,
      searchQuery,
      onSearchChange,
      onSearchClear,
      dateRange,
      onDateRangeChange,
      filterStarred,
      onFilterStarred,
      filterAttachments,
      onFilterAttachments,
      filterUnread,
      pagination,
      onNextPage,
      onPrevPage,
      onPageChange,
      startMessageCount,
      endMessageCount,
      totalMessages,
      // Message Detail Props
      view = 'messages',
      currentMessage,
      isMessageLoading,
      onBack,
      onDelete,
      onReply,
      onForward,
      onMarkRead,
      onMarkUnread,
      onStar,
      onPrint,
      onDownload,
      // Compose Props
      onCloseCompose,
      onSendCompose,
      onSaveDraft,
      replyToMessage,
      forwardMessage,
      showPreview,
      onTogglePreview,
      // Action Props
      onCompose,
      onSync,
      isSyncing,
      onFilterUnread,
      filterUnreadActive,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    return (
      <div className="px-1 md:px-2 pb-0 h-[calc(100vh-80px)] min-h-0 flex flex-col">
        <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
          {/* Search and Filters - Integrated in Card Top - Hidden in Detail View */}
          {view !== 'message' && (
            <div className="py-3 border-b border-slate-100 bg-white select-none">
              <div className="flex flex-col xl:flex-row xl:items-center gap-4 w-full">
                {/* 1. Context & Internal Navigation */}
                <div className="w-64 border-r border-slate-100 flex items-center gap-3 shrink-0 px-4">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-purple-600 hover:border-purple-200 transition-all active:scale-90"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                  )}
                  <div className="flex flex-col min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight truncate leading-none mb-1">
                      {selectedFolder?.name || 'Inbox'}
                    </h2>
                    <span className="text-[10px] font-bold text-slate-400 truncate">
                      {selectedMailbox?.email}
                    </span>
                  </div>
                </div>



                {/* 2. Global Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onCompose}
                    className="h-9 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 text-xs font-bold shadow-sm shadow-purple-500/20 transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Compose</span>
                  </button>

                  <button
                    onClick={onSync}
                    disabled={isSyncing}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white transition-all active:scale-90 group ${
                      isSyncing ? 'bg-slate-50' : 'hover:border-purple-200'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-500' : 'text-slate-400 group-hover:text-purple-600'}`} />
                  </button>

                  <button
                    onClick={onFilterUnread}
                    className={`h-9 px-3 rounded-lg flex items-center gap-2 text-xs font-bold border transition-all ${
                      filterUnreadActive
                        ? 'bg-purple-50 border-purple-200 text-purple-600'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                    title="Toggle Unread Focus"
                  >
                    <Star className={`w-3.5 h-3.5 ${filterUnreadActive ? 'fill-purple-600' : ''}`} />
                    <span className="hidden lg:inline">{filterUnreadActive ? 'Unread Focus' : 'Unread'}</span>
                  </button>
                  <button
                    onClick={onFilterStarred}
                    className={`h-9 px-3 rounded-lg flex items-center gap-2 text-xs font-bold border transition-all ${
                      filterStarred
                        ? 'bg-amber-500 border-amber-600 text-white shadow-sm shadow-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                    title="Starred"
                  >
                    <Star className={`w-3.5 h-3.5 ${filterStarred ? 'fill-white' : ''}`} />
                    <span className="hidden lg:inline">Starred</span>
                  </button>
                </div>

                {/* 3. Search Bar */}
                <div className="flex-1 relative group min-w-[200px]">
                  <Search className="absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="text"
                    placeholder={t('mailboxes.messages_search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full ltr:pl-10 rtl:pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500/40 transition-all outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={onSearchClear}
                      className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-slate-600 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* 4. Filters */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative shrink-0">
                    <select
                      value={dateRange}
                      onChange={(e) => onDateRangeChange(e.target.value)}
                      className="appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 pr-8 focus:border-purple-500/40 outline-none cursor-pointer"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                    </select>
                    <ChevronRight className="absolute ltr:right-2.5 rtl:left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 rotate-90 pointer-events-none" />
                  </div>

                  <button
                    onClick={onFilterAttachments}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                      filterAttachments
                        ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-400 hover:text-purple-600'
                    }`}
                    title="Files"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>

                  <button
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-purple-50/30 text-purple-600 hover:bg-purple-50 transition-all active:scale-95 shadow-xs"
                    title="Connection Secure"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex min-h-0 overflow-hidden bg-slate-50/20">
            {/* Folders Sidebar - Always Visible */}
            <div className="w-64 border-r border-slate-200/60 overflow-y-auto shrink-0 hidden lg:block bg-white shadow-sm">
              <FolderTree
                folders={folders}
                selectedFolder={selectedFolder}
                onSelectFolder={onSelectFolder}
                loading={folderLoading}
                showAll={showAllFolders}
                onToggleShowAll={onToggleShowAllFolders}
                type={selectedMailbox.type}
              />
            </div>

            {/* Right Pane: Messages List OR Message Detail */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
              {view === 'message' ? (
                <div className="flex-1 overflow-y-auto relative flex flex-col">
                  {currentMessage && !isMessageLoading ? (
                    <MessageDetailView
                      message={currentMessage}
                      mailbox={selectedMailbox}
                      onBack={onBack}
                      onDelete={onDelete}
                      onReply={onReply}
                      onForward={onForward}
                      onMarkRead={onMarkRead}
                      onMarkUnread={onMarkUnread}
                      onStar={onStar}
                      onPrint={onPrint}
                      onDownload={onDownload}
                      isIntegrated={true}
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white/50  animate-pulse">
                      <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {t('mailboxes.loading_conversation')}
                      </h3>
                      <p className="text-sm text-slate-500 mt-2 font-medium">
                        {t('mailboxes.fetching_content')}
                      </p>
                    </div>
                  )}
                </div>
              ) : view === 'compose' ? (
                <div className="flex-1 overflow-y-auto relative flex flex-col">
                  <ComposeView
                    ref={ref}
                    selectedMailbox={selectedMailbox}
                    onClose={onCloseCompose}
                    onSend={onSendCompose}
                    onSaveDraft={onSaveDraft}
                    replyToMessage={replyToMessage}
                    forwardMessage={forwardMessage}
                    isIntegrated={true}
                    showPreview={showPreview}
                    onTogglePreview={onTogglePreview}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                  {isLoadingMessages && filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 px-6 bg-white/20 ">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse shadow-purple-500/50"></div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 mt-8">
                        <span className="text-xs font-semibold text-slate-800 animate-pulse">
                          {t('mailboxes.indexing_messages')}
                        </span>
                      </div>
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <EmptyMessages
                      searchQuery={searchQuery}
                      filterUnread={filterUnread}
                      filterStarred={filterStarred}
                      filterAttachments={filterAttachments}
                      selectedFolder={selectedFolder}
                    />
                  ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {isLoadingMessages && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/40 -[2px]">
                          <div className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-2xl shadow-sm border border-white">
                            <div className="relative">
                              <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
                              <div className="absolute top-0 w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div
                        className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-2 ${
                          viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0'
                            : ''
                        }`}
                      >
                        {filteredMessages.map((message) => {
                          const isSentFolder =
                            isFolderType(selectedFolder, 'sent') ||
                            message.labelIds?.includes('SENT');

                          return (
                            <MessageListItem
                              key={getDisplayId(message, selectedMailbox?.type)}
                              message={message}
                              isSelected={selectedMessages.includes(
                                getMessageId(message, selectedMailbox?.type),
                              )}
                              onSelect={onSelectMessage}
                              onCheck={onCheckMessage}
                              viewMode={viewMode}
                              formatDate={formatMessageDate}
                              getSender={getSender}
                              getSubject={getSubject}
                              getPreview={getPreview}
                              getInitials={getInitials}
                              mailboxType={selectedMailbox?.type}
                              isSent={isSentFolder}
                            />
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {(totalMessages > 0 || (isLoadingMessages && pagination.currentPage > 1)) && (
                        <div className="py-2 border-t border-slate-100 bg-white/50 px-6 shrink-0">
                          <Pagination
                            currentPage={pagination.currentPage}
                            hasNextPage={pagination.hasNextPage}
                            hasPreviousPage={pagination.hasPreviousPage}
                            isLoadingMessages={isLoadingMessages}
                            onNextPage={onNextPage}
                            onPrevPage={onPrevPage}
                            onPageChange={onPageChange}
                            startMessageCount={startMessageCount}
                            endMessageCount={endMessageCount}
                            totalMessages={totalMessages}
                            itemsPerPage={10}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

MessagesView.displayName = 'MessagesView';

export default MessagesView;
