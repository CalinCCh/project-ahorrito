import React, { memo, useCallback } from "react";
import { z } from "zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { insertAccountSchema } from "@/db/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = insertAccountSchema.pick({
  name: true,
});

export interface AccountFormValues {
  name: string;
  plaidId?: string | null;
  balance?: { current: number; currency: string } | null;
}

type Props = {
  id?: string;
  defaultValues?: AccountFormValues;
  onSubmit: (values: AccountFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export const AccountForm = memo<Props>(function AccountForm({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
}) {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  // Memoize submit handler for performance
  const handleSubmit = useCallback(
    (values: AccountFormValues) => {
      onSubmit(values);
    },
    [onSubmit]
  );

  // Memoize delete handler
  const handleDelete = useCallback(() => {
    onDelete?.();
  }, [onDelete]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Cash, Bank, Credit Card"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {!defaultValues?.plaidId && (
          <FormField
            name="balance.current"
            control={form.control}
            rules={{ min: 0 }}
            shouldUnregister={false}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Balance </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    disabled={disabled}
                    placeholder="0.00"
                    className="no-spinner"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create account"}
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
            Delete account
          </Button>
        )}
      </form>
    </Form>
  );
});
