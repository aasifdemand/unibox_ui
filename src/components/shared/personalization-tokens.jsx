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

const PersonalizationTokens = ({ onInsertToken, userFields = [] }) => {
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
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">
            Personalization Tokens
          </h3>
          <button
            onClick={() => setShowAllTokens(!showAllTokens)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            {showAllTokens ? "Show Common" : "Show All"}
            <ChevronDown
              className={`w-4 h-4 ml-1 transition-transform ${showAllTokens ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tokens List */}
      <div className="max-h-80 overflow-y-auto p-4">
        {filteredTokens.map((category, catIndex) => (
          <div key={catIndex} className="mb-6 last:mb-0">
            <h4 className="text-sm font-medium text-gray-700 mb-3 pb-2 border-b">
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
                  className="flex items-start p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <div
                    className={`p-2 rounded mr-3 ${token.isCustom ? "bg-purple-100" : "bg-blue-100"}`}
                  >
                    <div
                      className={`${token.isCustom ? "text-purple-600" : "text-blue-600"}`}
                    >
                      {token.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {token.label}
                      </span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                        {token.token}
                      </code>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
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
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="inline-flex items-center mr-4">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              System Token
            </span>
            <span className="inline-flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
              Custom Field
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Click to insert token into email
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationTokens;
