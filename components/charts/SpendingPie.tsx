"use client";

// filepath: d:\react\project-ahorrito\components\charts\SpendingPie.tsx
import React, { memo, useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { FileSearch, Loader2, PieChart, Radar, Target } from "lucide-react";
import { PieVariant } from "@/components/charts/PieVariant";
import { RadarVariant } from "@/components/charts/RadarVariant";
import { RadialVariant } from "@/components/charts/RadialVariant";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  data?: {
    name: string;
    value: number;
  }[];
  currency?: string;
};

export const SpendingPie = memo(function SpendingPie({
  data = [],
  currency = "EUR",
}: Props) {
  const [chartType, setChartType] = useState("pie");

  const onTypeChange = useCallback((type: string) => {
    //Añadir paywall
    setChartType(type);
  }, []);

  const hasData = useMemo(() => data.length > 0, [data.length]);

  const chartComponent = useMemo(() => {
    if (!hasData) return null;

    switch (chartType) {
      case "pie":
        return <PieVariant data={data} currency={currency} />;
      case "radar":
        return <RadarVariant data={data} currency={currency} />;
      case "radial":
        return <RadialVariant data={data} currency={currency} />;
      default:
        return <PieVariant data={data} currency={currency} />;
    }
  }, [chartType, data, currency, hasData]);

  const selectItems = useMemo(
    () => [
      { value: "pie", icon: PieChart, label: "Pie chart" },
      { value: "radar", icon: Radar, label: "Radar chart" },
      { value: "radial", icon: Target, label: "Radial chart" },
    ],
    []
  );
  return (
    <Card className="border border-gray-100 shadow-sm bg-white hover:shadow-md transition-all duration-300">
      <CardHeader className="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between pb-6">
        <CardTitle className="text-2xl font-semibold text-gray-900 line-clamp-1">Category Spending</CardTitle>
        <Select
          defaultValue={chartType}
          onValueChange={onTypeChange}
          aria-label="Select chart type for spending categories"
        >
          <SelectTrigger className="lg:w-auto h-10 rounded-lg px-4 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <SelectValue placeholder="Chart type" />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-gray-200 shadow-lg">
            {selectItems.map(({ value, icon: Icon, label }) => (
              <SelectItem key={value} value={value} className="rounded-md">
                <div className="flex items-center">
                  <Icon className="size-4 mr-2 shrink-0 text-gray-600" aria-hidden="true" />
                  <p className="line-clamp-1 text-gray-700">{label}</p>
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
            aria-label={`${chartType} chart showing spending by categories`}
          >
            {chartComponent}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export const SpendingPieLoading = memo(function SpendingPieLoading() {
  return (
    <Card className="border border-gray-100 shadow-sm bg-white hover:shadow-md transition-all duration-300">
      <CardHeader className="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between pb-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 lg:w-[120px] w-full" />
      </CardHeader>
      <CardContent>
        <div
          className="h-[350px] w-full flex items-center justify-center"
          role="status"
          aria-live="polite"
          aria-label="Loading spending categories chart"
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
