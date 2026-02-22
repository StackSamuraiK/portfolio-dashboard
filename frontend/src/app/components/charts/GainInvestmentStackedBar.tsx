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
        <div className="bg-black p-6 rounded-xl border border-border shadow-lg h-[400px] flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-white">Investment vs Current Value</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
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
                            formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`}
                            contentStyle={{ backgroundColor: '#000000', borderColor: '#27272a', color: '#ffffff', borderRadius: '8px' }}
                            itemStyle={{ color: '#ffffff' }}
                            labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="Investment" stackId="a" fill="#52525b" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Current Value" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
