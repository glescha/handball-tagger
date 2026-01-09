import React from 'react';
import { THEME } from '../../styles/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  activeColor?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  active, activeColor = "#8899ac", fullWidth, style, children, ...props 
}) => (
  <button
    style={{
      padding: "12px 2px",
      borderRadius: 8,
      border: active ? `2px solid ${activeColor}` : `1px solid ${THEME.divider}`,
      background: active ? `${activeColor}22` : "transparent",
      color: active ? activeColor : "#8899ac",
      fontWeight: "bold",
      fontSize: "12px",
      cursor: props.disabled ? "not-allowed" : "pointer",
      width: fullWidth ? "100%" : "auto",
      whiteSpace: "nowrap",
      transition: "all 0.1s",
      opacity: props.disabled ? 0.5 : 1,
      ...style
    }}
    {...props}
  >
    {children}
  </button>
);
