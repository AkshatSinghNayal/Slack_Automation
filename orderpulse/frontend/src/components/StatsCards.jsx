const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

const StatsCards = ({ stats }) => {
  const cards = [
    {
      label: 'Total Orders',
      value: stats?.total ?? '--',
      className: 'card--neutral',
    },
    {
      label: 'VIP Orders',
      value: stats?.vip ?? '--',
      className: 'card--vip',
    },
    {
      label: 'Risky Orders',
      value: stats?.risky ?? '--',
      className: 'card--risky',
    },
    {
      label: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : '--',
      className: 'card--revenue',
    },
  ];

  return (
    <section className="stats">
      {cards.map((card) => (
        <div key={card.label} className={`card ${card.className}`}>
          <span className="card__label">{card.label}</span>
          <strong className="card__value">{card.value}</strong>
        </div>
      ))}
    </section>
  );
};

export default StatsCards;
