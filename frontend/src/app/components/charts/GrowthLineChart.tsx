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
            if (newHistory.length > 20) return newHistory.slice(newHistory.length - 20); //keeping last 20 data points for showing
            return newHistory;
        });

    }, [data, loading]); // triggers whe data change

    const displayData = history;

    const minVal = displayData.length > 0 ? Math.min(...displayData.map(d => d.value)) : 0;
    const maxVal = displayData.length > 0 ? Math.max(...displayData.map(d => d.value)) : 0;

    const yAxisDomain = [
        Math.floor(minVal * 0.99),
        Math.ceil(maxVal * 1.01)
    ];
    return (
        <div className="bg-black p-6 rounded-xl border border-border shadow-lg h-[400px] flex flex-col">
            <h3 className="text-lg font-semibold mb-1 text-white flex justify-between items-center">
                Portfolio Growth
                <span className="bg-[#10b981]/10 text-[#10b981] text-xs px-2 py-1 rounded-full border border-[#10b981]/30">Live</span>
            </h3>
            <p className="text-xs text-zinc-500 mb-4">Tracking total current value over polling cycles</p>

            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#ffffff"
                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                        />
                        <YAxis
                            domain={yAxisDomain}
                            stroke="#ffffff"
                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                            tickFormatter={(value) => `₹${(value / 100000).toFixed(2)} Lacs`}
                            axisLine={false}
                            tickLine={false}
                            width={80}
                            tickMargin={10}
                        />
                        <Tooltip
                            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 'Portfolio Value']}
                            contentStyle={{ backgroundColor: '#000000', borderColor: '#27272a', color: '#ffffff', borderRadius: '8px' }}
                            itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
