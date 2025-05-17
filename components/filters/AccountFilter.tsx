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
          className="lg:w-auto w-full h-10 rounded-lg px-3 font-medium flex items-center gap-2 bg-white border border-slate-200 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 outline-none"
        >
          <UserCircle2 className="size-4 text-blue-500" />
          <span className="truncate max-w-[120px] md:max-w-[180px] text-foreground">
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
              return "Select account";
            })()}
          </span>
          <ChevronDown className="ml-2 size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-1 w-[200px] bg-white border shadow-md rounded-md"
        align="start"
        sideOffset={5}
      >
        <div
          onClick={() => handleSelect("all")}
          className="px-3 py-2 text-sm text-gray-900 hover:bg-slate-100 cursor-pointer rounded-sm"
        >
          All accounts
        </div>
        {accounts &&
          accounts.length > 0 &&
          accounts.map((item) => (
            <div
              key={item.account.id}
              onClick={() => handleSelect(item.account.id)}
              className="px-3 py-2 text-sm text-gray-900 hover:bg-slate-100 cursor-pointer rounded-sm"
            >
              {item.account.name || item.account.id}
            </div>
          ))}
        {isLoadingAccounts && (
          <div className="px-3 py-2 text-sm text-gray-600">
            Loading accounts...
          </div>
        )}
        {!isLoadingAccounts && !accounts?.length && (
          <div className="px-3 py-2 text-sm text-gray-600">
            No accounts available.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
