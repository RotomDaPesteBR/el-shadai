'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import styles from './DashboardClientPage.module.scss';

// Updated interfaces to match new service responses
interface OrderMetrics {
  totalOrders: number;
  totalRevenue: number;
  monthlySales: number[];
  categoryMetrics: { name: string; value: number }[];
}

interface ProductMetrics {
  totalProducts: number;
  lowStockProducts: {
    id: number;
    name: string;
    stock: number;
    image?: string | null;
  }[];
}

interface DashboardClientPageProps {
  orderMetrics: OrderMetrics | null;
  productMetrics: ProductMetrics | null;
  initialLoading: boolean;
  initialError: string | null;
}

const CHART_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042'
];

export default function DashboardClientPage({
  orderMetrics,
  productMetrics,
  initialLoading,
  initialError
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

  const totalRevenueFormatted = orderMetrics?.totalRevenue.toLocaleString(
    'pt-BR',
    { style: 'currency', currency: 'BRL' }
  );

  // Prepare data for the monthly sales chart
  const monthLabels = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez'
  ];
  const monthlySalesData = orderMetrics?.monthlySales.map((total, index) => ({
    month: monthLabels[index],
    total: total
  }));

  return (
    <div className={styles.container}>
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
          {productMetrics?.lowStockProducts &&
          productMetrics.lowStockProducts.length > 0 ? (
            <ul className={styles.low_stock_list}>
              {productMetrics.lowStockProducts.map(product => (
                <li key={product.id} className={styles.low_stock_item}>
                  <Image
                    src={product.image ?? '/images/food.png'}
                    alt={product.name}
                    width={30}
                    height={30}
                  />
                  <span>
                    {product.name} ({product.stock} {t('Units')})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>{t('NoLowStockProducts')}</p>
          )}
        </div>
      </div>

      <div className={styles.charts_grid}>
        <div className={styles.chart_card}>
          <h3>{t('MonthlySales')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })
                }
              />
              <Legend />
              <Bar
                dataKey="total"
                name={t('TotalSales')}
                fill={CHART_COLORS[0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chart_card}>
          <h3>{t('SalesByCategory')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderMetrics?.categoryMetrics}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill={CHART_COLORS[1]}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`
                }
              >
                {orderMetrics?.categoryMetrics.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
