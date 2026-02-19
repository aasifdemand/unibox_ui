import React from "react";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Clock } from "lucide-react";
import CustomTooltip from "./custom-tooltip";

const HourlyActivity = ({ data }) => {
  return (
    <div className="premium-card p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Hourly <span className="text-amber-500">Activity</span>
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Best times for engagement
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
      </div>

      <div className="h-64 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 0, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="8 8"
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="hour"
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
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.16} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="count"
              stroke="none"
              fillOpacity={1}
              fill="url(#colorCount)"
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#f59e0b" }}
              name="Volume"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
        <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
          <span className="font-black uppercase tracking-widest mr-2">
            Peak Times:
          </span>
          Engagement peaks between 09:00 - 11:00 UTC. Schedule your campaigns
          during this window for best results.
        </p>
      </div>
    </div>
  );
};

export default HourlyActivity;
