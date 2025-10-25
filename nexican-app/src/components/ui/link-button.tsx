import { ReactNode } from "react";
import Link from "next/link";
import { clsx } from "clsx";

interface LinkButtonProps {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export default function LinkButton({
  children,
  href,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}: LinkButtonProps) {
  const baseClasses =
    "cursor-pointer relative font-semibold rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";

  const variantClasses = {
    primary: "btn-neobrutal",
    secondary: "btn-secondary",
    outline: "btn-outline",
    ghost: "text-foreground hover:bg-secondary/50 hover:shadow-neobrutal",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  if (disabled) {
    return (
      <span
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Link>
  );
}
