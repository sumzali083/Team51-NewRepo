const sectionCard = {
  background: "#0f0f10",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: 20,
  marginBottom: 14,
};

export default function TermsPage() {
  return (
    <div className="container py-5" style={{ maxWidth: 920 }}>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", marginBottom: 8 }}>
        Terms & Conditions
      </h1>
      <p style={{ color: "#aaa", marginBottom: 24 }}>
        Basic terms for use of the OSAI platform.
      </p>

      <div style={sectionCard}>
        <h4>Account Responsibility</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          You are responsible for maintaining the confidentiality of your account credentials and activity.
        </p>
      </div>

      <div style={sectionCard}>
        <h4>Orders & Availability</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          Product availability depends on live stock. Orders are processed based on current inventory and system validation.
        </p>
      </div>

      <div style={sectionCard}>
        <h4>Returns & Refunds</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          Refund requests are reviewed by admins and processed according to the Returns Policy.
        </p>
      </div>

      <div style={sectionCard}>
        <h4>Acceptable Use</h4>
        <p style={{ color: "#bfbfbf", margin: 0 }}>
          Users must not misuse the platform, attempt unauthorized access, or submit harmful content.
        </p>
      </div>
    </div>
  );
}

