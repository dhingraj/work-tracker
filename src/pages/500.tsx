export default function Custom500Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#f2f2f7",
        color: "#1c1c1e",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          borderRadius: "24px",
          border: "1px solid #d7d7db",
          background: "#ffffff",
          padding: "24px",
          textAlign: "center",
          boxShadow: "0 1px 2px rgba(60, 60, 67, 0.04)",
        }}
      >
        <p style={{ margin: 0, fontSize: "14px", color: "#8e8e93" }}>Error</p>
        <h1 style={{ margin: "8px 0 0", fontSize: "32px", lineHeight: 1.1 }}>
          Something went wrong
        </h1>
        <p style={{ margin: "12px 0 0", fontSize: "15px", lineHeight: 1.5, color: "#636366" }}>
          Try again in a moment.
        </p>
      </div>
    </main>
  );
}
