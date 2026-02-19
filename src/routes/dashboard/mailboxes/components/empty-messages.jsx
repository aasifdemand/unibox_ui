import { Inbox } from "lucide-react";

const EmptyMessages = ({
  searchQuery,
  filterUnread,
  filterStarred,
  filterAttachments,
  selectedFolder,
}) => {
  const getEmptyMessage = () => {
    if (searchQuery) return "Try a different search term";
    if (filterUnread) return "No unread messages";
    if (filterStarred) return "No starred messages";
    if (filterAttachments) return "No messages with attachments";
    if (selectedFolder) return `${selectedFolder.name} is empty`;
    return "Inbox is empty";
  };

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <Inbox className="w-12 h-12 text-gray-300 mb-4" />
      <p className="text-gray-500 font-medium">No messages found</p>
      <p className="text-sm text-gray-400 mt-1">{getEmptyMessage()}</p>
    </div>
  );
};

export default EmptyMessages;
