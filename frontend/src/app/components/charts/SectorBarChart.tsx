import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { StockData } from '../../page';

export default function SectorBarChart({ data }: { data: StockData[] }) {
    const barData = useMemo(() => {
        const sectorMap: Record<string, { gainLoss: number, investment: number }> = {};

        data.forEach(item => {
            const gainStr = item.GainLoss as string | number;
            const gain = gainStr !== 'N/A' ? Number(gainStr) : 0;
            const investment = Number(item.Investment) || 0;

            if (!sectorMap[item.Sector]) {
                sectorMap[item.Sector] = { gainLoss: 0, investment: 0 };
            }
            sectorMap[item.Sector].gainLoss += gain;
            sectorMap[item.Sector].investment += investment;
        });

        return Object.entries(sectorMap).map(([name, vals]) => ({
            name,
            gainLoss: vals.gainLoss,
            investment: vals.investment
        }));
    }, [data]);

    return (
        <div className="bg-black p-6 rounded-xl border border-border shadow-lg h-[400px] flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-white">Sector Performance (Gain/Loss)</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#ffffff"
                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#ffffff"
                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                            tickFormatter={(value) => `₹${(value / 100000).toFixed(2)} Lacs`}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#27272a', opacity: 0.4 }}
                            formatter={(value: any, name: any, props: any) => {
                                const gain = Number(value);
                                const investment = props.payload.investment;
                                let percentStr = '';
                                if (investment > 0) {
                                    const percent = (gain / investment) * 100;
                                    const sign = percent >= 0 ? '+' : '';
                                    percentStr = ` (${sign}${percent.toFixed(2)}%)`;
                                }
                                return [`₹${gain.toLocaleString('en-IN')}${percentStr}`, 'Gain/Loss'];
                            }}
                            contentStyle={{ backgroundColor: '#000000', borderColor: '#27272a', color: '#ffffff', borderRadius: '8px' }}
                            itemStyle={{ color: '#ffffff' }}
                            labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', marginBottom: '4px' }}
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
