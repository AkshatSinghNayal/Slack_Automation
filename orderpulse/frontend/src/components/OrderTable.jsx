const badgeClass = (classification) => {
  if (classification === 'VIP') {
    return 'badge badge--vip';
  }

  if (classification === 'risky') {
    return 'badge badge--risky';
  }

  return 'badge badge--new';
};

const OrderTable = ({ orders }) => {
  return (
    <section className="table">
      <div className="section-header">
        <h2>Recent orders</h2>
        <p>Newest orders appear first</p>
      </div>
      <div className="table__wrapper">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Total</th>
              <th>Classification</th>
              <th>AI Summary</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {(orders || []).map((order) => (
              <tr key={order._id || order.shopifyOrderId}>
                <td>{order.shopifyOrderId}</td>
                <td>{order.customerName || 'Guest'}</td>
                <td>{order.customerEmail || '-'}</td>
                <td>${Number(order.totalPrice || 0).toFixed(2)}</td>
                <td>
                  <span className={badgeClass(order.classification)}>
                    {order.classification || 'new'}
                  </span>
                </td>
                <td className="table__summary">{order.aiSummary || '—'}</td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OrderTable;
