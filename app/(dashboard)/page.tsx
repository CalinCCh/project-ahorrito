"use client"; // Required because we'll use the useUser hook

import { useUser } from "@clerk/nextjs";
import { PageHeader } from "@/components/data-display/PageHeader";
import { DateFilter } from "@/components/filters/DateFilter"; // Ensure this path is correct
import { AccountFilter } from "@/components/filters/AccountFilter"; // Import AccountFilter
import { DataCharts } from "@/components/data-display/DataCharts";
import { DataGrid } from "@/components/data-display/DataGrid";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <>
      <PageHeader
        title={`Welcome back ${user?.firstName || ""} 👋`}
        description="Here is your updated financial overview"
        actions={
          <div className="flex items-center gap-2">
            <AccountFilter />
            <DateFilter />
          </div>
        }
        className="mb-4"
      />
      <DataGrid />
      <DataCharts />
    </>
  );
}
