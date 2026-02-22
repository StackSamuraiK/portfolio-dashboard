"use client";

import React, { useEffect, useState } from 'react';
import PortfolioTable from './components/PortfolioTable';
import SummaryCards from './components/SummaryCards';
import AllocationPieChart from './components/charts/AllocationPieChart';
import SectorBarChart from './components/charts/SectorBarChart';
import GrowthLineChart from './components/charts/GrowthLineChart';
import GainInvestmentStackedBar from './components/charts/GainInvestmentStackedBar';
import { Card, CardContent } from "@/components/ui/card";

export type StockData = {
  Sector: string;
  Particulars: string;
  PurchasePrice: number;
  Qty: number;
  Investment: number;
  PortfolioPercent: string;
  Exchange: string;
  Ticker: string;
  GoogleFinanceTicker: string;
  CMP: string | number;
  PresentValue: string | number;
  GainLoss: string | number;
  PERatio: string;
  LatestEarnings: string;
};

import { initialMockData } from './mockData';

export default function Home() {
  const [data, setData] = useState<StockData[]>(initialMockData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/portfolio');
      if (!res.ok) throw new Error('API fetch error');

      const json = await res.json();
      setData(json.data || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error parsing the portfolio data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial load
    const interval = setInterval(fetchData, 15000); // Live fetch every 15s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-black text-white flex flex-col items-center">
      <header className="w-full max-w-[1400px] mb-8 flex justify-between items-end border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Portfolio Dashboard
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Real-time monitoring dashboard
          </p>
        </div>
        <div className="text-right">
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <p className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 flex items-center justify-end gap-2">
            {!loading && <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block"></span>}
            {loading ? 'Fetching Data From API...' : `Latest Data Fetched At • ${lastUpdated?.toLocaleTimeString()}`}
          </p>
        </div>
      </header>

      <main className="w-full max-w-[1400px]">

        {/* Cards */}
        {!loading && data.length > 0 && <SummaryCards data={data} />}

        {/* Charts */}
        {!loading && data.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AllocationPieChart data={data} />
              <SectorBarChart data={data} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <GrowthLineChart data={data} loading={loading} />
              <GainInvestmentStackedBar data={data} />
            </div>
          </>
        )}

        {/* Table */}
        <Card className="bg-black border border-border">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Holdings Table</h2>
            <PortfolioTable data={data} loading={loading && data.length === 0} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
