"use client";

import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    getGroupedRowModel,
    ColumnDef,
    flexRender,
    ExpandedState,
} from '@tanstack/react-table';
import { StockData } from '../page';
import clsx from 'clsx';
import { ChevronRight, ChevronDown, Activity } from 'lucide-react';

export default function PortfolioTable({ data, loading }: { data: StockData[], loading: boolean }) {
    const columns = useMemo<ColumnDef<StockData>[]>(
        () => [
            {
                header: 'Sector',
                accessorKey: 'Sector',
                cell: info => info.getValue(),
            },
            {
                header: 'Stock Name',
                accessorKey: 'Particulars',
            },
            {
                header: 'Qty',
                accessorKey: 'Qty',
                aggregationFn: 'sum',
                aggregatedCell: () => null,
            },
            {
                header: 'Avg Price',
                accessorKey: 'PurchasePrice',
                cell: info => `₹${Number(info.getValue()).toLocaleString('en-IN')}`,
                aggregationFn: 'mean',
                aggregatedCell: () => null,
            },
            {
                header: 'Investment',
                accessorKey: 'Investment',
                cell: info => `₹${Number(info.getValue()).toLocaleString('en-IN')}`,
                aggregationFn: 'sum',
                aggregatedCell: ({ getValue }) => <span className="font-bold text-white">₹{Number(getValue()).toLocaleString('en-IN')}</span>,
            },
            {
                header: 'CMP',
                accessorKey: 'CMP',
                cell: info => {
                    const val = info.getValue() as number | string;
                    return val === 'N/A' ? (
                        <span className="flex items-center gap-1 text-gray-500 animate-pulse"><Activity size={14} /> Fetching...</span>
                    ) : `₹${Number(val).toLocaleString('en-IN')}`;
                },
                aggregationFn: 'mean',
                aggregatedCell: () => null,
            },
            {
                header: 'Present Value',
                accessorKey: 'PresentValue',
                cell: info => {
                    const val = info.getValue() as number | string;
                    return val === 'N/A' ? '-' : `₹${Number(val).toLocaleString('en-IN')}`;
                },
                aggregationFn: (columnId, leafRows) => {
                    return leafRows.reduce((sum, row) => {
                        const val = row.getValue(columnId) as string | number;
                        return val !== 'N/A' ? sum + Number(val) : sum;
                    }, 0);
                },
                aggregatedCell: ({ getValue }) => {
                    const val = getValue() as number;
                    return val > 0 ? <span className="font-bold text-white">₹{val.toLocaleString('en-IN')}</span> : '-';
                }
            },
            {
                header: 'Gain / Loss',
                accessorKey: 'GainLoss',
                cell: info => {
                    const val = info.getValue() as number | string;
                    if (val === 'N/A') return '-';
                    const numVal = Number(val);
                    const investment = Number(info.row.original.Investment) || 0;
                    const percent = investment > 0 ? (numVal / investment) * 100 : 0;
                    return (
                        <span className="font-medium" style={{ color: numVal >= 0 ? '#10b981' : '#ef4444' }}>
                            {numVal >= 0 ? '+' : ''}₹{numVal.toLocaleString('en-IN')} <span className="text-xs ml-1">({numVal >= 0 ? '+' : ''}{percent.toFixed(2)}%)</span>
                        </span>
                    );
                },
                aggregationFn: (columnId, leafRows) => {
                    return leafRows.reduce((sum, row) => {
                        const val = row.getValue(columnId) as string | number;
                        return val !== 'N/A' ? sum + Number(val) : sum;
                    }, 0);
                },
                aggregatedCell: ({ getValue, row }) => {
                    const numVal = getValue() as number;
                    if (!numVal) return '-';
                    const investment = Number(row.getValue('Investment')) || 0;
                    const percent = investment > 0 ? (numVal / investment) * 100 : 0;
                    return (
                        <span className="font-bold" style={{ color: numVal >= 0 ? '#10b981' : '#ef4444' }}>
                            {numVal >= 0 ? '+' : ''}₹{numVal.toLocaleString('en-IN')} <span className="text-xs ml-1">({numVal >= 0 ? '+' : ''}{percent.toFixed(2)}%)</span>
                        </span>
                    );
                }
            },
            {
                header: 'P/E (TTM)',
                accessorKey: 'PERatio',
                cell: info => info.getValue() || '-',
                aggregationFn: 'mean',
                aggregatedCell: () => null,
            },
            {
                header: 'Latest Earnings',
                accessorKey: 'LatestEarnings',
                cell: info => info.getValue() || '-',
                aggregationFn: 'mean',
                aggregatedCell: () => null,
            }
        ],
        []
    );

    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    const table = useReactTable({
        data,
        columns,
        state: {
            expanded,
        },
        initialState: {
            grouping: ['Sector'],
        },
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: () => true,
        autoResetExpanded: false,
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 px-4 flex-col">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                <p className="text-zinc-400 ">Gathering live portfolio metrics...</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className="border-b border-border">
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="p-4 text-sm font-semibold text-gray-300 whitespace-nowrap">
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => {
                        return (
                            <tr
                                key={row.id}
                                className={clsx(
                                    "border-b border-border hover:bg-zinc-900 transition-colors",
                                    row.getIsGrouped() ? "bg-zinc-950" : ""
                                )}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className={clsx("p-4 text-sm", row.getIsGrouped() && "font-semibold")}>
                                        {cell.getIsGrouped() ? (
                                            <div
                                                onClick={row.getToggleExpandedHandler()}
                                                className="flex items-center gap-2 cursor-pointer text-white w-full h-full select-none"
                                            >
                                                {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                <span className="text-xs font-normal text-zinc-500">({row.subRows.length})</span>
                                            </div>
                                        ) : cell.getIsAggregated() ? (
                                            flexRender(
                                                cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                                                cell.getContext()
                                            )
                                        ) : cell.getIsPlaceholder() ? null : (
                                            flexRender(cell.column.columnDef.cell, cell.getContext())
                                        )}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {data.length === 0 && !loading && (
                <div className="text-center py-10 text-gray-400">
                    No portfolio data available.
                </div>
            )}
        </div>
    );
}
