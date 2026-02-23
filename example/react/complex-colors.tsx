import React, { useState, useEffect } from "react";

interface ColorBoxProps {
  title: string;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

const ColorBox: React.FC<ColorBoxProps> = ({ title, color, backgroundColor, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        color: color || "#333333",
        backgroundColor: backgroundColor || "#f0f0f0",
        padding: "16px",
        margin: "8px",
        borderRadius: "8px",
        border: `2px solid ${isHovered ? "#007acc" : "#cccccc"}`,
        transition: "all 0.3s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 style={{ color: "#007acc", fontSize: "18px", marginBottom: "12px" }}>{title}</h3>
      <div style={{ color: "#fc0202", fontSize: "14px", lineHeight: "1.6" }}>{children}</div>
    </div>
  );
};

const Button: React.FC<{ variant?: "primary" | "secondary" | "danger" }> = ({
  children,
  variant = "primary",
}) => {
  const styles = {
    primary: {
      backgroundColor: "#007acc",
      color: "#ffffff",
      padding: "10px 20px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    },
    secondary: {
      backgroundColor: "#6c757d",
      color: "#ffffff",
      padding: "10px 20px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    },
    danger: {
      backgroundColor: "#dc3545",
      color: "#ffffff",
      padding: "10px 20px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    },
  };

  return <button style={styles[variant]}>{children}</button>;
};

const StatusBadge: React.FC<{ status: "success" | "warning" | "error" | "info" }> = ({
  status,
}) => {
  const statusConfig = {
    success: { backgroundColor: "#28a745", color: "#ffffff", label: "Success" },
    warning: { backgroundColor: "#ffc107", color: "#212529", label: "Warning" },
    error: { backgroundColor: "#dc3545", color: "#ffffff", label: "Error" },
    info: { backgroundColor: "#17a2b8", color: "#ffffff", label: "Info" },
  };

  const config = statusConfig[status];

  return (
    <span
      style={{
        backgroundColor: config.backgroundColor,
        color: config.color,
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "bold",
        display: "inline-block",
      }}
    >
      {config.label}
    </span>
  );
};

const ColorPalette: React.FC = () => {
  const colors = [
    { name: "Red", hex: "#ff0000", description: "Bright red" },
    { name: "Blue", hex: "#0000ff", description: "Deep blue" },
    { name: "Green", hex: "#00ff00", description: "Lime green" },
    { name: "Yellow", hex: "#ffff00", description: "Bright yellow" },
    { name: "Purple", hex: "#800080", description: "Royal purple" },
    { name: "Orange", hex: "#ffa500", description: "Vibrant orange" },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "24px" }}>
      {colors.map((color) => (
        <div
          key={color.name}
          style={{
            backgroundColor: color.hex,
            color: color.name === "Yellow" ? "#000000" : "#ffffff",
            padding: "16px",
            borderRadius: "8px",
            minWidth: "120px",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "8px" }}>
            {color.name}
          </div>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>{color.hex}</div>
          <div style={{ fontSize: "11px", marginTop: "8px" }}>{color.description}</div>
        </div>
      ))}
    </div>
  );
};

const ComplexColorsExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#ffffff",
        color: "#333333",
      }}
    >
      <header
        style={{
          backgroundColor: "#007acc",
          color: "#ffffff",
          padding: "20px",
          marginBottom: "24px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "28px", color: "#ffffff" }}>
          Color Flow Complex Example
        </h1>
        <p style={{ margin: "8px 0 0 0", color: "#e3f2fd", fontSize: "14px" }}>
          Testing various color patterns in React components
        </p>
      </header>

      <nav
        style={{ marginBottom: "24px", borderBottom: "2px solid #e0e0e0", paddingBottom: "16px" }}
      >
        <button
          style={{
            backgroundColor: activeTab === "overview" ? "#007acc" : "transparent",
            color: activeTab === "overview" ? "#ffffff" : "#007acc",
            border: "2px solid #007acc",
            padding: "10px 20px",
            marginRight: "12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: activeTab === "overview" ? "bold" : "normal",
          }}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          style={{
            backgroundColor: activeTab === "details" ? "#007acc" : "transparent",
            color: activeTab === "details" ? "#ffffff" : "#007acc",
            border: "2px solid #007acc",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: activeTab === "details" ? "bold" : "normal",
          }}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
      </nav>

      {activeTab === "overview" && (
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#28a745", marginBottom: "16px", fontSize: "24px" }}>Color Boxes</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            <ColorBox title="Primary Colors" color="#ffffff" backgroundColor="#007acc">
              <p style={{ color: "#ffffff", margin: 0 }}>
                Primary color palette for the application
              </p>
            </ColorBox>
            <ColorBox title="Secondary Colors" color="#ffffff" backgroundColor="#6c757d">
              <p style={{ color: "#ffffff", margin: 0 }}>Secondary and neutral color options</p>
            </ColorBox>
            <ColorBox title="Accent Colors" color="#212529" backgroundColor="#ffc107">
              <p style={{ color: "#62a2e2", margin: 0 }}>Warning and accent color variations</p>
            </ColorBox>
          </div>
        </section>
      )}

      {activeTab === "details" && (
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#dc3545", marginBottom: "16px", fontSize: "24px" }}>
            Button Variants
          </h2>
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>

          <h2 style={{ color: "#17a2b8", marginBottom: "16px", fontSize: "24px" }}>
            Status Badges
          </h2>
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <StatusBadge status="success" />
            <StatusBadge status="warning" />
            <StatusBadge status="error" />
            <StatusBadge status="info" />
          </div>

          <h2 style={{ color: "#800080", marginBottom: "16px", fontSize: "24px" }}>
            Color Palette
          </h2>
          <ColorPalette />
        </section>
      )}

      {showNotification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "#28a745",
            color: "#ffffff",
            padding: "16px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px", color: "#ffffff" }}>
            ✓ Action completed successfully!
          </p>
        </div>
      )}

      <footer
        style={{
          marginTop: "48px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          color: "#6c757d",
          borderTop: "1px solid #e9ecef",
          borderRadius: "8px",
          fontSize: "12px",
        }}
      >
        <p style={{ margin: "0 0 8px 0", color: "#495057" }}>
          Color Flow Extension - Complex React Example
        </p>
        <p style={{ margin: 0, color: "#6c757d" }}>
          This file demonstrates various color patterns for testing color visualization
        </p>
      </footer>
    </div>
  );
};

export default ComplexColorsExample;
