import { isToday } from "date-fns";
import {
  Calendar,
  Folder,
  Mail,
  MailQuestion,
  Paperclip,
  Send,
  Star,
} from "lucide-react";
import { useMemo } from "react";

const StatsCards = ({ mailbox, messages, folders }) => {
  const stats = useMemo(() => {
    const totalMessages = messages?.length || 0;
    const unreadCount =
      messages?.filter((m) => !m.isRead && m.unread !== false).length || 0;
    const starredCount =
      messages?.filter((m) => m.isStarred || m.labelIds?.includes("STARRED"))
        .length || 0;
    const attachmentCount =
      messages?.filter((m) => m.hasAttachments || m.attachmentCount > 0)
        .length || 0;

    const todayMessages =
      messages?.filter((m) => {
        const date = new Date(m.receivedDateTime || m.internalDate || m.date);
        return isToday(date);
      }).length || 0;

    const folderCount = folders?.length || 0;
    const dailySent = mailbox?.stats?.dailySent || 0;

    return {
      totalMessages,
      unreadCount,
      starredCount,
      attachmentCount,
      todayMessages,
      folderCount,
      dailySent,
      readRate: totalMessages
        ? Math.round(((totalMessages - unreadCount) / totalMessages) * 100)
        : 0,
    };
  }, [messages, folders, mailbox]);

  const cards = [
    {
      title: "Total Messages",
      value: stats.totalMessages,
      icon: Mail,
      color: "blue",
      bg: "from-blue-500 to-blue-600",
      change: "+12%",
    },
    {
      title: "Unread",
      value: stats.unreadCount,
      icon: MailQuestion,
      color: "yellow",
      bg: "from-yellow-500 to-yellow-600",
      change: `${stats.readRate}% read`,
    },
    {
      title: "Starred",
      value: stats.starredCount,
      icon: Star,
      color: "purple",
      bg: "from-purple-500 to-purple-600",
    },
    {
      title: "Attachments",
      value: stats.attachmentCount,
      icon: Paperclip,
      color: "green",
      bg: "from-green-500 to-green-600",
    },
    {
      title: "Today",
      value: stats.todayMessages,
      icon: Calendar,
      color: "red",
      bg: "from-red-500 to-red-600",
    },
    {
      title: "Folders",
      value: stats.folderCount,
      icon: Folder,
      color: "indigo",
      bg: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Daily Sent",
      value: stats.dailySent,
      icon: Send,
      color: "pink",
      bg: "from-pink-500 to-pink-600",
      suffix: "/day",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {cards?.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg bg-linear-to-br ${card.bg} flex items-center justify-center group-hover:scale-110 transition`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-400">{card.change || ""}</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {card.value}
              {card.suffix && (
                <span className="text-sm text-gray-500 ml-1">
                  {card.suffix}
                </span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
