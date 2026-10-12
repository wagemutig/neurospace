import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/*
 * Buttons from the design system: one pulse button per screen at most.
 * primary is the signature green; surface and ink are for secondary actions.
 * Text on every fill is dark ink or paper, never white.
 */
export type ButtonVariant = "primary" | "surface" | "ink";
export type ButtonShape = "round" | "round-sm" | "pill";

type Common = {
  variant?: ButtonVariant;
  shape?: ButtonShape;
  children: ReactNode;
};

function classNames(variant: ButtonVariant, shape: ButtonShape, extra?: string) {
  const base = shape === "pill" ? "pill" : "round";
  const size = shape === "round-sm" ? " round-sm" : "";
  return [base + size, `btn-${variant}`, extra].filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  shape = "pill",
  className,
  children,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={classNames(variant, shape, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  shape = "pill",
  className,
  children,
  ...rest
}: Common & LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>) {
  return (
    <Link className={classNames(variant, shape, className)} {...rest}>
      {children}
    </Link>
  );
}
