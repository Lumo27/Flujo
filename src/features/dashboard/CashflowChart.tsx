import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ProjectionPoint } from '@/lib/calc';
import { Card, CardHeader } from '@/components/ui/Card';
import { LineChart as LineIcon } from 'lucide-react';
import { formatCompact, formatCurrency, formatDateShort } from '@/lib/format';

export function CashflowChart({ points }: { points: ProjectionPoint[] }) {
  const data = points.map((p) => ({
    date: p.date,
    label: formatDateShort(p.date),
    Estimado: Math.round(p.estimated),
    'Peor escenario': Math.round(p.worst),
  }));

  return (
    <Card>
      <CardHeader
        icon={<LineIcon size={16} />}
        title="Proyección del mes"
        subtitle="Saldo día a día — estimado vs peor escenario"
      />
      <div className="h-56 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="gEst" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#7C5CFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gWorst" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#262636" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#8A8AA3"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              stroke="#8A8AA3"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(v) => formatCompact(v as number)}
            />
            <Tooltip
              contentStyle={{
                background: '#14141F',
                border: '1px solid #262636',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: '#8A8AA3' }}
              formatter={(value: number, name) => [formatCurrency(value), name]}
            />
            <Area
              type="monotone"
              dataKey="Peor escenario"
              stroke="#F59E0B"
              strokeWidth={1.5}
              fill="url(#gWorst)"
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="Estimado"
              stroke="#7C5CFF"
              strokeWidth={2}
              fill="url(#gEst)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
