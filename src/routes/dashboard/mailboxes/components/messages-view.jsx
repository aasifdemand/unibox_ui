import { useTranslation } from 'react-i18next';
import { forwardRef } from 'react';
import { ChevronRight, Paperclip, Search, Star, X } from 'lucide-react';
import Pagination from './pagination';
import MessageListItem from './messagelist-item';
import EmptyMessages from './empty-messages';
import FolderTree from './folder-tree';
import MessageDetailView from './messagedetails-view';
import ComposeView from './compose-view';
import { getDisplayId, getMessageId } from '../utils/getmessage-id';
import { isFolderType } from '../utils/folder-utils';

const MessagesView = forwardRef(({
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
}, ref) => {
  const { t } = useTranslation();
  return (
    <div className="px-4 md:px-8 pb-4 h-[calc(100vh-160px)] min-h-0 flex flex-col">
      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 flex-1 flex flex-col overflow-hidden">
        {/* Search and Filters - Integrated in Card Top - Hidden in Detail View */}
        {view !== 'message' && (
          <div className="px-6 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
              <div className="flex-1 relative group">
                <Search className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-all duration-300" />
                <input
                  type="text"
                  placeholder={t('mailboxes.messages_search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full ltr:pl-11 rtl:pr-11 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all outline-none shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={onSearchClear}
                    className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <div className="relative shrink-0">
                  <select
                    value={dateRange}
                    onChange={(e) => onDateRangeChange(e.target.value)}
                    className="appearance-none px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-xs focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all outline-none cursor-pointer"
                  >
                    <option value="all">{t('mailboxes.temporal_all')}</option>
                    <option value="today">{t('mailboxes.temporal_today')}</option>
                    <option value="week">{t('mailboxes.temporal_week')}</option>
                    <option value="month">{t('mailboxes.temporal_month')}</option>
                  </select>
                  <ChevronRight className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 rotate-90 pointer-events-none" />
                </div>

                <button
                  onClick={onFilterStarred}
                  className={`px-5 py-3 rounded-2xl flex items-center text-[10px] font-black uppercase tracking-widest transition-all border shadow-xs active:scale-95 ${filterStarred
                    ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ltr:mr-2 rtl:ml-2 ${filterStarred ? 'fill-white' : 'text-slate-400'}`}
                  />
                  {t('mailboxes.starred_filter')}
                </button>

                <button
                  onClick={onFilterAttachments}
                  className={`px-5 py-3 rounded-2xl flex items-center text-[10px] font-black uppercase tracking-widest transition-all border shadow-xs active:scale-95 ${filterAttachments
                    ? 'bg-purple-600 text-white border-purple-700 shadow-lg shadow-purple-500/20'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Paperclip
                    className={`w-3.5 h-3.5 ltr:mr-2 rtl:ml-2 ${filterAttachments ? 'text-white' : 'text-slate-400'}`}
                  />
                  {t('mailboxes.files_filter')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-slate-50/20">
          {/* Folders Sidebar - Always Visible */}
          <div className="w-72 border-r border-slate-100 overflow-y-auto shrink-0 hidden lg:block bg-slate-50/10">
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
                  <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white/50 backdrop-blur-sm animate-pulse">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{t('mailboxes.loading_conversation')}</h3>
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
                  <div className="flex flex-col items-center justify-center flex-1 px-6 bg-white/20 backdrop-blur-sm">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-blue-500/50"></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 mt-8">
                      <span className="text-sm font-black text-slate-800 uppercase tracking-[0.3em] animate-pulse">
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
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/40 backdrop-blur-[2px]">
                        <div className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-[2.5rem] shadow-2xl border border-white">
                          <div className="relative">
                            <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
                            <div className="absolute top-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div
                      className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-2 ${viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0'
                        : ''
                        }`}
                    >
                      {filteredMessages.map((message) => {
                        const isSentFolder = isFolderType(selectedFolder, 'sent') || message.labelIds?.includes('SENT');

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
                          onPageChange={(page) => {
                            if (page > pagination.currentPage) onNextPage();
                            else if (page < pagination.currentPage) onPrevPage();
                          }}
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
});

MessagesView.displayName = 'MessagesView';

export default MessagesView;
