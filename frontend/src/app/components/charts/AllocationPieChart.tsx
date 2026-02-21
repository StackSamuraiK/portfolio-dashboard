import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StockData } from '../../page';

const COLORS = ["#3c096c", "#5a189a", "#7b2cbf", "#9d4edd", "#c77dff", "#e0aaff", "#ffffff", "#8b5cf6"];

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

    return (
        <div className="bg-surface p-6 rounded-xl border border-surface-hover shadow-lg h-[400px] flex flex-col">
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
                            formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                            contentStyle={{ backgroundColor: '#10002b', borderColor: '#3c096c', color: '#fff', borderRadius: '8px' }}
                            itemStyle={{ color: '#e0aaff' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
