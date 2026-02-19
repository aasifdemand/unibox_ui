import React from "react";
import { Target, TrendingUp, Mail, Eye, Pointer, Reply } from "lucide-react";

const OverallPerformance = ({ aggregates }) => {
  // Default values if aggregates is undefined
  const data = aggregates || {
    totalSent: 0,
    totalOpens: 0,
    totalClicks: 0,
    totalReplied: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    avgReplyRate: 0,
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
      {/* Light background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl"></div>

      {/* Header Section */}
      <div className="relative mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Analytics Overview
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              Campaign Performance
            </h2>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {data.totalSent.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Emails Sent</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              <span className="text-xs text-gray-500">Opens</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {data.totalOpens.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">
              {data.totalSent > 0
                ? ((data.totalOpens / data.totalSent) * 100).toFixed(1)
                : 0}
              % rate
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Pointer className="w-5 h-5 text-amber-600" />
              <span className="text-xs text-gray-500">Clicks</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {data.totalClicks.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">
              {data.totalOpens > 0
                ? ((data.totalClicks / data.totalOpens) * 100).toFixed(1)
                : 0}
              % CTR
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Reply className="w-5 h-5 text-purple-600" />
              <span className="text-xs text-gray-500">Replies</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {data.totalReplied.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">
              {data.totalSent > 0
                ? ((data.totalReplied / data.totalSent) * 100).toFixed(1)
                : 0}
              % reply rate
            </p>
          </div>
        </div>

        {/* Progress Bars Section */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Engagement Metrics
          </h3>

          <div className="space-y-6">
            {/* Open Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Open Rate
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {data.avgOpenRate}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(data.avgOpenRate, 100)}%` }}
                />
              </div>
            </div>

            {/* Click Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Pointer className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Click Rate
                  </span>
                </div>
                <span className="text-lg font-bold text-amber-600">
                  {data.avgClickRate}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(data.avgClickRate, 100)}%` }}
                />
              </div>
            </div>

            {/* Reply Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Reply className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Reply Rate
                  </span>
                </div>
                <span className="text-lg font-bold text-emerald-600">
                  {data.avgReplyRate}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(data.avgReplyRate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Total Engagement Card */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Total Engagement Rate
                  </span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {data.totalSent > 0
                    ? (
                        ((data.totalOpens +
                          data.totalClicks +
                          data.totalReplied) /
                          data.totalSent) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallPerformance;
