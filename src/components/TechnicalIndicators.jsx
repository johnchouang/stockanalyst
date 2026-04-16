import { Activity } from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

function MiniChart({ data, color, height = 40 }) {
  const chartData = data
    .map((v, i) => ({ v, i }))
    .filter(d => d.v !== null && d.v !== undefined);
  
  if (chartData.length < 2) return null;
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <YAxis hide domain={['auto', 'auto']} />
        <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={1} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function IndicatorBadge({ label, value, format: fmt, thresholds }) {
  const formatted = value !== null ? fmt(value) : '—';
  let color = 'var(--text-muted)';
  if (value !== null && thresholds) {
    if (value >= thresholds.high || value <= thresholds.low) {
      color = thresholds.warningColor || 'var(--accent-red)';
    } else {
      color = thresholds.normalColor || 'var(--accent-green)';
    }
  }
  
  return (
    <div className="flex flex-col items-end">
      <span className="text-[10px] text-[var(--text-muted)] uppercase">{label}</span>
      <span className="text-sm font-bold" style={{ color, fontFamily: 'var(--font-mono)' }}>{formatted}</span>
    </div>
  );
}

export default function TechnicalIndicators({ indicators }) {
  if (!indicators || indicators.latestRSI === null) {
    return (
      <div className="panel">
        <h3 className="text-xs text-[var(--accent-amber)] font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Activity size={12} className="inline mr-1" />
          TECHNICAL INDICATORS
        </h3>
        <div className="empty-state text-xs py-4">NO SIGNAL</div>
      </div>
    );
  }

  const { latestRSI, latestMACD, latestMACDSignal, latestATR, latestStochasticK, latestStochasticD, rsi, macd, stochastic } = indicators;
  const macdHistogram = macd?.histogram || [];
  const latestMACDHist = macdHistogram.filter(v => v !== null).slice(-1)[0];

  return (
    <div className="panel">
      <h3 className="text-xs text-[var(--accent-amber)] font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
        <Activity size={12} className="inline mr-1" />
        TECHNICAL INDICATORS
      </h3>

      {/* RSI */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[var(--text-muted)]">RSI (14)</span>
          <span className={`text-xs font-bold ${
            latestRSI > 70 ? 'text-[var(--accent-red)]' :
            latestRSI < 30 ? 'text-[var(--accent-green)]' :
            'text-[var(--text-primary)]'
          }`} style={{ fontFamily: 'var(--font-mono)' }}>
            {latestRSI?.toFixed(1)}
            <span className="text-[10px] text-[var(--text-muted)] ml-1">
              {latestRSI > 70 ? 'OVERBOUGHT' : latestRSI < 30 ? 'OVERSOLD' : 'NEUTRAL'}
            </span>
          </span>
        </div>
        {/* RSI Bar */}
        <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(Math.max(latestRSI, 0), 100)}%`,
              backgroundColor: latestRSI > 70 ? 'var(--accent-red)' : latestRSI < 30 ? 'var(--accent-green)' : 'var(--accent-amber)',
            }}
          />
        </div>
        <div className="flex justify-between text-[8px] text-[var(--text-muted)] mt-0.5">
          <span>0</span><span>30</span><span>50</span><span>70</span><span>100</span>
        </div>
        {rsi && <MiniChart data={rsi.slice(-30)} color="#f59e0b" height={30} />}
      </div>

      {/* MACD */}
      <div className="mb-3 border-t border-[var(--border-color)] pt-2">
        <div className="text-[10px] text-[var(--text-muted)] mb-1">MACD (12/26/9)</div>
        <div className="grid grid-cols-3 gap-2 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
          <div>
            <span className="text-[10px] text-[var(--text-muted)]">MACD</span>
            <div className={`${latestMACD >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
              {latestMACD?.toFixed(2)}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)]">Signal</span>
            <div className="text-[var(--text-primary)]">{latestMACDSignal?.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)]">Hist</span>
            <div className={`${latestMACDHist >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
              {latestMACDHist?.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {latestMACD > latestMACDSignal ? (
            <span className="text-[10px] text-[var(--accent-green)]">▲ BULLISH CROSSOVER</span>
          ) : (
            <span className="text-[10px] text-[var(--accent-red)]">▼ BEARISH CROSSOVER</span>
          )}
        </div>
        {macd?.macdLine && <MiniChart data={macd.histogram?.slice(-30)} color="#3b82f6" height={30} />}
      </div>

      {/* ATR */}
      <div className="mb-3 border-t border-[var(--border-color)] pt-2">
        <div className="flex justify-between">
          <span className="text-[10px] text-[var(--text-muted)]">ATR (14)</span>
          <span className="text-xs font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>
            {latestATR?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Stochastic */}
      <div className="border-t border-[var(--border-color)] pt-2">
        <div className="text-[10px] text-[var(--text-muted)] mb-1">STOCHASTIC (14,3)</div>
        <div className="grid grid-cols-2 gap-2 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
          <div>
            <span className="text-[10px] text-[var(--text-muted)]">%K</span>
            <div className={`${
              latestStochasticK > 80 ? 'text-[var(--accent-red)]' :
              latestStochasticK < 20 ? 'text-[var(--accent-green)]' :
              'text-[var(--text-primary)]'
            }`}>
              {latestStochasticK?.toFixed(1)}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)]">%D</span>
            <div className="text-[var(--text-primary)]">{latestStochasticD?.toFixed(1)}</div>
          </div>
        </div>
        {stochastic?.k && <MiniChart data={stochastic.k.slice(-30)} color="#a855f7" height={30} />}
      </div>
    </div>
  );
}
