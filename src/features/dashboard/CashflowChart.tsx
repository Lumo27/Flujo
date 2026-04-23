import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ProjectionPoint } from '@/lib/calc';
import { Card, CardHeader } from '@/components/ui/Card';
import { LineChart as LineIcon } from 'lucide-react';
import { formatCompact, formatCurrency, formatDateShort } from '@/lib/format';

// Violeta = analytics. Naranja = peor escenario / warning.
const COLOR_ANALYTICS = '#8b5cf6';
const COLOR_WARNING = '#f59e0b';
const THEME = {
  grid: '#1f2937',
  axis: '#6b7280',
  tooltip: { bg: '#111827', border: '#1f2937' },
};

export function CashflowChart({ points }: { points: ProjectionPoint[] }) {
  const data = points.map((p) => ({
    date: p.date,
    label: formatDateShort(p.date),
    Estimado: Math.round(p.estimated),
    'Peor caso': Math.round(p.worst),
  }));

  return (
    <Card>
      <CardHeader
        icon={<LineIcon size={16} />}
        iconTone="analytics"
        title="Proyección del mes"
        subtitle="Saldo estimado vs peor escenario, día a día"
      />
      <div className="h-56 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="gEst" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_ANALYTICS} stopOpacity={0.4} />
                <stop offset="85%" stopColor={COLOR_ANALYTICS} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gWorst" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_WARNING} stopOpacity={0.25} />
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
              formatter={(value: number, name) => [formatCurrency(value), name]}
            />
            {/* Peor caso primero (abajo) para que no tape la línea principal */}
            <Area
              type="monotone"
              dataKey="Peor caso"
              stroke={COLOR_WARNING}
              strokeWidth={1.5}
              fill="url(#gWorst)"
              strokeDasharray="5 3"
              dot={false}
              activeDot={{ r: 4, fill: COLOR_WARNING }}
            />
            <Area
              type="monotone"
              dataKey="Estimado"
              stroke={COLOR_ANALYTICS}
              strokeWidth={2}
              fill="url(#gEst)"
              dot={false}
              activeDot={{ r: 4, fill: COLOR_ANALYTICS }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
