import React from 'react';
import { StockData } from '../page';
import { TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react';
import clsx from 'clsx';

export default function SummaryCards({ data }: { data: StockData[] }) {
    const totalInvestment = data.reduce((sum, item) => sum + item.Investment, 0);

    const totalCurrentValue = data.reduce((sum, item) => {
        const val = item.PresentValue as string | number;
        return val !== 'N/A' ? sum + Number(val) : sum + item.Investment;
    }, 0);

    const totalGainLoss = totalCurrentValue - totalInvestment;
    const gainPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;
    const isPositive = totalGainLoss >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface rounded-xl p-6 border border-surface-hover shadow-lg flex items-center gap-4">
                <div className="p-4 bg-primary/20 rounded-full text-primary">
                    <Briefcase size={28} />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-400">Total Investment</h3>
                    <p className="text-2xl font-bold text-white">₹{totalInvestment.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-surface-hover shadow-lg flex items-center gap-4">
                <div className="p-4 bg-accent/20 rounded-full text-accent">
                    <DollarSign size={28} />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-400">Current Value</h3>
                    <p className="text-2xl font-bold text-white">₹{totalCurrentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-surface-hover shadow-lg flex items-center gap-4">
                <div className={clsx("p-4 rounded-full", isPositive ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#ef4444]/20 text-[#ef4444]")}>
                    {isPositive ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Total Gain/Loss</h3>
                    <p className="text-2xl font-bold flex items-center gap-2" style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
                        {isPositive ? '+' : ''}₹{totalGainLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        <span className="text-sm px-2 py-0.5 rounded-full bg-background-app font-normal">
                            {isPositive ? '+' : ''}{gainPercentage.toFixed(2)}%
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
