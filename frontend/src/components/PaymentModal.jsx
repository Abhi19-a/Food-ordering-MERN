import { useState } from 'react';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, onPayment, totalAmount }) => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      // Format card number with spaces
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return;
    } else if (name === 'expiryDate') {
      // Format expiry date as MM/YY
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) return;
    } else if (name === 'cvv') {
      // Only numbers, max 3 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
      if (cardNumber.length !== 16) {
        alert('Please enter a valid 16-digit card number');
        return false;
      }
      if (!cardDetails.cardHolder.trim()) {
        alert('Please enter card holder name');
        return false;
      }
      if (cardDetails.expiryDate.length !== 5) {
        alert('Please enter valid expiry date (MM/YY)');
        return false;
      }
      if (cardDetails.cvv.length !== 3) {
        alert('Please enter valid CVV');
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        alert('Please enter a valid UPI ID');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPayment({
        method: paymentMethod === 'cod' ? 'Cash on Delivery' : 
                paymentMethod === 'card' ? 'Card Payment' : 'UPI Payment',
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
        transactionId: paymentMethod === 'cod' ? null : `TXN${Date.now()}`
      });
    }, 2000);
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>Choose Payment Method</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>

        <div className="payment-modal-body">
          <div className="payment-amount">
            <span>Total Amount:</span>
            <span className="amount">₹{totalAmount.toFixed(2)}</span>
          </div>

          <div className="payment-methods">
            {/* Cash on Delivery */}
            <div 
              className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('cod')}
            >
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
              />
              <div className="payment-option-content">
                <div className="payment-icon">💵</div>
                <div className="payment-details">
                  <h3>Cash on Delivery</h3>
                  <p>Pay when you receive your order</p>
                </div>
              </div>
            </div>

            {/* Card Payment */}
            <div 
              className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
              />
              <div className="payment-option-content">
                <div className="payment-icon">💳</div>
                <div className="payment-details">
                  <h3>Credit / Debit Card</h3>
                  <p>Pay securely using your card</p>
                </div>
              </div>
            </div>

            {/* UPI Payment */}
            <div 
              className={`payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('upi')}
            >
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === 'upi'}
                onChange={() => setPaymentMethod('upi')}
              />
              <div className="payment-option-content">
                <div className="payment-icon">📱</div>
                <div className="payment-details">
                  <h3>UPI Payment</h3>
                  <p>Pay using UPI ID</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Details Form */}
          {paymentMethod === 'card' && (
            <div className="payment-form">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardChange}
                />
              </div>
              <div className="form-group">
                <label>Card Holder Name</label>
                <input
                  type="text"
                  name="cardHolder"
                  placeholder="John Doe"
                  value={cardDetails.cardHolder}
                  onChange={handleCardChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={handleCardChange}
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={handleCardChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* UPI Form */}
          {paymentMethod === 'upi' && (
            <div className="payment-form">
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  placeholder="username@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
              <div className="upi-apps">
                <p>Or pay using:</p>
                <div className="upi-options">
                  <button className="upi-app">Google Pay</button>
                  <button className="upi-app">PhonePe</button>
                  <button className="upi-app">Paytm</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="payment-modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>
          <button 
            className="btn-pay" 
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 
             paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${totalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
