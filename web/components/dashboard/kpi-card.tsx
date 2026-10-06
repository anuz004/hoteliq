import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function KPIStat({ title, value, delta, subtitle, positive = true }: { title: string; value: string | number; delta?: number; subtitle?: string; positive?: boolean; }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101922] p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between text-slate-400">
        <span className="text-sm">{title}</span>
        {delta !== undefined ? (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${positive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        ) : null}
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      {subtitle ? <div className="mt-2 text-xs text-slate-400">{subtitle}</div> : null}
    </div>
  );
}
