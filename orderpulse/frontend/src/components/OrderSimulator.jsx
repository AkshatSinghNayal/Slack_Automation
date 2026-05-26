import { useState } from 'react';
import axios from 'axios';

const OrderSimulator = ({ onOrderCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState('Jane');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [totalPrice, setTotalPrice] = useState('250.00');
  const [itemTitle, setItemTitle] = useState('Super-Deluxe Course');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const randomId = Math.floor(100000000 + Math.random() * 900000000);
    const randomItemId = Math.floor(10000000 + Math.random() * 90000000);

    const payload = {
      id: randomId,
      email: email.trim(),
      total_price: totalPrice.trim(),
      currency: 'USD',
      created_at: new Date().toISOString(),
      customer: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        orders_count: 0,
        total_spent: '0.00'
      },
      line_items: [
        {
          id: randomItemId,
          title: itemTitle.trim(),
          price: totalPrice.trim(),
          quantity: 1,
          sku: 'SKU-SIMULATED'
        }
      ]
    };

    try {
      // POST directly to the test webhook endpoint
      await axios.post('http://localhost:3001/api/webhook/test', payload);
      setSuccessMsg('🎉 Order simulated successfully! Check the dashboard stats & Slack / Email alerts.');
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMsg('');
        if (onOrderCreated) {
          onOrderCreated();
        }
      }, 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to simulate order webhook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simulator-container">
      <button className="btn btn--primary" onClick={() => setIsOpen(true)}>
        🔌 Simulate Shopify Webhook
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Simulate Shopify Webhook</h3>
              <button className="modal-close" onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSimulate}>
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Item Name</label>
                <input 
                  type="text" 
                  value={itemTitle} 
                  onChange={(e) => setItemTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Order Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={totalPrice} 
                  onChange={(e) => setTotalPrice(e.target.value)} 
                  required 
                />
              </div>

              {successMsg && <div className="alert-message alert-message--success">{successMsg}</div>}
              {errorMsg && <div className="alert-message alert-message--danger">{errorMsg}</div>}

              <div className="modal-footer">
                <button type="button" className="btn btn--secondary" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Simulating...' : '🚀 Submit Order Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSimulator;
