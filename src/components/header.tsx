"use client";

import React, { memo, useState, useCallback, useMemo } from "react";
import { UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = memo(function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  // Memoize search handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // Memoize input className
  const inputClassName = useMemo(
    () =>
      "w-full pl-10 bg-slate-50/80 border border-slate-200 text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm transition-all duration-200 focus-visible:ring-slate-300 focus-visible:border-slate-400 hover:border-slate-300",
    []
  );

  // Memoize button className
  const buttonClassName = useMemo(() => "flex items-center gap-2", []);

  // Memoize search icon
  const searchIcon = useMemo(
    () => (
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      />
    ),
    []
  );

  return (
    <header className="border-b" role="banner" aria-label="Application header">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-96">
            <Input
              type="search"
              placeholder="Search transactions, accounts, categories..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={inputClassName}
              aria-label="Search transactions, accounts, and categories"
              aria-describedby="search-help"
            />
            {searchIcon}
            <div id="search-help" className="sr-only">
              Search across all your financial data including transactions,
              accounts, and categories
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            className={buttonClassName}
            aria-label="User menu"
            aria-expanded="false"
            aria-haspopup="menu"
          >
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm font-medium" aria-hidden="true">
              Usuario
            </span>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
});
