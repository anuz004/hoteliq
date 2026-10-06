'use client';

import { useEffect, useMemo, useState } from 'react';
import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, AlertTriangle, CheckCircle2, Gauge, Sparkles, TrendingUp } from 'lucide-react';
import { API_BASE, fetchJson } from '@/lib/api';
import { KPIStat } from '@/components/dashboard/kpi-card';

export function getDashboardEndpoint(page: string): string {
  const endpoints: Record<string, string> = {
    overview: '/api/overview',
    revenue: '/api/revenue',
    demand: '/api/occupancy',
    bookings: '/api/bookings',
    customers: '/api/customers',
    forecast: '/api/forecast/revenue',
    anomalies: '/api/anomalies',
    pricing: '/api/optimization/price',
    rooms: '/api/optimization/price',
    scenarios: '/api/optimization/price',
    briefing: '/api/overview',
    'data-health': '/api/system/data-health',
    models: '/api/system/models',
    agent: '/api/agent/tools',
  };

  return endpoints[page] || '/api/overview';
}

function formatMetricValue(label: string, value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const numeric = Number(value);

  if (label === 'Occupancy' || label === 'Cancellation Rate') {
    return `${Number.isFinite(numeric) ? numeric.toFixed(1) : value}%`;
  }
  if (label === 'ADR' || label === 'RevPAR' || label === 'Average Daily Rate' || label === 'Revenue per Available Room') {
    return `$${Number.isFinite(numeric) ? numeric.toFixed(1) : value}`;
  }
  if (label === 'Total Revenue' || label === 'Revenue' || label === 'Revenue Forecast') {
    return `$${Number.isFinite(numeric) ? Number(numeric).toLocaleString() : value}`;
  }
  if (label === 'Bookings' || label === 'Total Bookings' || label === 'Forecasted Bookings') {
    return Number.isFinite(numeric) ? `${Math.round(numeric)}` : String(value);
  }
  return Number.isFinite(numeric) ? `${numeric.toFixed(1)}` : String(value);
}

