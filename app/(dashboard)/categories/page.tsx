"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "@/components/data-display/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { useBulkDeleteCategories } from "@/features/categories/api/use-bulk-delete-categories";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { PageHeader } from "@/components/data-display/PageHeader";

const CategoriesPage = () => {
  const newCategory = useNewCategory();
  const deleteCategories = useBulkDeleteCategories();
  const categoriesQuery = useGetCategories();
  const categories = categoriesQuery.data || [];

  const isDisabled = categoriesQuery.isLoading || deleteCategories.isPending;

  const getCategoriesDescription = () => {
    const count = categories.length;
    return `You have a total of ${count} categor${
      count === 1 ? "y" : "ies"
    } defined.`;
  };

  if (categoriesQuery.isLoading) {
    return (
      <Card className="border-none drop-shadow-sm">
        <CardContent>
          <div className="h-[500px] w-full flex items-center justify-center">
            <Loader2 className="size-6 text-slate-300 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="Categories"
        description={getCategoriesDescription()}
        actions={
          <Button
            onClick={newCategory.onOpen}
            className="w-full lg:w-auto cursor-pointer h-10"
          >
            <Plus className="size-4 mr-2" />
            Add new
          </Button>
        }
        className="mb-6"
      />
      <div className="-mt-6">
        <DataTable
          filterKey="name"
          columns={columns}
          data={categories}
          onDelete={(row) => {
            const ids = row.map((r) => r.original.id);
            deleteCategories.mutate({ ids });
          }}
          disabled={isDisabled}
        />
      </div>
    </>
  );
};

export default CategoriesPage;
