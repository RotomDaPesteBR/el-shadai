"use client";

import { useTranslations } from 'next-intl';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, PieLabelRenderProps, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './DashboardClientPage.module.scss';

interface StatusMetric extends Record<string, string | number> {
  status: string;
  count: number;
  revenue: number;
}

interface OrderMetrics {
  totalOrders: number;
  totalRevenue: number;
  statusMetrics: StatusMetric[];
}

interface ProductMetrics {
  totalProducts: number;
  lowStockProducts: number;
  lowStockThreshold: number;
}

interface DashboardClientPageProps {
  orderMetrics: OrderMetrics | null;
  productMetrics: ProductMetrics | null;
  initialLoading: boolean;
  initialError: string | null;
}

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

// Define the CustomPieLabel component
const CustomPieLabel = ({ cx, cy, midAngle, outerRadius, percent, payload }: PieLabelRenderProps) => {
  const RADIAN = Math.PI / 180;
  const radius = (outerRadius as number) + 10;
  const x = (cx as number) + radius * Math.cos(-(midAngle as number) * RADIAN);
  const y = (cy as number) + radius * Math.sin(-(midAngle as number) * RADIAN);

  const percentageValue = (percent as number) * 100; // Explicitly cast percent to number

  return (
    <text x={x} y={y} fill="black" textAnchor={x > (cx as number) ? 'start' : 'end'} dominantBaseline="central">
      {`${(payload as StatusMetric).status} ${percentageValue.toFixed(0)}%`}
    </text>
  );
};

export default function DashboardClientPage({
  orderMetrics,
  productMetrics,
  initialLoading,
  initialError,
}: DashboardClientPageProps) {
  const t = useTranslations('Pages.Dashboard');

  if (initialLoading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('Title')}</h2>
        <p>Carregando dados do dashboard...</p>
      </div>
    );
  }

  if (initialError) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('Title')}</h2>
        <p className={styles.error_message}>{initialError}</p>
      </div>
    );
  }

  const totalRevenueFormatted = orderMetrics?.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('Title')}</h2>

      <div className={styles.metrics_grid}>
        <div className={styles.metric_card}>
          <h3>{t('TotalOrders')}</h3>
          <p>{orderMetrics?.totalOrders}</p>
        </div>
        <div className={styles.metric_card}>
          <h3>{t('TotalRevenue')}</h3>
          <p>{totalRevenueFormatted}</p>
        </div>
        <div className={styles.metric_card}>
          <h3>{t('TotalProducts')}</h3>
          <p>{productMetrics?.totalProducts}</p>
        </div>
        <div className={styles.metric_card}>
          <h3>{t('LowStockProducts')}</h3>
          <p>{productMetrics?.lowStockProducts} ({t('Below')} {productMetrics?.lowStockThreshold})</p>
        </div>
      </div>

      <div className={styles.charts_grid}>
        <div className={styles.chart_card}>
          <h3>{t('OrdersByStatus')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderMetrics?.statusMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name={t('OrdersCount')} fill={CHART_COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chart_card}>
          <h3>{t('RevenueByStatus')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderMetrics?.statusMetrics}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill={CHART_COLORS[0]}
                dataKey="revenue"
                nameKey="status"
                label={CustomPieLabel} 
              >
                {orderMetrics?.statusMetrics && orderMetrics.statusMetrics.length > 0 && // Add conditional check
                  orderMetrics.statusMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length] || '#CCCCCC'} /> // Added fallback
                  ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
