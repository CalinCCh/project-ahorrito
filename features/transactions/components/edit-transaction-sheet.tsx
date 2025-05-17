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

import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { useGetTransaction } from "../api/use-get-transaction";
import { useEditTransaction } from "../api/use-edit-transaction";
import { useDeleteTransaction } from "../api/use-delete-transaction";
import { TransactionForm } from "./transaction-form";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useGetPredefinedCategories } from "@/features/predefined-categories/use-get-predefined-categories";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

type FormValues = z.infer<typeof formSchema>;

export const EditTransactionSheet = () => {
  const { isOpen, onClose, id } = useOpenTransaction();

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this transaction."
  );

  const transactionQuery = useGetTransaction(id);
  const editMutation = useEditTransaction(id);
  const deleteMutation = useDeleteTransaction(id);

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

  // Predefined categories
  const predefinedCategoryQuery = useGetPredefinedCategories();

  const predefinedCategoryOptions = (predefinedCategoryQuery.data ?? [])
    .filter((category) => category && category.name && category.id)
    .map((category) => ({
      label: category.name,
      value: category.id,
      emoji: category.emoji,
    }));

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    transactionQuery.isLoading ||
    categoryMutation.isPending ||
    accountMutation.isPending;

  const isLoading =
    transactionQuery.isLoading ||
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
    editMutation.mutate(
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

  const onDelete = async () => {
    const ok = await confirm();

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const defaultValues = transactionQuery.data
    ? {
        accountId: transactionQuery.data.accountId,
        userCategoryId: transactionQuery.data.userCategoryId,
        predefinedCategoryId: transactionQuery.data.predefinedCategoryId,
        amount: transactionQuery.data.amount.toString(),
        date: transactionQuery.data.date
          ? new Date(transactionQuery.data.date)
          : new Date(),
        payee: transactionQuery.data.payee,
        notes: transactionQuery.data.notes,
      }
    : {
        accountId: "",
        userCategoryId: null,
        predefinedCategoryId: null,
        amount: "",
        date: new Date(),
        payee: "",
        notes: "",
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Transaction</SheetTitle>
            <SheetDescription>Edit an existing transaction.</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <TransactionForm
              id={id}
              defaultValues={defaultValues}
              onSubmit={handleFormSubmit}
              onDelete={onDelete}
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
    </>
  );
};
