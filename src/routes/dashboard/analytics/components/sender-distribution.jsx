import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import CustomTooltip from "./custom-tooltip";

const SenderDistribution = ({ data, COLORS }) => {
  const totalEmails = data.reduce((sum, s) => sum + s.sent, 0);
  console.log("data: ", data);

  return (
    <div className="premium-card p-8 h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Sender <span className="text-indigo-500">Distribution</span>
        </h3>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          Breakdown by sender type
        </p>
      </div>

      {data.length > 0 ? (
        <div className="flex-1 flex flex-col">
          {/* Enhanced Pie Chart */}
          <div className="h-48 relative mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.type === "gmail"
                          ? COLORS.gmail
                          : entry.type === "outlook"
                            ? COLORS.outlook
                            : COLORS.smtp
                      }
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Total
              </span>
              <span className="text-xl font-black text-slate-900 leading-none mt-1">
                {totalEmails > 1000
                  ? `${(totalEmails / 1000).toFixed(1)}k`
                  : totalEmails}
              </span>
            </div>
          </div>

          {/* Premium Legend */}
          <div className="space-y-5 flex-1">
            {data.map((item) => (
              <div key={item.type} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{
                        backgroundColor:
                          item.type === "gmail"
                            ? COLORS.gmail
                            : item.type === "outlook"
                              ? COLORS.outlook
                              : COLORS.smtp,
                      }}
                    />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight group-hover:text-slate-900 transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-slate-900 tabular-nums">
                    {item.percentage}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-px">
                  <div
                    className="h-full rounded-full transition-all duration-1000 group-hover:opacity-80"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor:
                        item.type === "gmail"
                          ? COLORS.gmail
                          : item.type === "outlook"
                            ? COLORS.outlook
                            : COLORS.smtp,
                    }}
                  />
                </div>

                <div className="flex justify-between mt-1.5 px-0.5">
                  <span className="text-[10px] font-bold text-slate-400">
                    {item.count} Active
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {item.sent.toLocaleString()} Sent
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
            <PieChart className="w-8 h-8 opacity-20" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
            Loading distribution data...
          </p>
        </div>
      )}
    </div>
  );
};

export default SenderDistribution;
