import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StockData } from '../../page';

const COLORS = ["#ffffff", "#d4d4d8", "#a1a1aa", "#71717a", "#52525b", "#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function AllocationPieChart({ data }: { data: StockData[] }) {
    const pieData = useMemo(() => {
        const sectorMap: Record<string, number> = {};

        data.forEach(item => {
            const val = item.PresentValue as string | number;
            const valueToAdd = val !== 'N/A' ? Number(val) : item.Investment; //fallback
            if (sectorMap[item.Sector]) {
                sectorMap[item.Sector] += valueToAdd;
            } else {
                sectorMap[item.Sector] = valueToAdd;
            }
        });

        return Object.entries(sectorMap).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value);

    }, [data]);

    const totalValue = useMemo(() => pieData.reduce((acc, curr) => acc + curr.value, 0), [pieData]);

    return (
        <div className="bg-black p-6 rounded-xl border border-border shadow-lg h-[400px] flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-white">Allocation by Sector</h3>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any, name: any) => {
                                const numVal = Number(value);
                                const percent = totalValue > 0 ? ((numVal / totalValue) * 100).toFixed(2) : 0;
                                return [`₹${numVal.toLocaleString('en-IN')}`, `${name} (${percent}%)`];
                            }}
                            contentStyle={{ backgroundColor: '#000000', borderColor: '#27272a', color: '#ffffff', borderRadius: '8px' }}
                            itemStyle={{ color: '#ffffff' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
