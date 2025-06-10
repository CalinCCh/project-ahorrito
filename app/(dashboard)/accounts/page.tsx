"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  AlertCircle,
  Loader2,
  CreditCard,
  Building2,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { AccountCard } from "@/components/data-display/AccountCard";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { useUnifiedSync } from "@/features/sync/hooks/use-unified-sync";
import { PageHeader } from "@/components/data-display/PageHeader";
import { useGetPendingCategorization } from "@/features/accounts/api/use-get-pending-categorization";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

// Import Swiper componentes lazily para reducir bundle inicial
const SwiperComponents = dynamic(() => import("./swiper-components"), {
  loading: () => (
    <div className="w-full h-[300px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  ),
  ssr: false,
});

// Import isMobile hook with dynamic import to reduce bundle size
// Pero inicializándolo con un valor fijo para evitar problemas iniciales
const useIsMobileHook = dynamic(
  () => import("@/hooks/use-mobile").then((mod) => mod.useIsMobile),
  { ssr: false }
);

// Componente para cuando no hay cuentas
const NoAccounts = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/5 relative overflow-hidden mx-3 sm:mx-0"
  >
    {/* Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/60" />

    <div className="relative text-center py-8 sm:py-16 px-4 sm:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4 sm:mb-6"
      >
        <div className="w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-blue-500/20">
          <Wallet className="w-8 sm:w-12 h-8 sm:h-12 text-blue-600" />
        </div>
      </motion.div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">
        No Connected Accounts
      </h3>
      <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed">
        Connect your bank to automatically view your accounts and transactions
      </p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-500"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>Secure Connection</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          <span>Encrypted Data</span>
        </div>
      </motion.div>
    </div>

    {/* Decorative elements - responsive */}
    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-8 sm:w-16 h-8 sm:h-16 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl" />
    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-6 sm:w-12 h-6 sm:h-12 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl" />
  </motion.div>
);

