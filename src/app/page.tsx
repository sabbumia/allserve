"use client";


export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        color: "#ffffff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          padding: "50px 40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <h1 style={{ fontSize: "3.5rem", marginBottom: "0.8rem" }}>
          Welcome to <span style={{ color: "#4fd1c5" }}>AllServe</span>
        </h1>

        {/* Coming Soon Tag */}
        <span className="coming-soon text-4xl text-red-500">🚀 Coming Soon 🚀</span>

        <p
          style={{
            fontSize: "1.3rem",
            marginTop: "2.5rem",
            marginBottom: "3rem",
            color: "#d1d5db",
          }}
        >
          Your one-stop platform for all services.
        </p>

        <h2
          style={{
            fontSize: "2.3rem",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          Created by{" "}
          <span style={{ color: "#fbbf24" }}>Sazzad Hossain</span>
        </h2>

        <a
          href="https://sazzadadib.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="portfolio-link"
        >
          Visit My Portfolio
        </a>

        <style jsx>{`
          .coming-soon {
            display: inline-block;
            margin-top: 6px;
            padding: 6px 16px;
            font-size: 0.9rem;
            font-weight: 600;
            color: #0f2027;
            background: linear-gradient(90deg, #fbbf24, #f59e0b);
            border-radius: 999px;
            box-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
            letter-spacing: 0.5px;
          }

          .portfolio-link {
            display: inline-block;
            margin-top: 10px;
            font-size: 1.1rem;
            color: #4fd1c5;
            text-decoration: none;
            border: 2px solid #4fd1c5;
            padding: 10px 22px;
            border-radius: 30px;
            transition: all 0.3s ease;
          }

          .portfolio-link:hover {
            background: #4fd1c5;
            color: #0f2027;
          }
        `}</style>
      </div>
    </main>
  );
}
