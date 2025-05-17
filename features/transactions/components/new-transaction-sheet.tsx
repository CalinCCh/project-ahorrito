import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const formSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string(),
  userCategoryId: z.string().nullable().optional(),
  predefinedCategoryId: z.string().nullable().optional(),
  categoryType: z.enum(["user", "predefined", "none"]).default("none"),
  payee: z.string(),
  amount: z.string(),
  notes: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

import { useNewTransaction } from "../hooks/use-new-transaction";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { z } from "zod";
import { useCreateTransaction } from "../api/use-create-transaction";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useGetPredefinedCategories } from "@/features/predefined-categories/use-get-predefined-categories";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { Loader2 } from "lucide-react";

export const NewTransactionSheet = () => {
  const { isOpen, onClose } = useNewTransaction();

  const createMutation = useCreateTransaction();

  const accountQuery = useGetAccounts();
  const accountMutation = useCreateAccount();

  const accountOptions = (accountQuery.data ?? [])
    .filter(
      (account) =>
        account && account.account && account.account.name && account.account.id
    )
    .map((account) => ({
      label: account.account.name,
      value: account.account.id,
    }));

  const onCreateAccount = (name: string) =>
    accountMutation.mutate({
      name,
    });

  // User categories
  const categoryQuery = useGetCategories();
  const categoryMutation = useCreateCategory();

  const onCreateCategory = (name: string) =>
    categoryMutation.mutate({
      name,
    });

  const categoryOptions = (categoryQuery.data ?? [])
    .filter((category) => category && category.name && category.id)
    .map((category) => ({
      label: category.name,
      value: category.id,
    }));

  const predefinedCategoryQuery = useGetPredefinedCategories();

  const predefinedCategoryOptions = (predefinedCategoryQuery.data ?? [])
    .filter((category) => category && category.name && category.id)
    .map((category) => ({
      label: category.name,
      value: category.id,
      emoji: category.emoji,
    }));

  const isPending =
    createMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending;

  const isLoading =
    categoryQuery.isLoading ||
    predefinedCategoryQuery.isLoading ||
    accountQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const {
      amount,
      userCategoryId,
      predefinedCategoryId,
      categoryType,
      notes,
      ...rest
    } = values;

    // Handle null values and transform data to match expected types
    createMutation.mutate(
      {
        ...rest,
        amount: Number(amount),
        userCategoryId: userCategoryId || undefined,
        predefinedCategoryId: predefinedCategoryId || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  // Create a wrapper function to handle the type mismatch
  const handleFormSubmit = (values: any) => {
    // Add categoryType if missing
    if (!values.categoryType) {
      values.categoryType = "none";
    }

    // Ensure amount is a string for the form schema
    if (typeof values.amount === "number") {
      values.amount = values.amount.toString();
    }

    onSubmit(values);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Transaction</SheetTitle>
          <SheetDescription>Add a new transaction.</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <TransactionForm
            onSubmit={handleFormSubmit}
            disabled={isPending}
            categoryOptions={categoryOptions}
            predefinedCategoryOptions={predefinedCategoryOptions}
            onCreateCategory={onCreateCategory}
            accountOptions={accountOptions}
            onCreateAccount={onCreateAccount}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
