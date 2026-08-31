import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(180deg, #f4f4f4 0%, #efefef 100%)",
      fontFamily: "Anuphan, sans-serif",
      color: "#1f2937"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "480px",
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(21, 73, 154, 0.12)",
        borderRadius: "24px",
        boxShadow: "0 12px 30px rgba(17, 38, 75, 0.08)",
        padding: "32px 24px",
        textAlign: "center"
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          margin: "0 auto 16px",
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          background: "rgba(21, 73, 154, 0.08)",
          fontSize: "2rem",
          fontWeight: 700,
          color: "#15499a"
        }}>
          404
        </div>

        <h1 style={{ margin: "0 0 12px", fontSize: "2rem" }}>Page not found</h1>
        <p style={{ margin: "0 0 20px", color: "#475569", lineHeight: 1.6 }}>
          ไม่มีหน้านี้จ้า กลับเนอะ
        </p>

        <Link
          to="/"
          style={{
            display: "inline-block",
            borderRadius: "12px",
            padding: "12px 18px",
            background: "linear-gradient(135deg, #15499a 0%, #0f386d 100%)",
            color: "#fff",
            fontWeight: 700,
            textDecoration: "none"
          }}
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
