import { z } from "zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { insertTransactionSchema } from "@/db/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { convertAmountToMiliunits } from "@/lib/utils";
import { DatePicker } from "@/components/forms/DatePicker";
import { Select } from "@/components/forms/Select";
import { AmountInput } from "@/components/forms/AmountInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z
  .object({
    date: z.coerce.date(),
    accountId: z.string(),
    userCategoryId: z.string().nullable().optional(),
    predefinedCategoryId: z.string().nullable().optional(),
    payee: z.string(),
    amount: z.string(),
    notes: z.string().nullable().optional(),
    categoryType: z.enum(["user", "predefined", "none"]).default("none"),
  })
  .refine(
    (data) => {
      if (data.categoryType === "user") {
        return !!data.userCategoryId && !data.predefinedCategoryId;
      } else if (data.categoryType === "predefined") {
        return !!data.predefinedCategoryId && !data.userCategoryId;
      } else {
        return !data.userCategoryId && !data.predefinedCategoryId;
      }
    },
    {
      message: "Transaction can only have one category type",
    }
  );

const apiSchema = insertTransactionSchema.omit({
  id: true,
});

type FormValues = z.infer<typeof formSchema>;
type ApiFormValues = z.infer<typeof apiSchema>;

type Props = {
  id?: string;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  accountOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
  predefinedCategoryOptions: { label: string; value: string; emoji?: string }[];
  onCreateAccount: (name: string) => void;
  onCreateCategory: (name: string) => void;
};

export const TransactionForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  accountOptions,
  categoryOptions,
  predefinedCategoryOptions,
  onCreateAccount,
  onCreateCategory,
}: Props) => {
  const initialCategoryType = defaultValues?.userCategoryId
    ? "user"
    : defaultValues?.predefinedCategoryId
    ? "predefined"
    : "none";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      categoryType: initialCategoryType,
    },
  });

  const watchCategoryType = form.watch("categoryType");

  const handleSubmit = (values: FormValues) => {
    const cleanAmount = values.amount.replace(",", ".").replace(/[^\d.-]/g, "");
    const amount = parseFloat(cleanAmount);
    const amountInMiliunits = convertAmountToMiliunits(amount);

    const submissionValues = {
      ...values,
      userCategoryId:
        values.categoryType === "user" ? values.userCategoryId : null,
      predefinedCategoryId:
        values.categoryType === "predefined"
          ? values.predefinedCategoryId
          : null,
      amount: amountInMiliunits,
    };

    onSubmit(submissionValues);
  };

  const handleDelete = () => {
    onDelete?.();
  };

  const handleCategoryTypeChange = (value: string) => {
    if (value === "user") {
      form.setValue("predefinedCategoryId", null);
      form.setValue("categoryType", "user");
    } else if (value === "predefined") {
      form.setValue("userCategoryId", null);
      form.setValue("categoryType", "predefined");
    } else {
      form.setValue("userCategoryId", null);
      form.setValue("predefinedCategoryId", null);
      form.setValue("categoryType", "none");
    }
  };

  const enhancedPredefinedCategoryOptions = predefinedCategoryOptions.map(
    (category) => ({
      ...category,
      label: category.emoji
        ? `${category.emoji} ${category.label}`
        : category.label,
    })
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="accountId"
          control={form.control}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Account</FormLabel>
              <FormControl>
                <Select
                  placeholder="Select an account"
                  options={accountOptions}
                  onCreate={onCreateAccount}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="categoryType"
          control={form.control}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Tabs
                  value={field.value}
                  onValueChange={handleCategoryTypeChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="predefined">Predefined</TabsTrigger>
                    <TabsTrigger value="user">Custom</TabsTrigger>
                    <TabsTrigger value="none">None</TabsTrigger>
                  </TabsList>

                  <TabsContent value="predefined" className="pt-2">
                    <FormField
                      name="predefinedCategoryId"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormControl>
                            <Select
                              placeholder="Select a predefined category"
                              options={enhancedPredefinedCategoryOptions}
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="user" className="pt-2">
                    <FormField
                      name="userCategoryId"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormControl>
                            <Select
                              placeholder="Select or create a custom category"
                              options={categoryOptions}
                              onCreate={onCreateCategory}
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="none" className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      No category selected
                    </p>
                  </TabsContent>
                </Tabs>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="payee"
          control={form.control}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Payee</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Add a payee"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <AmountInput
                  disabled={disabled}
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="notes"
          control={form.control}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  disabled={disabled}
                  placeholder="Add a note"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button className="w-full cursor-pointer" disabled={disabled}>
          {id ? "Save changes" : "Create transaction"}
        </Button>

        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={handleDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="size-4 mr-2" />
            Delete transaction
          </Button>
        )}
      </form>
    </Form>
  );
};
