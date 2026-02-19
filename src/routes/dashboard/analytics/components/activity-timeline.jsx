import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import CustomTooltip from "./custom-tooltip";

const ActivityTimeline = ({ data, hasValidData }) => {
  console.log("ActivityTimeline data:", data);
  console.log("hasValidData:", hasValidData);

  const chartData = Array.isArray(data) ? data : [];
  const hasData = chartData.length > 0 && hasValidData;

  return (
    <div className="premium-card p-8 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            Campaign <span className="text-blue-500">Activity</span>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Sent vs replies over time
          </p>
        </div>
        <div className="flex items-center gap-6 p-2 bg-slate-50 rounded-2xl border border-slate-100/50">
          <div className="flex items-center gap-2 px-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
              Sent
            </span>
          </div>
          <div className="w-px h-4 bg-slate-200"></div>
          <div className="flex items-center gap-2 px-3">
            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(147,51,234,0.4)]"></div>
            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
              Replies
            </span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient
                  id="repliesGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="8 8"
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
              />
              <Tooltip
                cursor={{
                  stroke: "#94a3b8",
                  strokeWidth: 1,
                  strokeDasharray: "5 5",
                }}
                content={<CustomTooltip />}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              />
              <Area
                type="monotone"
                dataKey="sent"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#sentGradient)"
                name="Sent"
              />
              <Area
                type="monotone"
                dataKey="replies"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#repliesGradient)"
                name="Replies"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <AreaChart className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
              No activity data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
