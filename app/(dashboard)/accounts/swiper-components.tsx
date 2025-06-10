"use client";

import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { AccountCard } from "@/components/data-display/AccountCard";
import { motion } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

interface SwiperComponentsProps {
  accounts: any[];
  activeSlideIndex: number;
  setActiveSlideIndex: (index: number) => void;
  handleCardClick: (accountId: string, slideIndex: number) => void;
  handleAccountRefresh: (accountId: string) => Promise<void>;
  isAccountSyncing: (accountId: string) => boolean;
  pendingCategorization: any;
  openAccount: any;
  lastConnectedId?: string | null;
  forceRefresh?: number | null;
}

export default function SwiperComponents({
  accounts,
  activeSlideIndex,
  setActiveSlideIndex,
  handleCardClick,
  handleAccountRefresh,
  isAccountSyncing,
  pendingCategorization,
  openAccount,
  lastConnectedId,
  forceRefresh,
}: SwiperComponentsProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="perspective-container w-full mx-auto h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
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
            {accounts.map((accountData, index) => (
              <SwiperSlide
                key={accountData.account.id}
                className="!w-auto !h-auto flex items-center justify-center swiper-slide-modern"
                style={{ maxWidth: "600px", minWidth: "320px" }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="transform-gpu transition-all duration-300 ease-out w-full"
                  onClick={() => handleCardClick(accountData.account.id, index)}
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
                    isNewlyConnected={
                      (!!lastConnectedId &&
                        accountData.account.plaidId === lastConnectedId) ||
                      (!!forceRefresh && index === 0)
                    }
                  />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </div>
  );
}
