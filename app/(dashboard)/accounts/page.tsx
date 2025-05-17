"use client";

import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, AlertCircle } from "lucide-react";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { AccountCard } from "@/components/data-display/AccountCard";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { PageHeader } from "@/components/data-display/PageHeader";
import { useGetPendingCategorization } from "@/features/accounts/api/use-get-pending-categorization";
import { useQueryClient } from "@tanstack/react-query";

// Componente para los esqueletos de carga
const AccountSkeletons = () => (
  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <CardContent className="pb-2 pt-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-12 w-32 mb-4" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Componente para cuando no hay cuentas
const NoAccounts = () => (
  <div className="bg-white rounded-xl shadow-sm">
    <div className="text-center py-12">
      <h3 className="text-xl font-medium mb-2">
        You don't have any connected accounts
      </h3>
      <p className="text-muted-foreground mb-4">
        Connect your bank to see your accounts and transactions
      </p>
    </div>
  </div>
);

// Componente de mensaje de error
const ErrorMessage = ({ error }: { error: string }) => (
  <div className="mb-4 p-4 rounded-md border border-red-300 bg-red-50 text-red-800">
    <div className="flex">
      <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
      <p>{error}</p>
    </div>
    <p className="text-sm mt-1 ml-7">
      There was a problem refreshing your account data. This could be due to
      connection issues with TrueLayer or your bank. Please try again later.
    </p>
  </div>
);

export default function AccountsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const newAccount = useNewAccount();
  const openAccount = useOpenAccount();

  // Obtener datos de cuentas
  const {
    filteredAccounts,
    loading,
    refreshingAccountId,
    syncProgress,
    lastSynced,
    syncStatus,
    error,
    refreshAccount,
    isAccountRefreshing,
    loadAccounts,
  } = useAccounts();

  // Obtener datos de categorización pendiente
  const { data: pendingCategorization } = useGetPendingCategorization();

  const linkedAccounts = filteredAccounts.filter((a) => !!a.account.plaidId);
  const showLastSynced = linkedAccounts.length === 1;

  // Descripción de cuentas para el encabezado
  const getAccountsDescription = useCallback(() => {
    if (filteredAccounts.length > 0) {
      return `You have ${filteredAccounts.length} account${
        filteredAccounts.length === 1 ? "" : "s"
      } connected.`;
    }
    return "Connect your bank or add accounts manually to get started.";
  }, [filteredAccounts.length]);

  // Efecto para refrescar datos periódicamente
  useEffect(() => {
    const refetchInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    }, 30000); // Cada 30 segundos

    return () => {
      clearInterval(refetchInterval);
    };
  }, [queryClient]);

  // Escuchar eventos de cambios en cuentas
  useEffect(() => {
    const handleAccountsChange = () => {
      // Usar un pequeño retraso para asegurar que todas las operaciones de BD hayan terminado
      setTimeout(() => {
        loadAccounts();
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["summary"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      }, 300);
    };

    // Suscribirse a todos los eventos relacionados con cuentas
    window.addEventListener("account-deleted", handleAccountsChange);
    window.addEventListener("account-created", handleAccountsChange);
    window.addEventListener("account-updated", handleAccountsChange);

    return () => {
      window.removeEventListener("account-deleted", handleAccountsChange);
      window.removeEventListener("account-created", handleAccountsChange);
      window.removeEventListener("account-updated", handleAccountsChange);
    };
  }, [queryClient, loadAccounts]);

  // Renderizar las tarjetas de cuentas
  const renderAccounts = () => {
    if (loading) {
      return <AccountSkeletons />;
    }

    if (filteredAccounts.length === 0) {
      return <NoAccounts />;
    }

    return (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredAccounts.map((accountData) => (
          <AccountCard
            key={accountData.account.id}
            accountData={accountData}
            refreshAccount={refreshAccount}
            isAccountRefreshing={isAccountRefreshing}
            refreshingAccountId={refreshingAccountId}
            syncProgress={syncProgress}
            syncStatus={syncStatus}
            lastSynced={lastSynced}
            showLastSynced={showLastSynced}
            openAccount={openAccount}
            isCategorizing={!!pendingCategorization?.[accountData.account.id]}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Bank Accounts"
        description={getAccountsDescription()}
        actions={
          <Button
            onClick={newAccount.onOpen}
            className="w-full lg:w-auto cursor-pointer"
          >
            <Plus className="size-4 mr-2" />
            Add Account
          </Button>
        }
        className="mb-6"
      />

      {error && <ErrorMessage error={error} />}
      {renderAccounts()}
    </>
  );
}
