"use client";

import React, {
  memo,
  useState,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { SheetTrigger } from "@/components/ui/sheet";
import { useMedia } from "react-use";
import { usePathname, useRouter } from "next/navigation";

import { NavButton } from "@/components/layout/NavButton";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

// Lazy load the Sheet component to reduce initial bundle size
const Sheet = lazy(() =>
  import("@/components/ui/sheet").then((mod) => ({ default: mod.Sheet }))
);
const SheetContent = lazy(() =>
  import("@/components/ui/sheet").then((mod) => ({ default: mod.SheetContent }))
);

// Definir rutas como constantes para evitar re-renderizados
const routes = [
  {
    href: "/",
    label: "Overview",
  },
  {
    href: "/transactions",
    label: "Transactions",
  },
  {
    href: "/accounts",
    label: "Accounts",
  },
  {
    href: "/savings",
    label: "Savings",
  },
  {
    href: "/achievements",
    label: "Achievements",
  },
  {
    href: "/categories",
    label: "Categories",
  },
  {
    href: "/settings",
    label: "Settings",
  },
] as const;

export const Navigation = memo(() => {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMedia("(max-width: 1024px)", false);

  // Memoize onClick handler to prevent unnecessary re-renders
  const onClick = useCallback(
    (href: string) => {
      setIsOpen(false);
      router.push(href);
    },
    [router]
  );

  // Memoize setIsOpen callback for sheet
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  // Memoize menu button props for performance
  const menuButtonProps = useMemo(
    () => ({
      variant: "outline" as const,
      size: "sm" as const,
      className:
        "font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition",
      "aria-label": "Open navigation menu",
      "aria-expanded": isOpen,
      "aria-controls": "navigation-menu",
    }),
    [isOpen]
  );

  // Memoize mobile navigation JSX
  const mobileNavigation = useMemo(
    () => (
      <Suspense
        fallback={
          <Button {...menuButtonProps}>
            <Menu className="size-4" aria-hidden="true" />
          </Button>
        }
      >
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <Button {...menuButtonProps}>
              <Menu className="size-4" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="px-2"
            aria-label="Navigation menu"
          >
            <nav
              className="flex flex-col gap-y-2 pt-6"
              role="navigation"
              aria-label="Main navigation"
              id="navigation-menu"
            >
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={route.href === pathname ? "secondary" : "ghost"}
                  onClick={() => onClick(route.href)}
                  className="w-full justify-start"
                  aria-current={route.href === pathname ? "page" : undefined}
                  role="menuitem"
                >
                  {route.label}
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </Suspense>
    ),
    [isOpen, handleOpenChange, menuButtonProps, pathname, onClick]
  );

  // Memoize desktop navigation JSX
  const desktopNavigation = useMemo(
    () => (
      <nav
        className="hidden lg:flex items-center gap-x-2 overflow-x-auto"
        role="navigation"
        aria-label="Main navigation"
      >
        {routes.map((route) => (
          <NavButton
            key={route.href}
            href={route.href}
            label={route.label}
            isActive={pathname === route.href}
          />
        ))}
      </nav>
    ),
    [pathname]
  );

  if (isMobile) {
    return mobileNavigation;
  }

  return desktopNavigation;
});

Navigation.displayName = "Navigation";
