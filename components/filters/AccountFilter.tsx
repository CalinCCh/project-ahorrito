"use client";

import qs from "query-string";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useGetSummary } from "@/features/api/use-get-summary";
import { UserCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

export const AccountFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const accountId = params.get("accountId") || "all";
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const [isOpen, setIsOpen] = useState(false);

  const { isLoading: isLoadingSummary } = useGetSummary();
  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts();

  const handleSelect = (value: string) => {
    const query = {
      accountId: value,
      from,
      to,
    };

    if (value === "all") {
      query.accountId = "";
    }

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          disabled={isLoadingAccounts || isLoadingSummary}
          variant="outline"
          className="h-11 px-4 text-sm flex items-center gap-2 bg-gradient-to-r from-slate-50/90 to-gray-50/90 backdrop-blur-sm border border-slate-200 rounded-lg hover:from-slate-100 hover:to-gray-100 hover:border-slate-300 shadow-sm transition-all duration-200 cursor-pointer group min-w-[140px]"
        >
          <UserCircle2 className="size-4 text-slate-600 group-hover:text-slate-700 transition-colors duration-200" />
          <span className="truncate max-w-[90px] text-slate-700 group-hover:text-slate-800 font-medium transition-colors duration-200">
            {(() => {
              if (accountId === "all" || !accountId) return "All accounts";
              if (accounts?.length) {
                const selectedAccount = accounts.find(
                  (item) => item.account.id === accountId
                );
                if (selectedAccount) {
                  return (
                    selectedAccount.account.name || selectedAccount.account.id
                  );
                }
              }
              return "Account";
            })()}
          </span>
          <ChevronDown className="size-3 text-slate-500 group-hover:text-slate-700 transition-colors duration-200" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-1 w-[200px] bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg rounded-lg overflow-hidden"
        align="start"
        sideOffset={5}
      >
        {/* Solo mostrar "All accounts" si hay más de una cuenta */}
        {accounts && accounts.length > 1 && (
          <div
            onClick={() => handleSelect("all")}
            className="px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-800 cursor-pointer rounded-lg mx-1 transition-all duration-200 font-medium"
          >
            All accounts
          </div>
        )}
        {accounts &&
          accounts.length > 0 &&
          accounts.map((item) => (
            <div
              key={item.account.id}
              onClick={() => handleSelect(item.account.id)}
              className="px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-800 cursor-pointer rounded-lg mx-1 transition-all duration-200 font-medium"
            >
              {item.account.name || item.account.id}
            </div>
          ))}
        {isLoadingAccounts && (
          <div className="px-3 py-2.5 text-sm text-slate-500 font-medium">
            Loading accounts...
          </div>
        )}
        {!isLoadingAccounts && !accounts?.length && (
          <div className="px-3 py-2.5 text-sm text-slate-500 font-medium">
            No accounts available.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
