import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { IncomePoint } from '@/lib/calc';
import { Card, CardHeader } from '@/components/ui/Card';
import { LineChart as LineIcon } from 'lucide-react';
import { formatCompact, formatCurrency, formatDateShort } from '@/lib/format';

const COLOR_INCOME    = '#22c55e'; // Realidad — verde
const COLOR_ANALYTICS = '#8b5cf6'; // Estimación — violeta
const COLOR_WARNING   = '#f59e0b'; // Piso — naranja
const THEME = {
  grid: '#1f2937',
  axis: '#6b7280',
  tooltip: { bg: '#111827', border: '#1f2937' },
};

interface Props {
  points: IncomePoint[];
  hasProjection: boolean;
}

export function CashflowChart({ points, hasProjection }: Props) {
  const data = points.map((p) => ({
    date: p.date,
    label: formatDateShort(p.date),
    Realidad:   p.actual    !== null ? Math.round(p.actual)    : null,
    Estimación: p.estimated !== null ? Math.round(p.estimated) : null,
    Piso:       p.worst     !== null ? Math.round(p.worst)     : null,
  }));

  const yMax = Math.max(
    ...data.map((p) => Math.max(p.Realidad ?? 0, p.Estimación ?? 0, p.Piso ?? 0)),
    0,
  );
  const yDomain: [number, number] = [0, Math.ceil((yMax * 1.1) / 100_000) * 100_000 || 100_000];

  return (
    <Card>
      <CardHeader
        icon={<LineIcon size={16} />}
        iconTone="analytics"
        title="Ingresos del mes"
        subtitle="Realidad confirmada vs. tus metas mensuales"
      />

      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1">
        <LegendLine color={COLOR_INCOME} label="Realidad" />
        {hasProjection && <LegendLine color={COLOR_ANALYTICS} label="Estimación" />}
        {hasProjection && <LegendLine color={COLOR_WARNING} label="Piso" dashed />}
      </div>

      <div className="h-56 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="gReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_INCOME} stopOpacity={0.3} />
                <stop offset="85%" stopColor={COLOR_INCOME} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gEst" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_ANALYTICS} stopOpacity={0.2} />
                <stop offset="85%" stopColor={COLOR_ANALYTICS} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gWorst" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_WARNING} stopOpacity={0.12} />
                <stop offset="85%" stopColor={COLOR_WARNING} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              stroke={THEME.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
              dy={4}
            />
            <YAxis
              stroke={THEME.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={62}
              domain={yDomain}
              tickFormatter={(v) => formatCompact(v as number)}
            />
            <Tooltip
              contentStyle={{
                background: THEME.tooltip.bg,
                border: `1px solid ${THEME.tooltip.border}`,
                borderRadius: 12,
                fontSize: 12,
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: THEME.axis, marginBottom: 4 }}
              itemStyle={{ paddingTop: 2 }}
              formatter={(value: number | null, name) =>
                value !== null ? [formatCurrency(value), name] : ['—', name]
              }
            />

            {/* Piso primero (debajo), luego Estimación, Realidad encima */}
            {hasProjection && (
              <Area
                type="stepAfter"
                dataKey="Piso"
                stroke={COLOR_WARNING}
                strokeWidth={1.5}
                fill="url(#gWorst)"
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 4, fill: COLOR_WARNING }}
                connectNulls
              />
            )}
            {hasProjection && (
              <Area
                type="stepAfter"
                dataKey="Estimación"
                stroke={COLOR_ANALYTICS}
                strokeWidth={2}
                fill="url(#gEst)"
                dot={false}
                activeDot={{ r: 4, fill: COLOR_ANALYTICS }}
                connectNulls
              />
            )}
            <Area
              type="stepAfter"
              dataKey="Realidad"
              stroke={COLOR_INCOME}
              strokeWidth={2.5}
              fill="url(#gReal)"
              dot={false}
              activeDot={{ r: 5, fill: COLOR_INCOME }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {!hasProjection && (
        <p className="mt-2 text-center text-[11px] text-muted">
          Configurá tus metas y días de trabajo con el botón{' '}
          <span className="font-medium text-text">Proyecciones</span>
        </p>
      )}
    </Card>
  );
}

function LegendLine({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="20" height="10">
        <line
          x1="0" y1="5" x2="20" y2="5"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? '4 2' : undefined}
        />
      </svg>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}
