import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
const formSchema = insertAccountSchema.pick({
  name: true,
});

type FormValues = z.infer<typeof formSchema>;

import { useNewAccount } from "../hooks/use-new-account";
import { AccountForm } from "./account-form";
import { insertAccountSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateAccount } from "../api/use-create-account";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Banknote } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";

export const NewAccountSheet = () => {
  const { isOpen, onClose } = useNewAccount();
  const queryClient = useQueryClient();
  const mutation = useCreateAccount();

  const onSubmit = (values: any) => {
    console.log("SUBMIT VALUES", values);
    if (typeof values.balance?.current !== "number") {
      values.balance = { current: 0, currency: "EUR" };
    } else if (!values.balance.currency) {
      values.balance.currency = "EUR";
    }

    mutation.mutate(values, {
      onSuccess: (data) => {
        // Forzar la actualización del caché de cuentas inmediatamente
        queryClient.invalidateQueries({ queryKey: ["accounts"] });

        // Disparar un evento para notificar a otros componentes
        window.dispatchEvent(
          new CustomEvent("account-created", {
            detail: { accountId: data.account?.id },
          })
        );

        // Cerrar el formulario
        onClose();

        // Pequeño retraso antes de mostrar la notificación para evitar conflictos de UI
        setTimeout(() => {
          toast.success("Account created successfully!");
        }, 100);
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>Add account</SheetTitle>
          <SheetDescription>
            Choose how you want to add your account
          </SheetDescription>
        </SheetHeader>
        <Button
          variant="default"
          className="w-full mb-4"
          onClick={() => (window.location.href = "/dashboard/settings")}
        >
          <Banknote className="mr-2" />
          Connect bank
        </Button>
        <Separator className="my-2" />
        <div className="text-center text-xs text-muted-foreground mb-2">
          or add a manual account
        </div>
        <AccountForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          defaultValues={{
            name: "",
            balance: { current: 0, currency: "EUR" },
          }}
        />
      </SheetContent>
    </Sheet>
  );
};