// Componente de mensaje de error
const ErrorMessage = ({ error }: { error: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="mb-6 p-4 rounded-2xl border border-red-200/50 bg-red-50/80 backdrop-blur-sm text-red-800"
  >
    <div className="flex">
      <AlertCircle className="h-5 w-5 mr-3 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">{error}</p>
        <p className="text-sm mt-1 text-red-600">
          There was a problem updating your account data. This may be due to
          connection issues with TrueLayer or your bank. Please try again later.
        </p>
      </div>
    </div>
  </motion.div>
);

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const newAccount = useNewAccount();
  const openAccount = useOpenAccount();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [lastConnectedId, setLastConnectedId] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState<number | null>(null);

  // Get URL params to check for new account flag
  const params = useSearchParams();
  const isNewAccount = params.get("newAccount") === "true";
  const newAccountTimestamp = params.get("ts");
  const shouldAutoRefresh = params.get("autoRefresh") === "true";

  // Fix: Usando useState para asegurar que isMobile se actualice correctamente
  const [isMobile, setIsMobile] = useState(false);

  // Usar el hook cuando esté disponible
  useEffect(() => {
    // Inicialmente detectar el tamaño por window.innerWidth
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };

    // Comprobar inmediatamente
    checkMobile();

    // Escuchar cambios de tamaño
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check for newly connected account from TrueLayer
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check URL params first
      if (isNewAccount && newAccountTimestamp) {
        console.log(
          "New account detected from URL params with timestamp:",
          newAccountTimestamp
        );
        setForceRefresh(parseInt(newAccountTimestamp));

        // Force immediate data refresh
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        loadAccounts();
        return;
      }

      // Then check localStorage
      const connectedId = localStorage.getItem("lastConnectedAccountId");
      const timestamp = localStorage.getItem("lastConnectedTimestamp");

      if (connectedId) {
        console.log(
          "Found lastConnectedAccountId in localStorage:",
          connectedId
        );
        setLastConnectedId(connectedId);

        if (timestamp) {
          console.log("Found timestamp in localStorage:", timestamp);
          setForceRefresh(parseInt(timestamp));
        }

        // Clear the stored values after retrieving them
        localStorage.removeItem("lastConnectedAccountId");
        localStorage.removeItem("lastConnectedTimestamp");

        // Force refresh accounts data to ensure we have the latest
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        loadAccounts();
      }
    }
  }, [queryClient, isNewAccount, newAccountTimestamp]);

  const { filteredAccounts, loading, error, loadAccounts } = useAccounts();

  // Find index of the last connected account to highlight it
  useEffect(() => {
    if (
      (lastConnectedId || forceRefresh) &&
      filteredAccounts.length > 0 &&
      !loading
    ) {
      console.log("Looking for account with ID:", lastConnectedId);
      console.log(
        "Available accounts:",
        filteredAccounts.map((a) => ({
          id: a.account.id,
          name: a.account.name,
          plaidId: a.account.plaidId,
        }))
      );

      let accountIndex = -1;

      // First try to find by exact ID match
      if (lastConnectedId) {
        accountIndex = filteredAccounts.findIndex(
          (account) =>
            account.account.id === lastConnectedId ||
            account.account.plaidId === lastConnectedId
        );
      }

      // If not found and we have a forceRefresh timestamp, just select the first account
      // This handles cases where the account already existed but we want to highlight it
      if (accountIndex === -1 && forceRefresh && filteredAccounts.length > 0) {
        console.log(
          "No exact match found, selecting first account due to forceRefresh"
        );
        accountIndex = 0;
      }

      if (accountIndex !== -1) {
        console.log("Found account at index:", accountIndex);
        setActiveSlideIndex(accountIndex);
        // Clear the tracking variables after highlighting
        setLastConnectedId(null);
        setForceRefresh(null);
      } else {
        console.log("Account not found in the list");
      }
    }
  }, [filteredAccounts, lastConnectedId, loading, forceRefresh]);

  // Refresh accounts data when account-created event is fired
  useEffect(() => {
    const handleAccountCreated = (event: Event) => {
      console.log("Account created event received");

      // Check if the event has detail with accountId
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.accountId) {
          console.log("Account created with ID:", customEvent.detail.accountId);
          setLastConnectedId(customEvent.detail.accountId);
        }

        if (customEvent.detail.timestamp) {
          console.log(
            "Account created with timestamp:",
            customEvent.detail.timestamp
          );
          setForceRefresh(customEvent.detail.timestamp);
        }

        if (customEvent.detail.isNewConnection) {
          console.log("This is a new bank connection");
        }
      }

      // Force refresh accounts data
      loadAccounts();
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    };

    window.addEventListener("account-created", handleAccountCreated);
    return () => {
      window.removeEventListener("account-created", handleAccountCreated);
    };
  }, [queryClient, loadAccounts]);

  const { syncSingleAccount, isAccountSyncing } = useUnifiedSync();

  // Asegurarse de que siempre pasemos una función de verificación válida
  const handleRefreshStatus = useCallback(
    (accountId: string) => {
      // Si isAccountSyncing es una función, usarla, de lo contrario devolver false
      return typeof isAccountSyncing === "function"
        ? isAccountSyncing(accountId)
        : false;
    },
    [isAccountSyncing]
  );

  // Wrapper function to handle account refresh using unified sync
  const handleAccountRefresh = useCallback(
    async (accountId: string) => {
      // Encontrar la cuenta completa para obtener el plaidId
      const account = filteredAccounts.find((a) => a.account.id === accountId);
      if (account?.account.plaidId) {
        await syncSingleAccount({
          id: account.account.id,
          plaidId: account.account.plaidId,
        });
      }
    },
    [syncSingleAccount, filteredAccounts]
  );

  const { data: pendingCategorization } = useGetPendingCategorization();

  const linkedAccounts = filteredAccounts.filter((a) => !!a.account.plaidId);

  const getAccountsDescription = useCallback(() => {
    if (filteredAccounts.length > 0) {
      return `You have ${filteredAccounts.length} account${
        filteredAccounts.length === 1 ? "" : "s"
      } connected.`;
    }
    return "Connect your bank or add accounts manually to get started.";
  }, [filteredAccounts.length]);

  // Function to handle clicking on non-active cards to navigate to them
  const handleCardClick = useCallback(
    (accountId: string, slideIndex: number) => {
      // Only navigate if the card is not the active one
      if (slideIndex !== activeSlideIndex) {
        setActiveSlideIndex(slideIndex);
      }
    },
    [activeSlideIndex]
  );

  // Reduced polling frequency for better performance
  useEffect(() => {
    const refetchInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    }, 60000); // Increased to 60 seconds from 30 seconds
    return () => clearInterval(refetchInterval);
  }, [queryClient]);

  // Prefetch account data to avoid sudden size changes
  useEffect(() => {
    if (filteredAccounts.length > 0 && !loading) {
      // Prefetch all account details to prepare the cache
      filteredAccounts.forEach((account) => {
        queryClient.prefetchQuery({
          queryKey: ["account", account.account.id],
          staleTime: 30000, // 30 seconds
        });
      });
    }
  }, [filteredAccounts, queryClient, loading]);

  useEffect(() => {
    const handleAccountsChange = () => {
      setTimeout(() => {
        loadAccounts();
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["summary"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      }, 300);
    };
    window.addEventListener("account-deleted", handleAccountsChange);
    window.addEventListener("account-created", handleAccountsChange);
    window.addEventListener("account-updated", handleAccountsChange);
    return () => {
      window.removeEventListener("account-deleted", handleAccountsChange);
      window.removeEventListener("account-created", handleAccountsChange);
      window.removeEventListener("account-updated", handleAccountsChange);
    };
  }, [queryClient, loadAccounts]);

  // Función para refrescar automáticamente la primera cuenta
  const autoRefreshFirstAccount = useCallback(() => {
    if (filteredAccounts.length > 0) {
      const firstAccount = filteredAccounts[0];
      console.log("Auto-refreshing first account:", firstAccount.account.id);
      handleAccountRefresh(firstAccount.account.id);
    }
  }, [filteredAccounts, handleAccountRefresh]);

  // Ejecutar el refresco automático cuando se detecta el parámetro autoRefresh
  useEffect(() => {
    if (shouldAutoRefresh && filteredAccounts.length > 0 && !loading) {
      console.log(
        "Auto-refresh triggered. Accounts available:",
        filteredAccounts.length
      );

      // Pequeño retraso para asegurar que la UI esté lista
      const timer = setTimeout(() => {
        autoRefreshFirstAccount();

        // Limpiar el parámetro autoRefresh de la URL para evitar refrescos repetidos
        // al navegar de vuelta a esta página
        const url = new URL(window.location.href);
        url.searchParams.delete("autoRefresh");
        window.history.replaceState({}, "", url.toString());
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [shouldAutoRefresh, filteredAccounts, loading, autoRefreshFirstAccount]);

  const renderAccounts = () => {
    if (loading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-3 px-3 sm:px-0 w-full max-w-2xl mx-auto"
        >
          {/* Cards de carga con tamaños fijos para evitar saltos */}
          {[1, 2, 3].map((_, index) => (
            <motion.div
              key={`skeleton-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="w-full"
            >
              <Card
                className={`w-full shadow-md ${
                  isMobile
                    ? "h-[160px]" // Mobile: altura fija que coincide con las tarjetas reales
                    : "h-[250px]" // Desktop: altura fija que coincide con las tarjetas reales
                } p-4 relative overflow-hidden bg-white`}
              >
                <CardContent className="flex flex-col h-full p-0">
                  {/* Header */}
                  <div className="flex items-center justify-center p-2 mb-4">
                    <Skeleton className="w-36 h-5 rounded-md" />
                  </div>

                  {/* Centro - balance */}
                  <div className="flex flex-col items-center justify-center flex-grow">
                    <Skeleton className="w-28 h-8 mb-2 rounded-md" />
                    <div className="flex justify-center w-full mt-2">
                      <Skeleton className="w-20 h-2 rounded-md" />
                    </div>
                  </div>

                  {/* Footer - botones */}
                  <div className="flex gap-2 mt-auto px-3">
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-8 w-full rounded-md" />
                  </div>
                </CardContent>

                {/* Efecto de shimmer */}
                <div className="absolute inset-0 w-full h-full">
                  <div className="shimmer-effect"></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      );
    }
    if (filteredAccounts.length === 0) return <NoAccounts />;

    // Mobile: Simple stack layout with compact cards, Desktop: Swiper carousel
    if (isMobile || filteredAccounts.length === 1) {
      return (
        <div className="flex flex-col gap-3 px-3 sm:px-0 w-full max-w-2xl mx-auto">
          {filteredAccounts.map((accountData, index) => (
            <motion.div
              key={accountData.account.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="w-full"
            >
              <AccountCard
                accountId={accountData.account.id}
                refreshAccount={handleAccountRefresh}
                isAccountRefreshing={handleRefreshStatus}
                refreshingAccountId={accountData.account.id}
                openAccount={openAccount}
                isCategorizing={
                  !!pendingCategorization?.[accountData.account.id]
                }
                large={!isMobile} // Mobile: use compact version
                className={`modern-stack-card w-full ${
                  isMobile
                    ? "h-auto min-h-[160px] py-3 px-4" // Mobile: compact
                    : "h-auto min-h-[200px] sm:min-h-[250px]" // Desktop: normal
                }`}
                isActive={true}
                isNewlyConnected={
                  !!lastConnectedId &&
                  accountData.account.plaidId === lastConnectedId
                }
              />
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <SwiperComponents
        accounts={filteredAccounts}
        activeSlideIndex={activeSlideIndex}
        setActiveSlideIndex={setActiveSlideIndex}
        handleCardClick={handleCardClick}
        handleAccountRefresh={handleAccountRefresh}
        isAccountSyncing={handleRefreshStatus}
        pendingCategorization={pendingCategorization}
        openAccount={openAccount}
        lastConnectedId={lastConnectedId}
        forceRefresh={forceRefresh}
      />
    );
  };

  return (
    <div className="relative overflow-y-auto smart-scroll scrollbar-hide no-scroll-page mobile-no-scroll">
      {/* Enhanced Background - Mobile Optimized */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30" />
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-50/40 via-transparent to-cyan-50/30" />

        {/* Floating orbs - Responsive */}
        <div className="absolute top-10 sm:top-20 left-2 sm:left-10 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 sm:bottom-40 right-2 sm:right-20 w-14 sm:w-28 h-14 sm:h-28 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      {/* Contenedor IGUAL QUE SAVINGS */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 lg:px-6 py-6 space-y-6">
          {/* Modern Header Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/5 overflow-hidden"
          >
            {/* Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 via-blue-50/30 to-indigo-50/40" />

            <div
              className={`relative ${isMobile ? "p-3" : "p-4 sm:p-6 lg:p-8"}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                {/* Left side - Title and description */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className={`${
                      isMobile ? "p-2" : "p-2 sm:p-3"
                    } bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg`}
                  >
                    <CreditCard
                      className={`${
                        isMobile ? "w-4 h-4" : "w-5 sm:w-6 h-5 sm:h-6"
                      } text-white`}
                    />
                  </motion.div>

                  <div>
                    <h1
                      className={`${
                        isMobile ? "text-lg" : "text-xl sm:text-2xl lg:text-3xl"
                      } font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent`}
                    >
                      Bank Accounts
                    </h1>
                    <p
                      className={`${
                        isMobile ? "text-xs" : "text-sm sm:text-base"
                      } text-slate-600 mt-1`}
                    >
                      {getAccountsDescription()}
                    </p>
                  </div>
                </div>

                {/* Right side - action only */}
                <div className="flex items-center">
                  <Button
                    onClick={newAccount.onOpen}
                    className={`bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold ${
                      isMobile
                        ? "px-3 py-2 text-xs"
                        : "px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                    } rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <Plus
                      className={`${
                        isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-1 sm:mr-2"
                      }`}
                    />
                    <span className="hidden sm:inline">Add Account</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 w-6 sm:w-12 h-6 sm:h-12 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-xl animate-pulse" />
          </motion.div>

          {error && <ErrorMessage error={error} />}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-full"
          >
            {renderAccounts()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
