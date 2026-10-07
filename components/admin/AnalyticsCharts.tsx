"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type {
  ContentTypeSlice,
  DailyPoint,
  TopItem
} from "@/server/analytics-data";

/**
 * Gráficos interativos do módulo Analytics & BI (Recharts).
 * Todos os rótulos, eixos e tooltips estão em português do Brasil.
 * Roda no cliente (Recharts depende de medição do DOM).
 */

const PALETTE = ["#C5A059", "#0D1B2A", "#4a6b8f", "#a9843f", "#829cb5", "#ddbd7a"];

/** Tooltip padrão (pt-BR) com a paleta da marca. */
function BrandTooltip({
  valueLabel
}: {
  valueLabel: string;
}) {
  return (
    <Tooltip
      contentStyle={{
        borderRadius: 6,
        border: "1px solid rgba(13,27,42,0.12)",
        fontSize: 12,
        fontFamily: "var(--font-montserrat)"
      }}
      labelStyle={{ color: "#0D1B2A", fontWeight: 600 }}
      formatter={(value: number | string) => [
        Number(value).toLocaleString("pt-BR"),
        valueLabel
      ]}
    />
  );
}

export function DailyViewsChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,27,42,0.08)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#4a6b8f" }}
          tickLine={false}
          axisLine={{ stroke: "rgba(13,27,42,0.15)" }}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#4a6b8f" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={40}
        />
        <BrandTooltip valueLabel="Acessos" />
        <Line
          type="monotone"
          dataKey="total"
          name="Acessos"
          stroke="#0D1B2A"
          strokeWidth={2.5}
          dot={{ r: 2, fill: "#C5A059" }}
          activeDot={{ r: 5, fill: "#C5A059" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TopContentBarChart({ data }: { data: TopItem[] }) {
  if (!data.length) {
    return <EmptyChart message="Ainda não há dados de acesso suficientes." />;
  }

  // Encurta título longo para caber no eixo.
  const chartData = data.map((d) => ({
    ...d,
    shortTitle: d.title.length > 22 ? `${d.title.slice(0, 21)}…` : d.title
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 24, bottom: 0, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,27,42,0.08)" horizontal={false} />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="shortTitle"
          width={150}
          tick={{ fontSize: 11, fill: "#1d3550" }}
          tickLine={false}
          axisLine={false}
        />
        <BrandTooltip valueLabel="Acessos" />
        <Bar dataKey="total" name="Acessos" fill="#C5A059" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ContentTypePieChart({ data }: { data: ContentTypeSlice[] }) {
  if (!data.length) {
    return <EmptyChart message="Ainda não há dados de acesso suficientes." />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={95}
          innerRadius={45}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.type} fill={PALETTE[index % PALETTE.length]} />
          ))}
        </Pie>
        <BrandTooltip valueLabel="Acessos" />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ fontSize: 12, color: "#1d3550" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Aviso exibido quando ainda não há dados para um gráfico. */
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-sm border border-dashed border-navy-800/15 text-sm text-navy-500">
      {message}
    </div>
  );
}
