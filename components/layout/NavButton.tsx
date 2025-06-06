import React, { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label: string;
  isActive?: boolean;
};

export const NavButton = memo<Props>(({ href, label, isActive }) => {
  // Memoize className computation for performance
  const buttonClassName = useMemo(
    () =>
      cn(
        "w-full lg:w-auto justify-between font-normal hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition",
        isActive ? "bg-white/10 text-white" : "bg-transparent"
      ),
    [isActive]
  );

  // Memoize ARIA attributes for accessibility
  const ariaAttributes = useMemo(
    () => ({
      "aria-current": isActive ? ("page" as const) : undefined,
      "aria-label": `Navigate to ${label}${isActive ? " (current page)" : ""}`,
      role: "menuitem",
    }),
    [isActive, label]
  );

  return (
    <Button asChild size="sm" variant="outline" className={buttonClassName}>
      <Link href={href} {...ariaAttributes}>
        {label}
      </Link>
    </Button>
  );
});

NavButton.displayName = "NavButton";
