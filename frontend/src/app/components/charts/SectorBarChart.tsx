import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { StockData } from '../../page';

export default function SectorBarChart({ data }: { data: StockData[] }) {
    const barData = useMemo(() => {
        const sectorMap: Record<string, { gainLoss: number }> = {};

        data.forEach(item => {
            const gainStr = item.GainLoss as string | number;
            const gain = gainStr !== 'N/A' ? Number(gainStr) : 0;

            if (!sectorMap[item.Sector]) {
                sectorMap[item.Sector] = { gainLoss: 0 };
            }
            sectorMap[item.Sector].gainLoss += gain;
        });

        return Object.entries(sectorMap).map(([name, vals]) => ({
            name,
            gainLoss: vals.gainLoss
        }));
    }, [data]);

    return (
        <div className="bg-surface p-6 rounded-xl border border-surface-hover shadow-lg h-[400px] flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-white">Sector Performance (Gain/Loss)</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3c096c" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#ffffff"
                            tick={{ fill: '#a78bfa', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#ffffff"
                            tick={{ fill: '#a78bfa', fontSize: 12 }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#3c096c', opacity: 0.4 }}
                            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Gain/Loss']}
                            contentStyle={{ backgroundColor: '#10002b', borderColor: '#3c096c', color: '#fff', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#a78bfa', fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Bar dataKey="gainLoss" radius={[4, 4, 0, 0]}>
                            {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.gainLoss >= 0 ? '#10b981' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
