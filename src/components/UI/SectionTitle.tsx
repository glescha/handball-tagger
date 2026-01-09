import { THEME } from '../../styles/theme';
export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontSize: "14px", color: THEME.textMuted, margin: "0 0 12px 0", letterSpacing: "1px", textTransform: "uppercase" }}>{children}</h3>
);
