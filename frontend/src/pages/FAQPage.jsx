const sectionCard = {
  background: "#0f0f10",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: 20,
  marginBottom: 14,
};

export default function FAQPage() {
  return (
    <div className="container py-5" style={{ maxWidth: 920 }}>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", marginBottom: 8 }}>
        Frequently Asked Questions
      </h1>
      <p style={{ color: "#aaa", marginBottom: 24 }}>
        Quick answers about shipping, returns, payments, and your account.
      </p>

      <div style={sectionCard}>
        <h4>How long does delivery take?</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          Standard UK delivery is usually 2-5 working days. You will receive order updates in your account order history.
        </p>
      </div>

      <div style={sectionCard}>
        <h4>Can I return an item?</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          Yes. If your order is eligible, you can submit a refund/return request from your refund page after purchase.
        </p>
      </div>

      <div style={sectionCard}>
        <h4>How do I track my order status?</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          Go to <strong>My Orders</strong> to view order status updates such as pending, processing, shipped, or delivered.
        </p>
      </div>

      <div style={sectionCard}>
        <h4>How can I change my password?</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          Open your profile menu and select <strong>Change Password</strong>. You can also use Forgot Password if needed.
        </p>
      </div>
    </div>
  );
}

