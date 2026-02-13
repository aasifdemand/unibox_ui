import { Paperclip, Star } from "lucide-react";
import toast from "react-hot-toast";

const MessageListItem = ({
  message,
  isSelected,
  onSelect,
  onCheck,
  viewMode = "list",
  formatDate,
  getSender,
  getSubject,
  getPreview,
  getInitials,
}) => {
  const id = message.id || message.messageId;
  const isRead = message.isRead || !message.unread;
  const sender = getSender(message);
  const hasAttachments = message.hasAttachments || message.attachmentCount > 0;

  if (viewMode === "grid") {
    return (
      <div
        onClick={() => onSelect(message)}
        className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 cursor-pointer transition-all ${
          !isRead ? "border-l-4 border-l-blue-500" : ""
        } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="relative">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onCheck(id, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                className="absolute -left-2 -top-2 w-4 h-4 text-blue-600 rounded border-gray-300"
              />
              <div
                className={`w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg ${
                  !isRead ? "ring-2 ring-blue-300" : ""
                }`}
              >
                {getInitials(sender.name)}
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-400">{formatDate(message)}</span>
        </div>

        <div className="mb-3">
          <p
            className={`text-sm font-medium truncate ${!isRead ? "text-gray-900" : "text-gray-600"}`}
          >
            {sender.name}
          </p>
          <p
            className={`text-sm truncate mt-1 ${!isRead ? "font-medium text-gray-900" : "text-gray-600"}`}
          >
            {getSubject(message)}
          </p>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-4">
          {getPreview(message)}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {hasAttachments && <Paperclip className="w-3 h-3 text-gray-400" />}
            {message.isStarred && (
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            )}
            {!isRead && (
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.info("More actions coming soon");
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer transition border-b border-gray-100 last:border-0 ${
        !isRead ? "bg-blue-50/30" : ""
      } ${isSelected ? "bg-blue-100/30" : ""}`}
      onClick={() => onSelect(message)}
    >
      <div className="flex items-center mr-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onCheck(id, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-blue-600 rounded border-gray-300"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1.5">
          <div
            className={`w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold mr-3 shrink-0 ${
              !isRead ? "ring-2 ring-blue-300" : ""
            }`}
          >
            {getInitials(sender.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p
                className={`text-sm truncate flex items-center ${
                  !isRead ? "font-semibold text-gray-900" : "text-gray-700"
                }`}
              >
                {sender.name}
                {message.isStarred && (
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 ml-2" />
                )}
              </p>
              <div className="flex items-center space-x-2 ml-2 shrink-0">
                {hasAttachments && (
                  <Paperclip className="w-3 h-3 text-gray-400" />
                )}
                <p className="text-xs text-gray-500">{formatDate(message)}</p>
              </div>
            </div>
          </div>
        </div>

        <p
          className={`text-sm mb-1 ${
            !isRead ? "font-medium text-gray-900" : "text-gray-600"
          }`}
        >
          {getSubject(message)}
        </p>

        <p className="text-xs text-gray-500 line-clamp-2 pl-11">
          {getPreview(message)}
        </p>

        {message.labels?.length > 0 && (
          <div className="flex items-center gap-1 mt-2 pl-11">
            {message.labels.slice(0, 3).map((label) => (
              <span
                key={label}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {!isRead && (
        <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 shrink-0"></div>
      )}
    </div>
  );
};
export default MessageListItem;
