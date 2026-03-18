const sectionCard = {
  background: "#0f0f10",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: 20,
  marginBottom: 14,
};

export default function ReturnsPolicyPage() {
  return (
    <div className="container py-5" style={{ maxWidth: 920 }}>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", marginBottom: 8 }}>
        Returns & Refund Policy
      </h1>
      <p style={{ color: "#aaa", marginBottom: 24 }}>
        Our policy for return requests and refunds.
      </p>

      <div style={sectionCard}>
        <h4>Return Window</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          Return requests should be submitted within 30 days of delivery.
        </p>
      </div>

      <div style={sectionCard}>
        <h4>How to Request a Return</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          Use your refund page to submit a request and include a clear reason. Admins will review and update the request status.
        </p>
      </div>

      <div style={sectionCard}>
        <h4>Refund Processing</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          Approved refunds move through processing and refunded stages. Any reference/notes are shown in your refund history.
        </p>
      </div>

      <div style={sectionCard}>
        <h4>Non-returnable Cases</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          Items with clear signs of heavy use or damage caused after delivery may be rejected after review.
        </p>
      </div>
    </div>
  );
}

