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
                cell: info => `₹${Number(info.getValue()).toLocaleString()}`,
                aggregationFn: 'mean',
                aggregatedCell: () => null,
            },
            {
                header: 'Investment',
                accessorKey: 'Investment',
                cell: info => `₹${Number(info.getValue()).toLocaleString()}`,
                aggregationFn: 'sum',
                aggregatedCell: ({ getValue }) => <span className="font-bold text-accent">₹{Number(getValue()).toLocaleString()}</span>,
            },
            {
                header: 'CMP',
                accessorKey: 'CMP',
                cell: info => {
                    const val = info.getValue() as number | string;
                    return val === 'N/A' ? (
                        <span className="flex items-center gap-1 text-gray-500 animate-pulse"><Activity size={14} /> Fetching...</span>
                    ) : `₹${Number(val).toLocaleString()}`;
                },
                aggregationFn: 'mean',
                aggregatedCell: () => null,
            },
            {
                header: 'Present Value',
                accessorKey: 'PresentValue',
                cell: info => {
                    const val = info.getValue() as number | string;
                    return val === 'N/A' ? '-' : `₹${Number(val).toLocaleString()}`;
                },
                aggregationFn: (columnId, leafRows) => {
                    return leafRows.reduce((sum, row) => {
                        const val = row.getValue(columnId) as string | number;
                        return val !== 'N/A' ? sum + Number(val) : sum;
                    }, 0);
                },
                aggregatedCell: ({ getValue }) => {
                    const val = getValue() as number;
                    return val > 0 ? <span className="font-bold text-white">₹{val.toLocaleString()}</span> : '-';
                }
            },
            {
                header: 'Gain / Loss',
                accessorKey: 'GainLoss',
                cell: info => {
                    const val = info.getValue() as number | string;
                    if (val === 'N/A') return '-';
                    const numVal = Number(val);
                    return (
                        <span className="font-medium" style={{ color: numVal >= 0 ? '#10b981' : '#ef4444' }}>
                            {numVal >= 0 ? '+' : ''}₹{numVal.toLocaleString()}
                        </span>
                    );
                },
                aggregationFn: (columnId, leafRows) => {
                    return leafRows.reduce((sum, row) => {
                        const val = row.getValue(columnId) as string | number;
                        return val !== 'N/A' ? sum + Number(val) : sum;
                    }, 0);
                },
                aggregatedCell: ({ getValue }) => {
                    const numVal = getValue() as number;
                    if (!numVal) return '-';
                    return (
                        <span className="font-bold" style={{ color: numVal >= 0 ? '#10b981' : '#ef4444' }}>
                            {numVal >= 0 ? '+' : ''}₹{numVal.toLocaleString()}
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

    const [expanded, setExpanded] = React.useState<ExpandedState>(true);

    const table = useReactTable({
        data,
        columns,
        state: {
            grouping: ['Sector'],
            expanded,
        },
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        autoResetExpanded: false,
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 px-4 flex-col">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-accent animate-pulse">Gathering live portfolio metrics...</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className="border-b border-surface-hover">
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
                        if (row.parentId && !row.getParentRow()?.getIsExpanded()) {
                            return null;
                        }

                        return (
                            <tr
                                key={row.id}
                                className={clsx(
                                    "border-b border-surface-hover/50 hover:bg-surface-hover/30 transition-colors",
                                    row.getIsGrouped() ? "bg-surface-hover/20" : ""
                                )}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className={clsx("p-4 text-sm", row.getIsGrouped() && "font-semibold")}>
                                        {cell.getIsGrouped() ? (
                                            <button
                                                {...{
                                                    onClick: row.getToggleExpandedHandler(),
                                                    className: 'flex items-center gap-2 cursor-pointer text-primary-hover',
                                                }}
                                            >
                                                {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                <span className="text-xs font-normal text-gray-400">({row.subRows.length})</span>
                                            </button>
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
