"use client";

import { FiTrendingUp, FiTrendingDown, FiUsers, FiArrowUp, FiArrowDown } from "react-icons/fi";

interface Stats {
  totalEarned: number;
  totalSpent: number;
  totalClients: number;
  thisMonthEarned: number;
  thisMonthSpent: number;
  thisMonthClients: number;
  prevMonthEarned: number;
  prevMonthSpent: number;
  prevMonthClients: number;
}

function pct(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((current - prev) / prev) * 100);
}

function Badge({ value }: { value: number | null }) {
  if (value === null) return null;
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
        positive ? "bg-neutral-100 text-neutral-700" : "bg-red-50 text-red-600"
      }`}
    >
      {positive ? <FiArrowUp className="text-xs" /> : <FiArrowDown className="text-xs" />}
      {Math.abs(value)}%
    </span>
  );
}

export default function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: "Puntos ganados (total)",
      value: stats.totalEarned.toLocaleString(),
      icon: FiTrendingUp,
      change: pct(stats.thisMonthEarned, stats.prevMonthEarned),
      sub: "vs mes anterior",
    },
    {
      label: "Puntos canjeados (total)",
      value: stats.totalSpent.toLocaleString(),
      icon: FiTrendingDown,
      change: pct(stats.thisMonthSpent, stats.prevMonthSpent),
      sub: "vs mes anterior",
    },
    {
      label: "Clientes registrados",
      value: stats.totalClients.toLocaleString(),
      icon: FiUsers,
      change: pct(stats.thisMonthClients, stats.prevMonthClients),
      sub: "nuevos este mes",
    },
    {
      label: "Puntos en circulación",
      value: (stats.totalEarned - stats.totalSpent).toLocaleString(),
      icon: FiTrendingUp,
      change: null,
      sub: "ganados − canjeados",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, change, sub }) => (
        <div
          key={label}
          className="flex flex-col gap-3 rounded-xl border border-orange-200 bg-white p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
              <Icon className="text-lg text-orange-600" />
            </div>
            <Badge value={change} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-neutral-900">{value}</p>
            <p className="mt-0.5 text-xs font-medium text-neutral-800">{label}</p>
            <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
