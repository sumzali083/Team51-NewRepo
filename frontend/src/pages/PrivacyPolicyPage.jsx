const sectionCard = {
  background: "#0f0f10",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: 20,
  marginBottom: 14,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-5" style={{ maxWidth: 920 }}>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", marginBottom: 8 }}>
        Privacy Policy
      </h1>
      <p style={{ color: "#aaa", marginBottom: 24 }}>
        How we handle and protect your information.
      </p>

      <div style={sectionCard}>
        <h4>What We Collect</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          We store account details, order/refund history, and profile information needed to provide the service.
        </p>
      </div>

      <div style={sectionCard}>
        <h4>How We Use Data</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          Data is used for account access, checkout, order processing, customer support, and service improvements.
        </p>
      </div>

      <div style={sectionCard}>
        <h4>Security</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          We use authenticated sessions and protected account workflows. Access to admin features is restricted to authorized users.
        </p>
      </div>

      <div style={sectionCard}>
        <h4>Your Control</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          You can update your profile details and password from your account area.
        </p>
      </div>
    </div>
  );
}

