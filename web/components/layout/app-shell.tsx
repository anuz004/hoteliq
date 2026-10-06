'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Building2, Command, CreditCard, Gauge, LayoutGrid, Search, Settings, Sparkles, TrendingUp, Users, Wand2 } from 'lucide-react';
import React from 'react';

const nav = [
  { label: 'Overview', href: '/overview', icon: LayoutGrid },
  { label: 'Revenue', href: '/revenue', icon: TrendingUp },
  { label: 'Demand', href: '/demand', icon: Gauge },
  { label: 'Bookings', href: '/bookings', icon: CreditCard },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Forecast', href: '/forecast', icon: Wand2 },
  { label: 'Anomalies', href: '/anomalies', icon: Sparkles },
  { label: 'Data Health', href: '/system/data-health', icon: Building2 },
  { label: 'Models', href: '/system/models', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0f14] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-800 bg-[#0d141b] lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4b07d] text-sm font-bold text-slate-900">H</div>
            <div>
              <div className="text-lg font-semibold">HOTELIQ</div>
              <div className="text-xs text-slate-400">Revenue intelligence</div>
            </div>
          </div>
          <nav className="space-y-2 px-3 py-4">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? 'bg-slate-800 text-white shadow-soft' : 'text-slate-300 hover:bg-slate-900/80'}`}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-800 bg-[#0d141a]/95 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-200 lg:hidden">
                  <LayoutGrid className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Operations</div>
                  <div className="text-sm text-slate-300">May 2024 briefing</div>
                </div>
              </div>
              <div className="hidden items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-300 md:flex">
                <Search className="h-4 w-4 text-slate-400" />
                <span>Command palette</span>
                <span className="rounded border border-slate-700 px-1.5 py-0.5 text-[10px]">⌘K</span>
              </div>
              <div className="flex items-center gap-3">
                <button aria-label="notifications" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-300">
                  <Bell className="h-4 w-4" />
                </button>
                <button aria-label="command palette" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-300">
                  <Command className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-2 py-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4b07d] text-xs font-semibold text-slate-900">RM</div>
                  <div className="text-sm font-medium text-slate-200">Revenue Manager</div>
                </div>
              </div>
            </div>
          </header>
          <main className="min-h-[calc(100vh-80px)] p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
