"use client";

import qs from "query-string";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGetSummary } from "@/features/api/use-get-summary";
import { useState } from "react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { ChevronDown, Calendar as CalendarIcon } from "lucide-react";

import { cn, formatDateRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export const DateFilter = () => {
  const router = useRouter();
  const pathname = usePathname();

  const params = useSearchParams();
  const accountId = params.get("accountId");
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  const paramState = {
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : defaultTo,
  };

  const [date, setDate] = useState<DateRange | undefined>(
    paramState.from && paramState.to
      ? {
          from: paramState.from,
          to: paramState.to,
        }
      : undefined
  );

  const pushToUrl = (dateRange: DateRange | undefined) => {
    const query = {
      from: format(dateRange?.from || defaultFrom, "yyyy-MM-dd"),
      to: format(dateRange?.to || defaultTo, "yyyy-MM-dd"),
      accountId,
    };

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  };

  const onReset = () => {
    setDate(undefined);
    pushToUrl(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={false}
          variant="outline"
          className="lg:w-auto w-full h-10 rounded-lg px-3 font-medium flex items-center gap-2 bg-white border border-slate-200 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 outline-none"
        >
          <CalendarIcon className="size-4 text-blue-500" />
          <span className="truncate max-w-[120px] md:max-w-[180px] text-foreground">
            {formatDateRange(paramState)}
          </span>
          <ChevronDown className="ml-2 size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="lg:w-auto w-full p-0" align="start">
        <CalendarComponent
          disabled={false}
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
        <div className="p-4 w-full flex items-center gap-x-2">
          <PopoverClose asChild>
            <Button
              onClick={() => pushToUrl(date)}
              disabled={!date?.from || !date?.to}
              className="w-full"
              variant="outline"
            >
              Apply
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};
