import { BarChart3 } from 'lucide-react';

function formatMarketCap(value) {
  if (!value) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
}

function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '—';
  return value.toFixed(decimals);
}

function MetricRow({ label, value, format, threshold, invertColor }) {
  const formatted = format ? format(value) : formatNumber(value);
  
  let colorClass = 'text-[var(--text-primary)]';
  if (threshold && value !== null && value !== undefined) {
    const isFavorable = invertColor ? value < threshold : value > threshold;
    const isUnfavorable = invertColor ? value > threshold : value < threshold;
    if (isFavorable) colorClass = 'text-[var(--accent-green)]';
    else if (isUnfavorable) colorClass = 'text-[var(--accent-red)]';
  }

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-color)] last:border-0">
      <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
      <span className={`text-xs font-bold ${colorClass}`} style={{ fontFamily: 'var(--font-mono)' }}>
        {formatted}
      </span>
    </div>
  );
}

export default function FundamentalsGrid({ metrics, quote }) {
  if (!metrics || !metrics.metric) {
    return (
      <div className="panel">
        <h3 className="text-xs text-[var(--accent-amber)] font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          <BarChart3 size={12} className="inline mr-1" />
          FUNDAMENTALS
        </h3>
        <div className="empty-state text-xs py-4">NO SIGNAL</div>
      </div>
    );
  }

  const m = metrics.metric;
  const currentPrice = quote?.c;
  const priceChange = quote?.dp;

  // 52W range percentage
  const range52w = currentPrice && m['52WeekHigh'] ? 
    ((currentPrice - m['52WeekLow']) / (m['52WeekHigh'] - m['52WeekLow']) * 100).toFixed(0) : null;

  return (
    <div className="panel">
      <h3 className="text-xs text-[var(--accent-amber)] font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
        <BarChart3 size={12} className="inline mr-1" />
        FUNDAMENTALS
      </h3>

      {/* Current Price Header */}
      {currentPrice && (
        <div className="mb-3 pb-2 border-b border-[var(--border-color)]">
          <div className="text-lg font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>
            ${currentPrice.toFixed(2)}
          </div>
          {priceChange !== undefined && (
            <div className={`text-xs font-bold ${priceChange >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          )}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="flex flex-col">
        <MetricRow label="P/E Ratio" value={m.peNormalizedAnnual} threshold={15} invertColor={false} />
        <MetricRow label="EPS (TTM)" value={m.epsInclExtraTTM} threshold={0} />
        <MetricRow label="Market Cap" value={m.marketCapitalization} format={formatMarketCap} />
        <MetricRow label="Beta" value={m.beta} />
        <MetricRow label="52W High" value={m['52WeekHigh']} />
        <MetricRow label="52W Low" value={m['52WeekLow']} />
        
        {/* 52W Range Bar */}
        {range52w !== null && (
          <div className="py-1.5">
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-0.5">
              <span>52W Range</span>
              <span>{range52w}%</span>
            </div>
            <div className="h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-amber)] rounded-full"
                style={{ width: `${range52w}%` }}
              />
            </div>
          </div>
        )}
        
        <MetricRow label="Revenue Growth (YoY)" value={m.revenueGrowthQuarterlyYoy} format={v => v !== null ? `${(v * 100).toFixed(1)}%` : '—'} />
        <MetricRow label="Debt/Equity" value={m.totalDebtToEquity} threshold={2} invertColor={true} />
      </div>
    </div>
  );
}
