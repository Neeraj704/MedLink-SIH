import React, { forwardRef } from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router-dom";

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href?: string;
  to?: string;
  replace?: boolean;
  state?: unknown;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, to, children, ...props }, ref) => {
    const target = to || href || "#";

    if (
      target.startsWith("#") ||
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:") ||
      target.startsWith("tel:")
    ) {
      return (
        <a ref={ref} href={target} {...props}>
          {children}
        </a>
      );
    }

    return (
      <RouterLink ref={ref} to={target} {...(props as Omit<RouterLinkProps, "to">)}>
        {children}
      </RouterLink>
    );
  }
);

Link.displayName = "Link";

export default Link;
