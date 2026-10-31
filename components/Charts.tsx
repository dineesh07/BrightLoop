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
} from 'recharts';

interface RevenueTrendProps {
  data: { month: string; revenue: number }[];
}

export function RevenueTrendChart({ data }: RevenueTrendProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1d5fbf" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1d5fbf" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            stroke="#8a8a8a"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e6e6e6' }}
          />
          <YAxis
            stroke="#8a8a8a"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e6e6e6',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#1d5fbf"
            strokeWidth={2}
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
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <XAxis
            dataKey="plan"
            stroke="#8a8a8a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#e6e6e6' }}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis
            stroke="#8a8a8a"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(val: number) => [val, 'Active Subscriptions']}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e6e6e6',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" fill="#141414" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

