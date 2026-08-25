"use client";

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

const activeBackground = "#cfea89";
const activeColor = "#ffffff";

export type TButton = ButtonHTMLAttributes<HTMLButtonElement> & {
  width?: string;
  height?: string;
  borderRadius?: string;
  children?: ReactNode;
  fontColor?: string;
  fontSize?: string;
  backgroundColor?: string;
  hoverColor?: string;
  hoverBorder?: string;
  hoverFontColor?: string;
  margin?: string;
  border?: string;
  padding?: string;
  position?: string;
  right?: string;
  top?: string;
  isActive?: boolean;
};

const Button = ({
  children,
  width,
  height,
  borderRadius,
  fontColor,
  fontSize,
  backgroundColor,
  hoverColor,
  hoverBorder,
  hoverFontColor,
  margin,
  border,
  padding,
  position,
  right,
  top,
  isActive,
  style,
  className = "",
  disabled,
  ...rest
}: TButton) => {
  const buttonStyle: CSSProperties = {
    width,
    height,
    borderRadius,
    backgroundColor: isActive ? activeBackground : backgroundColor,
    color: isActive ? activeColor : fontColor,
    fontSize,
    margin,
    border: isActive ? "none" : border,
    padding,
    position: (position as CSSProperties["position"]) || "relative",
    right,
    top,
    ...(style ?? {}),
  };

  return (
    <button
      {...rest}
      disabled={disabled}
      style={buttonStyle}
      className={[
        "inline-flex cursor-pointer items-center justify-center text-center transition-colors duration-200",
        "disabled:cursor-not-allowed disabled:bg-[#d6dfb8] disabled:text-[#6c6c6c]",
        hoverColor || hoverBorder || hoverFontColor
          ? "hover:bg-[#cfea89] hover:text-white"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={(event) => {
        if (disabled) return;
        if (hoverColor) event.currentTarget.style.backgroundColor = hoverColor;
        if (hoverBorder) event.currentTarget.style.border = hoverBorder;
        if (hoverFontColor) event.currentTarget.style.color = hoverFontColor;
      }}
      onMouseLeave={(event) => {
        if (disabled) return;
        event.currentTarget.style.backgroundColor = isActive
          ? activeBackground
          : backgroundColor || "";
        event.currentTarget.style.border = isActive ? "none" : border || "";
        event.currentTarget.style.color = isActive ? activeColor : fontColor || "";
      }}
    >
      {children}
    </button>
  );
};

export default Button;
