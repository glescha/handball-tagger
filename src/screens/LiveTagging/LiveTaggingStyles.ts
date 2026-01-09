import { THEME } from '../../styles/theme';

export const containerStyle = {
  padding: 10,
  background: THEME.bg,
  color: THEME.text,
  height: "100vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  boxSizing: "border-box" as const,
  overflow: "hidden"
};

export const dashboardGrid = {
  width: "100%",
  height: "calc(100% - 80px)",
  display: "grid",
  gridTemplateColumns: "250px 1fr 280px", // Fast bredd för paneler, flexibelt för plan
  gap: "15px",
  padding: "10px",
  background: THEME.panel,
  borderRadius: 16,
  border: `1px solid ${THEME.border}`
};

export const eventListContainer = {
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
  overflowY: "auto" as const,
  paddingRight: "5px"
};

export const eventCard = (phase: "ATTACK" | "DEFENSE") => ({
  background: phase === "ATTACK" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
  borderLeft: `4px solid ${phase === "ATTACK" ? "#10b981" : "#ef4444"}`,
  padding: "12px",
  borderRadius: "6px",
  fontSize: "0.9rem",
  color: "#fff",
  display: "flex",
  justifyContent: "space-between"
});