export function HotelDashboard({ page }: { page: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeDays, setRangeDays] = useState<number>(30);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint = getDashboardEndpoint(page);
        const json = await fetchJson(endpoint);
        setData(json);
      } catch (err) {
        setError('Live data is unavailable. The dashboard is showing fallback context while the API is restarting.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  useEffect(() => {
    const candidateSeries = data?.series || data?.revenue_series || data?.baseline?.forecast || [];
    if (!Array.isArray(candidateSeries) || !candidateSeries.length) return;

    const toDateValue = (value: any) => {
      if (!value) return null;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    };

    const dates = candidateSeries
      .flatMap((item) => {
        const date = toDateValue(item.date ?? item.day ?? item.period);
        return date ? [date] : [];
      })
      .sort((a, b) => a.getTime() - b.getTime());

    if (!dates.length) return;

    const start = dates[0];
    const end = dates[dates.length - 1];

    setDateRange({
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    });
  }, [data]);

  const filterSeriesByRange = (series: any[] | undefined) => {
    if (!Array.isArray(series) || !series.length) return series || [];

    const selectedStart = dateRange.start ? new Date(dateRange.start) : null;
    const selectedEnd = dateRange.end ? new Date(dateRange.end) : null;

    if (selectedStart && selectedEnd && selectedStart <= selectedEnd) {
      return series.filter((item) => {
        const value = item.date ?? item.day ?? item.period;
        if (!value) return true;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return true;
        return date >= selectedStart && date <= selectedEnd;
      });
    }

    if (rangeDays === 0) return series;

    const start = new Date();
    start.setDate(start.getDate() - rangeDays);

    return series.filter((item) => {
      const value = item.date ?? item.day ?? item.period;
      if (!value) return true;
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) ? date >= start : true;
    });
  };

  const exportCurrentView = (type: 'json' | 'csv') => {
    const payload = {
      page,
      rangeDays,
      summary: overviewData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([
      type === 'json' ? JSON.stringify(payload, null, 2) : Object.entries(payload.summary || {}).map(([key, value]) => `${key},${JSON.stringify(value)}`).join('\n'),
    ], { type: type === 'json' ? 'application/json' : 'text/csv;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${page}-brief.${type}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const overviewData = useMemo(() => {
    const fallbackRevenue = [
      { date: '2024-01-01', revenue: 82000 },
      { date: '2024-01-05', revenue: 86000 },
      { date: '2024-01-10', revenue: 89000 },
      { date: '2024-01-15', revenue: 87000 },
      { date: '2024-01-20', revenue: 91000 },
      { date: '2024-01-25', revenue: 94000 },
      { date: '2024-01-30', revenue: 93000 },
    ];

    if (!data) {
      return {
        revenueSeries: fallbackRevenue,
        kpis: [
          { label: 'Total Revenue', value: '$898,300', change: 6.4, positive: true },
          { label: 'Occupancy', value: '77.5%', change: 2.1, positive: true },
          { label: 'ADR', value: '$124.7', change: 3.7, positive: true },
          { label: 'RevPAR', value: '$95.3', change: 4.8, positive: true },
        ],
        channels: [{ channel: 'Direct', revenue: 420000 }, { channel: 'OTA', revenue: 310000 }, { channel: 'Corporate', revenue: 215000 }],
        segments: [{ segment: 'Leisure', revenue: 420000 }, { segment: 'Business', revenue: 310000 }],
        insights: [
          { title: 'Demand pulse', body: 'Occupancy remains positive with a modest uplift on weekend arrivals.' },
          { title: 'Pricing signal', body: 'ADR is holding above the trailing period without eroding occupancy.' },
        ],
      };
    }

    if (page === 'overview' && data.kpis) {
      return {
        revenueSeries: data.revenue_series || fallbackRevenue,
        kpis: data.kpis.map((k: any) => ({
          label: k.label,
          value: formatMetricValue(k.label, k.value),
          change: Number(k.change || 0),
          positive: Number(k.change || 0) >= 0,
          subtitle: 'vs prior period',
        })),
        channels: data.top_channels || [{ channel: 'Direct', revenue: 420000 }],
        segments: data.top_segments || [{ segment: 'Leisure', revenue: 420000 }],
        insights: [
          { title: 'Demand pulse', body: 'Current demand remains consistent with the recent trend and supports a stable pricing posture.' },
          { title: 'Pricing signal', body: 'ADR is above the trailing period without a meaningful drop in occupancy.' },
          { title: 'Anomaly check', body: 'Larger variance in price elasticity should be reviewed before weekend cutbacks.' },
        ],
      };
    }

    if (page === 'revenue' && data.series) {
      return {
        revenueSeries: data.series.map((d: any) => ({
          date: d.date,
          revenue: Number(d.revenue) || 0,
          roomRevenue: Number(d.roomRevenue) || Number(d.revenue) || 0,
        })),
        kpis: [
          { label: 'Revenue', value: formatMetricValue('Revenue', data.series.reduce((sum: number, item: any) => sum + Number(item.revenue || 0), 0)), change: 0, positive: true },
          { label: 'Room Revenue', value: formatMetricValue('Revenue', data.series.reduce((sum: number, item: any) => sum + Number(item.roomRevenue || 0), 0)), change: 0, positive: true },
          { label: 'Revenue / Marketing Spend', value: formatMetricValue('Revenue', data.revenue_per_spend || 0), change: 0, positive: true },
        ],
        channels: Object.entries(data.by_channel || {}).map(([channel, revenue]) => ({ channel, revenue: Number(revenue) || 0 })),
        segments: Object.entries(data.by_country || {}).map(([country, revenue]) => ({ country, revenue: Number(revenue) || 0 })),
        insights: [
          { title: 'Channel mix', body: 'Revenue concentration is strongest through the hotel’s direct and OTA channels.' },
          { title: 'Country mix', body: 'International demand remains a meaningful share of the top-line revenue profile.' },
        ],
      };
    }

    if (page === 'demand' && data.series) {
      return {
        revenueSeries: data.series.map((d: any) => ({ date: d.date, occupancy: Number(d.occupancy) * 100, adr: Number(d.adr) || 0, revpar: Number(d.revpar) || 0 })),
        kpis: [
          { label: 'Occupancy', value: formatMetricValue('Occupancy', (data.series.reduce((sum: number, item: any) => sum + Number(item.occupancy || 0), 0) / Math.max(data.series.length, 1)) * 100), change: 0, positive: true },
          { label: 'ADR', value: formatMetricValue('ADR', data.series.reduce((sum: number, item: any) => sum + Number(item.adr || 0), 0) / Math.max(data.series.length, 1)), change: 0, positive: true },
          { label: 'RevPAR', value: formatMetricValue('RevPAR', data.series.reduce((sum: number, item: any) => sum + Number(item.revpar || 0), 0) / Math.max(data.series.length, 1)), change: 0, positive: true },
        ],
        channels: Object.entries(data.by_guest_type || {}).map(([segment, value]) => ({ segment, revenue: Number(value) || 0 })),
        insights: [
          { title: 'Demand pulse', body: 'Occupancy is trending with expected weekend lift and midweek softness.' },
          { title: 'Pricing lens', body: 'ADR is holding while occupancy keeps the hotel near its target operating mix.' },
        ],
      };
    }

    if (page === 'bookings' && data.series) {
      return {
        revenueSeries: data.series.map((d: any) => ({ date: d.date, bookings: Number(d.bookings) || 0, cancellations: Number(d.cancellations) || 0 })),
        kpis: [
          { label: 'Bookings', value: formatMetricValue('Bookings', data.series.reduce((sum: number, item: any) => sum + Number(item.bookings || 0), 0)), change: 0, positive: true },
          { label: 'Cancellation Rate', value: formatMetricValue('Cancellation Rate', Number(data.cancel_rate) || 0), change: 0, positive: false },
          { label: 'No-Show Rate', value: formatMetricValue('No-Show Rate', Number(data.no_show_rate) || 0), change: 0, positive: false },
        ],
        channels: Object.entries(data.channels || {}).map(([channel, value]) => ({ channel, revenue: Number(value) || 0 })),
        insights: [
          { title: 'Booking health', body: 'Booking volume is stable, with no major distress signal in the flow.' },
          { title: 'Risk watch', body: 'Cancellations and no-shows remain within an acceptable operating envelope.' },
        ],
      };
    }

    if (page === 'customers' && data.by_guest_type) {
      return {
        revenueSeries: Object.entries(data.by_guest_type || {}).map(([segment, revenue]) => ({ name: segment, revenue: Number(revenue) || 0 })),
        kpis: [
          { label: 'Guest Revenue', value: formatMetricValue('Revenue', Object.values(data.by_guest_type || {}).reduce((sum: number, value: any) => sum + Number(value || 0), 0)), change: 0, positive: true },
          { label: 'Avg Review Score', value: formatMetricValue('Avg Review Score', Number(data.review_score) || 0), change: 0, positive: true },
          { label: 'Compliments', value: formatMetricValue('Compliments', Number(data.compliments) || 0), change: 0, positive: true },
        ],
        channels: Object.entries(data.by_country || {}).map(([country, revenue]) => ({ country, revenue: Number(revenue) || 0 })),
        insights: [
          { title: 'Guest mix', body: 'Leisure demand remains the strongest source of room revenue, with business travel close behind.' },
          { title: 'Service quality', body: 'Guest sentiment remains strong, with a good balance of compliments and low complaint volume.' },
        ],
      };
    }

    if (page === 'forecast' && data.baseline) {
      const forecastSeries = (data.baseline.forecast || []).map((d: any) => ({ date: d.date, revenue: Number(d.forecast) || 0 }));
      return {
        revenueSeries: forecastSeries.length ? forecastSeries : fallbackRevenue,
        kpis: [
          { label: 'Forecast Revenue', value: formatMetricValue('Revenue Forecast', Number(data.baseline.forecast?.reduce((sum: number, item: any) => sum + Number(item.forecast || 0), 0) || 0)), change: Number(data.levels?.delta_pct || 0), positive: Number(data.levels?.delta_pct || 0) >= 0 },
          { label: 'Actual Total', value: formatMetricValue('Revenue', Number(data.levels?.actual_total || 0)), change: 0, positive: true },
          { label: 'Forecast Accuracy', value: formatMetricValue('Accuracy', 100 - Math.abs(Number(data.levels?.delta_pct || 0))), change: 0, positive: true },
        ],
        channels: [{ channel: 'Forecast', revenue: Number(data.levels?.forecast_total || 0) }],
        insights: [
          { title: 'Forecast posture', body: 'The model projects a near-term lift in demand driven by strong booking momentum.' },
          { title: 'Model note', body: data.method || 'Short-term forecast is based on the current hotel operating pattern and recent booking behavior.' },
        ],
      };
    }

    if (page === 'anomalies' && data.anomalies) {
      return {
        revenueSeries: fallbackRevenue,
        kpis: [
          { label: 'Alerts', value: formatMetricValue('Alerts', Number(data.total_alerts || 0)), change: 0, positive: true },
          { label: 'Revenue variance', value: formatMetricValue('Revenue', data.anomalies.Revenue?.[0]?.deviation || 0), change: 0, positive: false },
          { label: 'Occupancy variance', value: formatMetricValue('Occupancy', (data.anomalies.Occupancy_Rate?.[0]?.deviation || 0) * 100), change: 0, positive: false },
        ],
        channels: [{ channel: 'Alert queue', revenue: Number(data.total_alerts || 0) }],
        insights: [
          { title: 'Revenue anomaly', body: 'Major outliers are concentrated in the revenue and occupancy series and should be reviewed.' },
          { title: 'Monitoring', body: 'Risk scoring is based on z-score variance against the recent operating baseline.' },
        ],
      };
    }

    if (page === 'pricing' || page === 'rooms' || page === 'scenarios') {
      const scenario = data?.scenario || { adr: 0, occupancy: 0, revenue: 0 };
      return {
        revenueSeries: fallbackRevenue,
        kpis: [
          { label: 'Current ADR', value: formatMetricValue('ADR', Number(data?.current?.adr || 0)), change: 0, positive: true },
          { label: 'Scenario ADR', value: formatMetricValue('ADR', Number(scenario.adr || 0)), change: 0, positive: true },
          { label: 'Projected Occupancy', value: formatMetricValue('Occupancy', Number(scenario.occupancy || 0) * 100), change: 0, positive: true },
        ],
        channels: [{ channel: 'Projected revenue', revenue: Number(scenario.revenue || 0) }],
        insights: [
          { title: 'Pricing scenario', body: 'The recommended rate balances occupancy retention against revenue uplift under current demand conditions.' },
          { title: 'Operating model', body: data?.assumptions?.join(' ') || 'The model assumes realistic hotel operating caps and price sensitivity.' },
        ],
      };
    }

    if (page === 'models' && data.models) {
      return {
        revenueSeries: fallbackRevenue,
        kpis: data.models.map((m: any) => ({
          label: m.model_name,
          value: formatMetricValue('Model error', Number(m.mae || 0)),
          change: 0,
          positive: true,
          subtitle: m.status || 'ready',
        })),
        channels: [{ channel: 'Model readiness', revenue: 1 }],
        insights: [
          { title: 'Forecast coverage', body: 'The current model covers short-term revenue prediction using recent operational patterns.' },
          { title: 'Status', body: 'Model performance remains acceptable for operational guidance but should be monitored as data volume grows.' },
        ],
      };
    }

    if (page === 'data-health' && data.quality_score !== undefined) {
      return {
        revenueSeries: fallbackRevenue,
        kpis: [
          { label: 'Quality Score', value: formatMetricValue('Quality Score', Number(data.quality_score || 0)), change: 0, positive: Number(data.quality_score || 0) >= 80 },
          { label: 'Missing Records', value: formatMetricValue('Missing', Number(data.missing || 0)), change: 0, positive: false },
          { label: 'Duplicate Rows', value: formatMetricValue('Duplicates', Number(data.duplicate_rows || 0)), change: 0, positive: false },
        ],
        channels: [{ channel: 'Data health', revenue: Number(data.quality_score || 0) }],
        insights: [
          { title: 'Data quality', body: `The core dataset is ${data.ingestion_status || 'ready'} with a quality score of ${data.quality_score || 0}.` },
          { title: 'Coverage', body: `The data coverage spans ${data.coverage || 'the full period'} in the source hotel book file.` },
        ],
      };
    }

    if (page === 'agent' && data.booking_channels) {
      return {
        revenueSeries: fallbackRevenue,
        kpis: [
          { label: 'Revenue', value: formatMetricValue('Revenue', Number(data.revenue || 0)), change: 0, positive: true },
          { label: 'Occupancy', value: formatMetricValue('Occupancy', Number(data.occupancy || 0)), change: 0, positive: true },
          { label: 'Booking Channels', value: formatMetricValue('Bookings', Object.keys(data.booking_channels || {}).length), change: 0, positive: true },
        ],
        channels: Object.entries(data.booking_channels || {}).map(([channel, value]) => ({ channel, revenue: Number(value) || 0 })),
        insights: [
          { title: 'Agent brief', body: 'The current operating profile is ready for AI-assisted investigation across revenue, occupancy, and booking behavior.' },
          { title: 'Key drivers', body: 'Revenue concentration and demand signals are the most relevant factors to interrogate next.' },
        ],
      };
    }

    return {
      revenueSeries: fallbackRevenue,
      kpis: [
        { label: 'Total Revenue', value: '$898,300', change: 6.4, positive: true },
        { label: 'Occupancy', value: '77.5%', change: 2.1, positive: true },
        { label: 'ADR', value: '$124.7', change: 3.7, positive: true },
      ],
      channels: [{ channel: 'Direct', revenue: 420000 }, { channel: 'OTA', revenue: 310000 }, { channel: 'Corporate', revenue: 215000 }],
      segments: [{ segment: 'Leisure', revenue: 420000 }, { segment: 'Business', revenue: 310000 }],
      insights: [
        { title: 'Performance', body: 'The hotel remains within the expected operating range for the current period.' },
        { title: 'Next action', body: 'Continue monitoring demand elasticity and the pricing strategy as the demand curve evolves.' },
      ],
    };
  }, [data, page]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-100">
        <div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" /> API status</div>
        <p className="mt-2 text-sm text-amber-50/90">{error}</p>
      </div>
    );
  }

  const pageTitle = page === 'overview' ? 'Executive overview' : page.charAt(0).toUpperCase() + page.slice(1);
  const visibleSeries = filterSeriesByRange(overviewData.revenueSeries);
  const quickActions = [
    { label: 'Run demand forecast', href: '/forecast' },
    { label: 'Open pricing optimizer', href: '/optimization/pricing' },
    { label: 'Investigate anomalies', href: '/anomalies' },
    { label: 'Export brief', action: 'export' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-[#d4b07d]">HOTELIQ</div>
          <h1 className="mt-2 text-3xl font-semibold text-white">{pageTitle}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-300">Live</span>
          <span>API status: {API_BASE}</span>
          <select
            value={rangeDays}
            onChange={(event) => {
              const next = Number(event.target.value);
              setRangeDays(next);
              if (next !== 0 && dateRange.start && dateRange.end) {
                const end = new Date(dateRange.end);
                end.setDate(end.getDate() - next + 1);
                setDateRange({ start: end.toISOString().slice(0, 10), end: dateRange.end });
              }
            }}
            className="rounded-xl border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
            aria-label="Select reporting range"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={0}>All data</option>
          </select>
          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-2 py-1.5">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">From</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(event) => setDateRange((current) => ({ ...current, start: event.target.value }))}
              className="bg-transparent text-slate-100 outline-none"
            />
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">To</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(event) => setDateRange((current) => ({ ...current, end: event.target.value }))}
              className="bg-transparent text-slate-100 outline-none"
            />
          </div>
        </div>
      </div>

      {page === 'overview' || page === 'revenue' || page === 'demand' || page === 'bookings' || page === 'customers' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {overviewData.kpis?.map((k: any, idx: number) => (
            <KPIStat key={idx} title={k.label || 'Metric'} value={k.value} delta={Number(k.change || 0)} positive={Number(k.change || 0) >= 0} subtitle={k.subtitle || 'vs prior period'} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-[#101922] p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Performance trend</div>
              <div className="text-lg font-semibold text-white">Revenue performance</div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300"><TrendingUp className="h-3.5 w-3.5 text-[#d4b07d]" /> Stable</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleSeries}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4b07d" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#d4b07d" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#263342" vertical={false} />
                <XAxis dataKey="date" stroke="#7a8698" tickFormatter={(value) => value.slice(5)} />
                <YAxis stroke="#7a8698" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#d4b07d" fill="url(#revenueFill)" strokeWidth={2} />
                <Line type="monotone" dataKey="roomRevenue" stroke="#7dd3fc" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#101922] p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Channel mix</div>
              <div className="text-lg font-semibold text-white">Booking channels</div>
            </div>
            <Sparkles className="h-4 w-4 text-[#d4b07d]" />
          </div>
          <div className="space-y-4">
            {(overviewData.channels || []).slice(0, 4).map((channel: any, index: number) => (
              <div key={index}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                  <span>{channel.channel || channel.segment || 'Channel'}</span>
                  <span>{(channel.revenue || 0).toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-[#d4b07d]" style={{ width: `${Math.min(100, 30 + index * 20)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-[#101922] p-4 shadow-soft xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Demand and pricing</div>
              <div className="text-lg font-semibold text-white">Occupancy & ADR trend</div>
            </div>
            <Gauge className="h-4 w-4 text-[#d4b07d]" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visibleSeries}>
                <CartesianGrid stroke="#263342" vertical={false} />
                <XAxis dataKey="date" stroke="#7a8698" tickFormatter={(value) => value.slice(5)} />
                <YAxis stroke="#7a8698" />
                <Tooltip />
                <Bar dataKey="revenue" radius={[10, 10, 0, 0]} fill="#d4b07d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#101922] p-4 shadow-soft">
          <div className="mb-4 text-sm text-slate-400">Intelligence feed</div>
          <div className="space-y-4">
            {(overviewData.insights || []).map((item: any) => (
              <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> {item.title}</div>
                <p className="mt-2 text-sm text-slate-300">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-[#101922] p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-white">Forecast snapshot</div>
            <ArrowRight className="h-4 w-4 text-[#d4b07d]" />
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex justify-between"><span>Next 7-day revenue</span><span className="font-medium text-white">$638k</span></div>
            <div className="flex justify-between"><span>Projected occupancy</span><span className="font-medium text-white">78.3%</span></div>
            <div className="flex justify-between"><span>Model status</span><span className="text-emerald-300">Ready</span></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#101922] p-4 shadow-soft lg:col-span-2">
          <div className="mb-4 text-lg font-semibold text-white">Quick actions</div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  if (action.action === 'export') {
                    exportCurrentView('json');
                    return;
                  }
                  if (action.href) {
                    window.location.href = action.href;
                  }
                }}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-[#d4b07d]/60 hover:text-white"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
