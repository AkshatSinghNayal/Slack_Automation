import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import StatsCards from './StatsCards';
import OrderChart from './OrderChart';
import OrderTable from './OrderTable';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api/dashboard';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      const [statsRes, ordersRes, chartRes] = await Promise.all([
        axios.get(`${API_BASE}/stats`),
        axios.get(`${API_BASE}/orders`),
        axios.get(`${API_BASE}/chart`),
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setChartData(chartRes.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  }, []);

  useEffect(() => {
    const initialTimer = setTimeout(loadDashboard, 0);
    const interval = setInterval(loadDashboard, 30000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [loadDashboard]);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>OrderPulse</h1>
          <p className="dashboard__subtitle">Shopify order automation overview</p>
        </div>
        <div className="dashboard__meta">
          <span>Auto-refresh: 30s</span>
          <span>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}</span>
        </div>
      </header>

      <StatsCards stats={stats} />
      <OrderChart data={chartData} />
      <OrderTable orders={orders} />
    </div>
  );
};

export default Dashboard;
