import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Tag,
  Building,
  Phone,
  MapPin,
  Globe,
  ChevronDown,
  X,
} from 'lucide-react';

const PersonalizationTokens = ({ onInsertToken, userFields = [], onClose, externalQuery = '', inlineMode = false }) => {
  const [showAllTokens, setShowAllTokens] = useState(false);
  const searchQuery = externalQuery;

  // Default system tokens
  const systemTokens = [
    {
      category: 'Basic Info',
      tokens: [
        {
          token: '{{first_name}}',
          label: 'First Name',
          icon: <User className="w-4 h-4" />,
          description: "Recipient's first name",
        },
        {
          token: '{{last_name}}',
          label: 'Last Name',
          icon: <User className="w-4 h-4" />,
          description: "Recipient's last name",
        },
        {
          token: '{{full_name}}',
          label: 'Full Name',
          icon: <User className="w-4 h-4" />,
          description: "Recipient's full name",
        },
        {
          token: '{{email}}',
          label: 'Email Address',
          icon: <Mail className="w-4 h-4" />,
          description: "Recipient's email",
        },
        {
          token: '{{company}}',
          label: 'Company',
          icon: <Building className="w-4 h-4" />,
          description: "Recipient's company",
        },
        {
          token: '{{phone}}',
          label: 'Phone',
          icon: <Phone className="w-4 h-4" />,
          description: "Recipient's phone number",
        },
      ],
    },
    {
      category: 'Location',
      tokens: [
        {
          token: '{{city}}',
          label: 'City',
          icon: <MapPin className="w-4 h-4" />,
          description: "Recipient's city",
        },
        {
          token: '{{country}}',
          label: 'Country',
          icon: <Globe className="w-4 h-4" />,
          description: "Recipient's country",
        },
        {
          token: '{{state}}',
          label: 'State',
          icon: <MapPin className="w-4 h-4" />,
          description: "Recipient's state",
        },
      ],
    },
    {
      category: 'System',
      tokens: [
        {
          token: '{{current_date}}',
          label: 'Current Date',
          icon: <Calendar className="w-4 h-4" />,
          description: 'Date when email is sent',
        },
        {
          token: '{{unsubscribe_link}}',
          label: 'Unsubscribe Link',
          icon: <X className="w-4 h-4" />,
          description: 'Link to unsubscribe',
        },
        {
          token: '{{web_version}}',
          label: 'Web Version',
          icon: <Globe className="w-4 h-4" />,
          description: 'Link to web version',
        },
      ],
    },
  ];

  // Custom user fields from uploaded lists
  const customTokens =
    userFields.length > 0
      ? [
        {
          category: 'Custom Fields',
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
    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
      {/* Tokens List */}
      <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
        {filteredTokens.map((category, catIndex) => (
          <div key={catIndex} className="mb-1 last:mb-0">
            <div className="flex flex-col gap-1">
              {(showAllTokens ? category.tokens : category.tokens.slice(0, 4)).map(
                (token, tokenIndex) => (
                  <button
                    key={tokenIndex}
                    onClick={() => handleTokenClick(token)}
                    className={`flex items-center p-2 ltr:text-left ltr:text-right rtl:text-left rounded-xl border transition-all duration-200 group ${token.isCustom
                      ? 'bg-purple-50/10 border-purple-100/50 hover:border-purple-300 hover:bg-purple-50'
                      : 'bg-slate-50/30 border-slate-100/50 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ltr:mr-2.5 rtl:ml-2.5 shrink-0 transition-transform group-hover:scale-110 ${token.isCustom ? 'bg-purple-100/50' : 'bg-blue-100/50'
                        }`}
                    >
                      <div className={`${token.isCustom ? 'text-purple-600' : 'text-blue-600'}`}>
                        {React.cloneElement(token.icon, { className: 'w-3 h-3' })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium text-slate-700 text-[10px] truncate">
                          {token.label}
                        </span>
                      </div>
                      <code className="text-[7px] bg-white/50 border border-slate-100/80 px-1.5 py-0.5 rounded-md font-mono text-blue-500/80 font-medium ml-2 shrink-0">
                        {token.token.replace(/[{}]/g, '')}
                      </code>
                    </div>
                  </button>
                ),
              )}
            </div>
          </div>
        ))}

        {filteredTokens.length === 0 && (
          <div className="text-center py-4">
            <p className="text-[10px] text-gray-500 font-medium">No variables found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizationTokens;
