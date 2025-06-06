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
          className="h-11 px-4 text-sm flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 shadow-sm transition-all duration-200 min-w-[220px] max-w-[320px] cursor-pointer"
        >
          <CalendarIcon className="size-4 text-slate-600" />
          <span className="truncate max-w-[180px] text-slate-700 font-medium">
            {formatDateRange(paramState)}
          </span>
          <ChevronDown className="size-3 text-slate-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto max-w-[95vw] p-0 bg-white/95 backdrop-blur-sm border border-blue-200 shadow-lg rounded-lg"
        align="start"
        side="bottom"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={16}
      >
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
              className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
              variant="default"
            >
              Apply
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button
              onClick={onReset}
              className="w-full cursor-pointer border-blue-200 text-slate-700 hover:bg-blue-50"
              variant="outline"
            >
              Reset
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};
