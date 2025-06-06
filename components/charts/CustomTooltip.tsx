import React, { memo, useMemo } from "react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  currency?: string;
}

export const CustomTooltip = memo(function CustomTooltip({
  active,
  payload,
  currency = "EUR",
}: CustomTooltipProps) {
  // Early return for performance
  if (!active || !payload || payload.length === 0) return null;

  const data = useMemo(() => {
    const date = payload[0]?.payload?.date;
    const income = payload[0]?.value || 0;
    const expenses = payload[1]?.value || 0;

    return {
      formattedDate: date ? format(date, "MMM dd, yyyy") : "",
      formattedIncome: formatCurrency(income, currency),
      formattedExpenses: formatCurrency(expenses * -1, currency),
    };
  }, [payload, currency]);

  const containerStyles = useMemo(
    () => "rounded-sm bg-white shadow-sm border overflow-hidden",
    []
  );

  const headerStyles = useMemo(
    () => "text-sm p-2 px-3 bg-muted text-muted-foreground",
    []
  );

  const rowStyles = useMemo(
    () => "flex items-center justify-between gap-x-4",
    []
  );

  const labelStyles = useMemo(() => "flex items-center gap-x-2", []);

  const valueStyles = useMemo(() => "text-sm text-right font-medium", []);

  return (
    <div
      className={containerStyles}
      role="tooltip"
      aria-label="Chart data tooltip"
    >
      <div className={headerStyles}>{data.formattedDate}</div>
      <Separator />
      <div className="p-2 px-3 space-y-1">
        <div className={rowStyles}>
          <div className={labelStyles}>
            <div
              className="size-1.5 bg-blue-500 rounded-full"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">Income</p>
          </div>
          <p className={valueStyles}>{data.formattedIncome}</p>
        </div>
        <div className={rowStyles}>
          <div className={labelStyles}>
            <div
              className="size-1.5 bg-rose-500 rounded-full"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">Expenses</p>
          </div>
          <p className={valueStyles}>{data.formattedExpenses}</p>
        </div>
      </div>
    </div>
  );
});
