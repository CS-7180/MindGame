"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface AdherenceChartProps {
    donePerf: number;
    skipPerf: number;
    doneMental: number;
    skipMental: number;
}

export function AdherenceChart({ donePerf, skipPerf, doneMental, skipMental }: AdherenceChartProps) {
    const data = [
        {
            category: "Performance (1-5)",
            "Routine Done": donePerf,
            "Routine Skipped": skipPerf,
        },
        {
            category: "Mental State (1-5)",
            "Routine Done": doneMental,
            "Routine Skipped": skipMental,
        }
    ];

    return (
        <div className="w-full h-[400px] border border-slate-800 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 pt-10">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                        dataKey="category"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 5]}
                        ticks={[0, 1, 2, 3, 4, 5]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#1e293b",
                            borderRadius: "8px",
                            color: "#f8fafc"
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ color: "#f8fafc" }}
                    />
                    {/* Primary color for Routine Done */}
                    <Bar dataKey="Routine Done" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    {/* Destructive or Muted color for Routine Skipped */}
                    <Bar dataKey="Routine Skipped" fill="#475569" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
