import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StockData } from '../../page';

type HistoryPoint = {
    time: string;
    value: number;
};

export default function GrowthLineChart({ data, loading }: { data: StockData[], loading: boolean }) {
    const [history, setHistory] = useState<HistoryPoint[]>([]);

    useEffect(() => {
        if (!data || data.length === 0 || loading) return;

        const totalCurrentValue = data.reduce((sum, item) => {
            const val = item.PresentValue as string | number;
            return val !== 'N/A' ? sum + Number(val) : sum + item.Investment;
        }, 0);

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        setHistory(prev => {
            const newHistory = [...prev, { time: timeStr, value: totalCurrentValue }];
            if (newHistory.length > 10) return newHistory.slice(newHistory.length - 10); //keeping last 10 data points for showing
            return newHistory;
        });

    }, [data, loading]); // triggers whe data change

    const displayData = history.length <= 1 && history.length > 0
        ? [
            { time: 'T-1m', value: history[0].value * 0.99 },
            { time: 'T-30s', value: history[0].value * 0.995 },
            ...history
        ]
        : history;


    return (
        <div className="bg-surface p-6 rounded-xl border border-surface-hover shadow-lg h-[400px] flex flex-col">
            <h3 className="text-lg font-semibold mb-1 text-white flex justify-between items-center">
                Portfolio Growth
                <span className="bg-[#10b981]/20 text-[#10b981] text-xs px-2 py-1 rounded-full animate-pulse border border-[#10b981]/50">Live</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">Tracking total current value over polling cycles</p>

            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#c77dff" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#c77dff" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3c096c" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#ffffff"
                            tick={{ fill: '#a78bfa', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            stroke="#ffffff"
                            tick={{ fill: '#a78bfa', fontSize: 12 }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            formatter={(value: any) => [`₹${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Portfolio Value']}
                            contentStyle={{ backgroundColor: '#10002b', borderColor: '#3c096c', color: '#fff', borderRadius: '8px' }}
                            itemStyle={{ color: '#e0aaff', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#c77dff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
