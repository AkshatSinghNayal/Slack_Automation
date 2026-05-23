import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const OrderChart = ({ data }) => {
  return (
    <section className="chart">
      <div className="section-header">
        <h2>Order volume (last 14 days)</h2>
        <p>Stacked by customer classification</p>
      </div>
      <div className="chart__body">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="VIP" stackId="a" fill="#f59e0b" />
            <Bar dataKey="risky" stackId="a" fill="#ef4444" />
            <Bar dataKey="new" stackId="a" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default OrderChart;
