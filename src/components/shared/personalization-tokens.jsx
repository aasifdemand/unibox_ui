import React, { useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Hash,
  Tag,
  Building,
  Phone,
  MapPin,
  Globe,
  Gift,
  ChevronDown,
  Search,
  X,
} from "lucide-react";

const PersonalizationTokens = ({ onInsertToken, userFields = [], onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllTokens, setShowAllTokens] = useState(false);

  // Default system tokens
  const systemTokens = [
    {
      category: "Basic Info",
      tokens: [
        {
          token: "{{first_name}}",
          label: "First Name",
          icon: <User className="w-4 h-4" />,
          description: "Recipient's first name",
        },
        {
          token: "{{last_name}}",
          label: "Last Name",
          icon: <User className="w-4 h-4" />,
          description: "Recipient's last name",
        },
        {
          token: "{{full_name}}",
          label: "Full Name",
          icon: <User className="w-4 h-4" />,
          description: "Recipient's full name",
        },
        {
          token: "{{email}}",
          label: "Email Address",
          icon: <Mail className="w-4 h-4" />,
          description: "Recipient's email",
        },
        {
          token: "{{company}}",
          label: "Company",
          icon: <Building className="w-4 h-4" />,
          description: "Recipient's company",
        },
        {
          token: "{{phone}}",
          label: "Phone",
          icon: <Phone className="w-4 h-4" />,
          description: "Recipient's phone number",
        },
      ],
    },
    {
      category: "Location",
      tokens: [
        {
          token: "{{city}}",
          label: "City",
          icon: <MapPin className="w-4 h-4" />,
          description: "Recipient's city",
        },
        {
          token: "{{country}}",
          label: "Country",
          icon: <Globe className="w-4 h-4" />,
          description: "Recipient's country",
        },
        {
          token: "{{state}}",
          label: "State",
          icon: <MapPin className="w-4 h-4" />,
          description: "Recipient's state",
        },
      ],
    },
    {
      category: "System",
      tokens: [
        {
          token: "{{current_date}}",
          label: "Current Date",
          icon: <Calendar className="w-4 h-4" />,
          description: "Date when email is sent",
        },
        {
          token: "{{unsubscribe_link}}",
          label: "Unsubscribe Link",
          icon: <X className="w-4 h-4" />,
          description: "Link to unsubscribe",
        },
        {
          token: "{{web_version}}",
          label: "Web Version",
          icon: <Globe className="w-4 h-4" />,
          description: "Link to web version",
        },
      ],
    },
  ];

  // Custom user fields from uploaded lists
  const customTokens =
    userFields.length > 0
      ? [
        {
          category: "Custom Fields",
          tokens: userFields.map((field) => ({
            token: `{{${field.fieldName}}}`,
            label: field.displayName || field.fieldName,
            icon: <Tag className="w-4 h-4" />,
            description: `Custom field: ${field.fieldName}`,
            isCustom: true,
          })),
        },
      ]
      : [];

  const allTokens = [...systemTokens, ...customTokens];

  // Filter tokens based on search
  const filteredTokens = allTokens
    .map((category) => ({
      ...category,
      tokens: category.tokens.filter(
        (token) =>
          token.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.tokens.length > 0);

  const handleTokenClick = (token) => {
    onInsertToken(token);
  };

  return (
    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">
            Smart Variables
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllTokens(!showAllTokens)}
              className="px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-1.5"
            >
              {showAllTokens ? "Common Only" : "View All"}
              <ChevronDown
                className={`w-3 h-3 transition-transform ${showAllTokens ? "rotate-180" : ""}`}
              />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Tokens List */}
      <div className="max-h-80 overflow-y-auto p-4">
        {filteredTokens.map((category, catIndex) => (
          <div key={catIndex} className="mb-8 last:mb-0">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 pb-2 border-b border-slate-50">
              {category.category}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(showAllTokens
                ? category.tokens
                : category.tokens.slice(0, 4)
              ).map((token, tokenIndex) => (
                <button
                  key={tokenIndex}
                  onClick={() => handleTokenClick(token.token)}
                  className={`flex items-start p-4 text-left rounded-2xl border transition-all duration-300 group ${token.isCustom
                      ? "bg-purple-50/30 border-purple-100 hover:border-purple-300 hover:bg-purple-50"
                      : "bg-slate-50/50 border-slate-100 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 shrink-0 transition-transform group-hover:scale-110 ${token.isCustom ? "bg-purple-100/50" : "bg-blue-100/50"
                      }`}
                  >
                    <div
                      className={`${token.isCustom ? "text-purple-600" : "text-blue-600"}`}
                    >
                      {token.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-800 text-xs truncate">
                        {token.label}
                      </span>
                      <code className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-mono text-blue-600 font-bold">
                        {token.token}
                      </code>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                      {token.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredTokens.length === 0 && (
          <div className="text-center py-8">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              No tokens found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              System
            </span>
            <span className="flex items-center gap-2 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              Custom
            </span>
          </div>
          <div className="text-[9px] font-bold text-blue-600/60 uppercase tracking-widest italic">
            Click to inject variable
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationTokens;
