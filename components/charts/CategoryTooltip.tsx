import React, { memo, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface CategoryTooltipProps {
  active?: boolean;
  payload?: any[];
  currency?: string;
}

export const CategoryToolTip = memo(function CategoryToolTip({
  active,
  payload,
  currency = "EUR",
}: CategoryTooltipProps) {
  // Early return for performance
  if (!active || !payload || payload.length === 0) return null;

  const data = useMemo(() => {
    const name = payload[0]?.payload?.name || "";
    const value = payload[0]?.value || 0;

    return {
      name,
      formattedValue: formatCurrency(value * -1, currency),
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
      aria-label={`Category ${data.name} tooltip`}
    >
      <div className={headerStyles}>{data.name}</div>
      <Separator />
      <div className="p-2 px-3 space-y-1">
        <div className={rowStyles}>
          <div className={labelStyles}>
            <div
              className="size-1.5 bg-rose-500 rounded-full"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">Expenses</p>
          </div>
          <p className={valueStyles}>{data.formattedValue}</p>
        </div>
      </div>
    </div>
  );
});
