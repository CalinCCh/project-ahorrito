import React, { memo, useMemo } from "react";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { IconType } from "react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CurrencyCountUp } from "@/components/data-display/CurrencyCountUp";
import { Skeleton } from "@/components/ui/skeleton";

const boxVariant = cva("shrink-0 rounded-xl p-4", {
  variants: {
    variant: {
      default:
        "bg-gradient-to-br from-blue-500/10 to-blue-600/20 border border-blue-200/50",
      success:
        "bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 border border-emerald-200/50",
      danger:
        "bg-gradient-to-br from-rose-500/10 to-rose-600/20 border border-rose-200/50",
      warning:
        "bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 border border-yellow-200/50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const iconVariant = cva("size-7", {
  variants: {
    variant: {
      default: "fill-blue-600 text-blue-600",
      success: "fill-emerald-600 text-emerald-600",
      danger: "fill-rose-600 text-rose-600",
      warning: "fill-yellow-600 text-yellow-600",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BoxVariants = VariantProps<typeof boxVariant>;
type IconVariants = VariantProps<typeof iconVariant>;

interface DataCardProps extends BoxVariants, IconVariants {
  icon: IconType;
  title: string;
  value?: number;
  percentageChange?: number;
  currency?: string;
}

export const DataCard = memo(function DataCard({
  icon: Icon,
  title,
  value = 0,
  variant,
  percentageChange = 0,
  currency = "EUR",
}: DataCardProps) {
  const boxStyles = useMemo(
    () =>
      cn(
        boxVariant({ variant }),
        "transition-all duration-200 hover:scale-105"
      ),
    [variant]
  );

  const iconStyles = useMemo(() => cn(iconVariant({ variant })), [variant]);

  const percentageStyles = useMemo(
    () =>
      cn(
        "text-sm font-medium line-clamp-1 flex items-center gap-1",
        percentageChange > 0 && "text-emerald-600",
        percentageChange < 0 && "text-rose-600",
        percentageChange === 0 && "text-gray-500"
      ),
    [percentageChange]
  );

  const badgeStyles = useMemo(
    () =>
      cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
        percentageChange > 0 && "bg-emerald-100 text-emerald-700",
        percentageChange < 0 && "bg-rose-100 text-rose-700"
      ),
    [percentageChange]
  );

  const changeText = useMemo(
    () => (percentageChange === 0 ? "No change" : "from last period"),
    [percentageChange]
  );

  const isPositiveChange = percentageChange > 0;
  const isNegativeChange = percentageChange < 0;
  const hasChange = percentageChange !== 0;
  return (
    <Card
      className="border border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-300/80"
      role="article"
      aria-label={`${title} financial data card`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-x-6 pb-4">
        <div className="space-y-3">
          <CardTitle className="text-lg font-semibold text-gray-700 line-clamp-1">
            {title}
          </CardTitle>
        </div>
        <div className={boxStyles} aria-hidden="true">
          <Icon className={iconStyles} />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          <h1
            className="font-bold text-3xl text-gray-900 line-clamp-1 break-all"
            aria-label={`Current value: ${value} ${currency}`}
          >
            <CurrencyCountUp
              end={value}
              currency={currency}
              preserveValue
              duration={1.5}
            />
          </h1>
          <p className={percentageStyles}>
            {hasChange && (
              <span
                className={badgeStyles}
                aria-label={`${
                  isPositiveChange ? "Increased" : "Decreased"
                } by ${Math.abs(percentageChange).toFixed(2)} percent`}
              >
                {formatPercentage(percentageChange, { addPrefix: true })}
              </span>
            )}
            <span className="text-gray-600">{changeText}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

export const DataCardLoading = memo(function DataCardLoading() {
  return (
    <Card
      className="border border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-lg h-[220px]"
      role="status"
      aria-live="polite"
      aria-label="Loading financial data"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-x-6 pb-4">
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="size-14 rounded-xl" />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          <Skeleton className="h-9 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
