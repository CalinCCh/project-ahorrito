"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useIsMobile } from "@/hooks/use-mobile";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

// Componente para cuando no hay cuentas
const NoAccounts = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/5 relative overflow-hidden mx-3 sm:mx-0"
  >
    {/* Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/60" />

    <div className="relative text-center py-8 sm:py-16 px-4 sm:px-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
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
        transition={{ delay: 0.4 }}
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
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
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
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const isMobile = useIsMobile();

  const { filteredAccounts, loading, error, loadAccounts } = useAccounts();

  const { syncSingleAccount, isAccountSyncing } = useUnifiedSync();

  // Wrapper function to handle account refresh using unified sync
  const handleAccountRefresh = useCallback(
    async (accountId: string) => {
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
      if (slideIndex !== activeSlideIndex && swiperRef.current) {
        swiperRef.current.slideTo(slideIndex);
      }
    },
    [activeSlideIndex]
  );

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    }, 30000);
    return () => clearInterval(refetchInterval);
  }, [queryClient]);

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

  const renderAccounts = () => {
    if (loading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center w-full h-full"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-lg">
            <motion.div
              className="w-8 h-8 mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-full border-3 border-blue-200 border-t-blue-500 rounded-full"></div>
            </motion.div>
          </div>
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
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="w-full"
            >
              <AccountCard
                accountId={accountData.account.id}
                refreshAccount={handleAccountRefresh}
                isAccountRefreshing={isAccountSyncing}
                refreshingAccountId={null}
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
              />
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="perspective-container w-full mx-auto h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                setActiveSlideIndex(swiper.activeIndex);
              }}
              modules={[A11y, EffectCoverflow]}
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView="auto"
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 250,
                modifier: 1,
                slideShadows: false,
              }}
              className="modern-cards-swiper w-full !overflow-visible h-full"
              style={{ paddingTop: "20px", paddingBottom: "20px" }}
              spaceBetween={40}
            >
              {filteredAccounts.map((accountData, index) => (
                <SwiperSlide
                  key={accountData.account.id}
                  className="!w-auto !h-auto flex items-center justify-center swiper-slide-modern"
                  style={{ maxWidth: "600px", minWidth: "320px" }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="transform-gpu transition-all duration-500 ease-out w-full"
                    onClick={() =>
                      handleCardClick(accountData.account.id, index)
                    }
                  >
                    <AccountCard
                      accountId={accountData.account.id}
                      refreshAccount={handleAccountRefresh}
                      isAccountRefreshing={isAccountSyncing}
                      refreshingAccountId={null}
                      openAccount={openAccount}
                      isCategorizing={
                        !!pendingCategorization?.[accountData.account.id]
                      }
                      large={true}
                      className="modern-stack-card w-full sm:w-[500px] h-[250px] sm:h-[300px]"
                      isActive={index === activeSlideIndex}
                    />
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </div>
      </div>
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
        <div className="container mx-auto px-4 lg:px-6 py-6 pt-20 lg:pt-6 flex flex-col h-screen overflow-y-auto scrollbar-hide">
          {/* Modern Header Container - CORREGIDO PARA DESKTOP */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`flex-shrink-0 mb-4 sm:mb-6 ${!isMobile ? "mt-6" : ""}`} // Añadido margin-top para desktop
          >
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/5 overflow-hidden">
              {/* Gradient Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 via-blue-50/30 to-indigo-50/40" />

              <div className={`relative ${isMobile ? "p-3" : "p-4 sm:p-6 lg:p-8"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                  {/* Left side - Title and description */}
                  <div className="flex items-center gap-2 sm:gap-4">
                    <motion.div
                      whileHover={{ rotate: 10 }}
                      className={`${isMobile ? "p-2" : "p-2 sm:p-3"} bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg`}
                    >
                      <CreditCard className={`${isMobile ? "w-4 h-4" : "w-5 sm:w-6 h-5 sm:h-6"} text-white`} />
                    </motion.div>

                    <div>
                      <h1 className={`${isMobile ? "text-lg" : "text-xl sm:text-2xl lg:text-3xl"} font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent`}>
                        Bank Accounts
                      </h1>
                      <p className={`${isMobile ? "text-xs" : "text-sm sm:text-base"} text-slate-600 mt-1`}>
                        {getAccountsDescription()}
                      </p>
                    </div>
                  </div>

                  {/* Right side - action only */}
                  <div className="flex items-center">
                    <Button
                      onClick={newAccount.onOpen}
                      className={`bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold ${
                        isMobile ? "px-3 py-2 text-xs" : "px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                      } rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      <Plus className={`${isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-1 sm:mr-2"}`} />
                      <span className="hidden sm:inline">Add Account</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating Decorative Elements */}
              <div className="absolute top-1 sm:top-2 right-1 sm:right-2 w-6 sm:w-12 h-6 sm:h-12 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-xl animate-pulse" />
            </div>
          </motion.div>

          {error && <ErrorMessage error={error} />}

          <div className="flex items-center justify-center -mx-3 sm:-mx-6 -mt-2 sm:-mt-5 flex-1 max-h-full overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full"
            >
              {renderAccounts()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
