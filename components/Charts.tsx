'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

interface RevenueTrendProps {
  data: { month: string; revenue: number }[];
}

export function RevenueTrendChart({ data }: RevenueTrendProps) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5638F5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#5638F5" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2effd" />
          <XAxis
            dataKey="month"
            stroke="#9590b8"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e6e2f8' }}
          />
          <YAxis
            stroke="#9590b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => {
              if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
              if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
              if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
              return `₹${val}`;
            }}
          />
          <Tooltip
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Monthly Revenue']}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e6e2f8',
              borderRadius: '10px',
              fontSize: '12px',
              boxShadow: '0 8px 16px -4px rgba(86, 56, 245, 0.12)',
              fontWeight: 600,
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#5638F5"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PlanBarProps {
  data: { plan: string; count: number }[];
}

export function PlanDistributionChart({ data }: PlanBarProps) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2effd" />
          <XAxis
            dataKey="plan"
            stroke="#9590b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#e6e2f8' }}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis
            stroke="#9590b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(val: number) => [val, 'Active Subscriptions']}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e6e2f8',
              borderRadius: '10px',
              fontSize: '12px',
              boxShadow: '0 8px 16px -4px rgba(86, 56, 245, 0.12)',
              fontWeight: 600,
            }}
          />
          <Bar
            dataKey="count"
            fill="#5638F5"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
