"use client";

// filepath: d:\react\project-ahorrito\components\charts\Chart.tsx
import React, { memo, useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import {
  AreaChart,
  BarChart3,
  FileSearch,
  LineChart,
  Loader2,
} from "lucide-react";
import { AreaVariant } from "@/components/charts/AreaVariant";
import { BarVariant } from "@/components/charts/BarVariant";
import { LineVariant } from "@/components/charts/LineVariant";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  data?: {
    date: string;
    income: number;
    expenses: number;
  }[];
  currency?: string;
};

export const Chart = memo(function Chart({
  data = [],
  currency = "EUR",
}: Props) {
  const [chartType, setChartType] = useState("area");

  const onTypeChange = useCallback((type: string) => {
    //Añadir paywall
    setChartType(type);
  }, []);

  const hasData = useMemo(() => data.length > 0, [data.length]);

  const chartComponent = useMemo(() => {
    if (!hasData) return null;

    switch (chartType) {
      case "area":
        return <AreaVariant data={data} currency={currency} />;
      case "line":
        return <LineVariant data={data} currency={currency} />;
      case "Bar":
        return <BarVariant data={data} currency={currency} />;
      default:
        return <AreaVariant data={data} currency={currency} />;
    }
  }, [chartType, data, currency, hasData]);

  const selectItems = useMemo(
    () => [
      { value: "area", icon: AreaChart, label: "Area chart" },
      { value: "line", icon: LineChart, label: "Line chart" },
      { value: "Bar", icon: BarChart3, label: "Bar chart" },
    ],
    []
  );
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
        <CardTitle className="text-xl line-clamp-1">Transactions</CardTitle>
        <Select
          defaultValue={chartType}
          onValueChange={onTypeChange}
          aria-label="Select chart type"
        >
          <SelectTrigger className="lg:w-auto h-9 rounded-md px-3">
            <SelectValue placeholder="Chart type" />
          </SelectTrigger>
          <SelectContent>
            {selectItems.map(({ value, icon: Icon, label }) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center">
                  <Icon className="size-4 mr-2 shrink-0" aria-hidden="true" />
                  <p className="line-clamp-1">{label}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full"
            role="status"
            aria-live="polite"
          >
            <FileSearch
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-muted-foreground text-sm">
              No data for this period
            </p>
          </div>
        ) : (
          <div
            role="img"
            aria-label={`${chartType} chart showing transaction data`}
          >
            {chartComponent}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export const ChartLoading = memo(function ChartLoading() {
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 lg:w-[120px] w-full" />
      </CardHeader>
      <CardContent>
        <div
          className="h-[350px] w-full flex items-center justify-center"
          role="status"
          aria-live="polite"
          aria-label="Loading chart data"
        >
          <Loader2
            className="h-6 w-6 text-slate-300 animate-spin"
            aria-hidden="true"
          />
        </div>
      </CardContent>
    </Card>
  );
});
