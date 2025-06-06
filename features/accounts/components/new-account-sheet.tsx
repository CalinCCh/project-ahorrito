import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNewAccount } from "../hooks/use-new-account";
import { AccountForm } from "./account-form";
import { insertAccountSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateAccount } from "../api/use-create-account";
// import axios from "axios"; // No se usa axios directamente aquí para TrueLayer
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Banknote } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react"; // Importar useState
import { Input } from "@/components/ui/input"; // Importar Input
import { Label } from "@/components/ui/label"; // Importar Label

// Schema para el nombre de la cuenta antes de conectar con el banco
const bankAccountNameSchema = z.object({
  bankAccountName: z.string().min(1, "Account name is required"),
});
type BankAccountNameValues = z.infer<typeof bankAccountNameSchema>;

// Schema para el formulario de cuenta manual
const manualAccountFormSchema = insertAccountSchema.pick({
  name: true,
});
type ManualAccountFormValues = z.infer<typeof manualAccountFormSchema>;

export const NewAccountSheet = () => {
  const { isOpen, onClose } = useNewAccount();
  const queryClient = useQueryClient();
  const manualAccountMutation = useCreateAccount();

  const [bankAccountName, setBankAccountName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  // onSubmit para el formulario de cuenta manual
  const onManualSubmit = (values: ManualAccountFormValues) => {
    console.log("MANUAL SUBMIT VALUES", values);
    // Asegurar que el balance se maneja correctamente si no es cuenta bancaria (plaidId ausente)
    // Esta lógica podría necesitar ajustarse si el AccountForm es estrictamente para cuentas manuales
    // y no tiene un campo plaidId. Asumiendo que `useCreateAccount` maneja esto.
    const payload: any = { ...values };
    if (typeof (payload as any).balance?.current !== "number") {
      payload.balance = { current: 0, currency: "EUR" };
    } else if (!(payload as any).balance.currency) {
      payload.balance.currency = "EUR";
    }

    manualAccountMutation.mutate(payload, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        window.dispatchEvent(
          new CustomEvent("account-created", {
            detail: { accountId: (data as any).account?.id }, // Ajustar según la estructura de `data`
          })
        );
        onClose();
        setTimeout(() => {
          toast.success("Manual account created successfully!");
        }, 100);
      },
      onError: (error) => {
        toast.error("Failed to create manual account.");
        console.error("Manual account creation error:", error);
      },
    });
  };

  const handleConnectBank = () => {
    setNameError(null);
    if (!bankAccountName.trim()) {
      setNameError("Account name is required to connect a bank.");
      return;
    }
    // Guardar el nombre temporalmente
    localStorage.setItem("bankAccountNameInProgress", bankAccountName);

    // ¡IMPORTANTE! Reemplaza con tus variables de entorno y valores correctos
    const clientId = process.env.NEXT_PUBLIC_TRUELAYER_CLIENT_ID; // Debería ser "ahorrito-3ee452" según tu link
    const redirectUri = process.env.NEXT_PUBLIC_TRUELAYER_REDIRECT_URI; // Debería ser "http://localhost:3000/truelayer-callback" para desarrollo

    if (!clientId || !redirectUri) {
      toast.error(
        "TrueLayer configuration is missing. Please contact support."
      );
      console.error(
        "Missing TrueLayer Client ID or Redirect URI from env variables"
      );
      return;
    }

    // Scopes del enlace que proporcionaste
    const scopes =
      "info accounts balance cards transactions direct_debits standing_orders offline_access";
    // Lista de providers actualizada con la última y más extensa proporcionada
    const providers =
      "uk-ob-all uk-oauth-all es-ob-all se-ob-all fr-ob-all at-ob-all be-ob-all ee-ob-all fi-ob-all de-ob-all ie-ob-all it-ob-all lt-ob-all nl-ob-all pl-ob-all pt-ob-all es-xs2a-all be-xs2a-all fi-xs2a-all fr-stet-all de-xs2a-all lt-xs2a-all nl-xs2a-all pl-polishapi-all";
    const responseType = "code";
    // El state es opcional pero recomendado para protección CSRF.
    const state = `user_id_${
      queryClient.getQueryData(["user"]) || "unknown"
    }_${Date.now()}`; // Añadido Date.now() para mayor unicidad

    const authUrl = new URL("https://auth.truelayer.com/");
    authUrl.searchParams.set("response_type", responseType);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("providers", providers); // Añadir la lista de providers
    authUrl.searchParams.set("state", state);

    console.log(
      "Redirecting to TrueLayer with specific providers:",
      authUrl.toString()
    );
    window.location.href = authUrl.toString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>Add account</SheetTitle>
          <SheetDescription>
            Connect a bank or add an account manually.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2">
          <Label htmlFor="bankAccountName">
            Account Name (for bank connection)
          </Label>
          <Input
            id="bankAccountName"
            value={bankAccountName}
            onChange={(e) => {
              setBankAccountName(e.target.value);
              if (e.target.value.trim()) setNameError(null);
            }}
            placeholder="E.g., My Main Chequing"
            disabled={manualAccountMutation.isPending}
          />
          {nameError && <p className="text-sm text-red-500">{nameError}</p>}
        </div>

        <Button
          variant="default"
          className="w-full"
          onClick={handleConnectBank}
          disabled={manualAccountMutation.isPending} // Podrías deshabilitarlo también si bankAccountName está vacío
        >
          <Banknote className="mr-2 h-4 w-4" />
          Connect bank with TrueLayer
        </Button>

        <Separator className="my-4" />

        <div className="text-center text-sm text-muted-foreground mb-2">
          Or add a manual account
        </div>
        <AccountForm
          onSubmit={onManualSubmit} // Cambiado a onManualSubmit
          disabled={manualAccountMutation.isPending}
          defaultValues={{
            name: "", // El nombre para la cuenta manual vendrá del propio AccountForm
            // balance: { current: 0, currency: "EUR" }, // El AccountForm ya maneja esto
          }}
          // Pasa un schema específico si AccountForm lo necesita o lo usa internamente
        />
      </SheetContent>
    </Sheet>
  );
};
