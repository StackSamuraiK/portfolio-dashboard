import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StockData } from '../../page';

export default function GainInvestmentStackedBar({ data }: { data: StockData[] }) {
    const chartData = useMemo(() => {
        const sectorMap: Record<string, { investment: number, currentValue: number }> = {};

        data.forEach(item => {
            const val = item.PresentValue as string | number;
            const currentVal = val !== 'N/A' ? Number(val) : item.Investment;

            if (!sectorMap[item.Sector]) {
                sectorMap[item.Sector] = { investment: 0, currentValue: 0 };
            }
            sectorMap[item.Sector].investment += item.Investment;
            sectorMap[item.Sector].currentValue += currentVal;
        });

        return Object.entries(sectorMap).map(([name, vals]) => ({
            name,
            Investment: vals.investment,
            'Current Value': vals.currentValue
        }));
    }, [data]);

    return (
        <div className="bg-surface p-6 rounded-xl border border-surface-hover shadow-lg h-[400px] flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-white">Investment vs Current Value</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
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
                            formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                            contentStyle={{ backgroundColor: '#10002b', borderColor: '#3c096c', color: '#fff', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#a78bfa', fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="Investment" stackId="a" fill="#7b2cbf" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Current Value" stackId="a" fill="#e0aaff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
