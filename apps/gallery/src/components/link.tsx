import type { AnchorHTMLAttributes } from "react";
import { isPlainClick } from "../lib/router.js";

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  onNavigate: (to: string) => void;
}

/** An in-app link: a real <a href> that navigates without a reload on a plain click. */
export function Link({ to, onNavigate, onClick, children, ...props }: LinkProps) {
  return (
    <a
      {...props}
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (!isPlainClick(e)) return;
        e.preventDefault();
        onNavigate(to);
      }}
    >
      {children}
    </a>
  );
}
