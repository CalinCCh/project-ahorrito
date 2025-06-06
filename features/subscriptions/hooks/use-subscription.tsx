"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  plan: string;
  status: "active" | "inactive" | "canceled" | "past_due";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const useSubscription = () => {
  const { user } = useUser();

  const query = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async (): Promise<Subscription | null> => {
      if (!user?.id) return null;
      
      const response = await fetch(`/api/subscriptions/current`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch subscription");
      }
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, 
  });

  const isVip = query.data?.status === "active" && new Date() < new Date(query.data.currentPeriodEnd);
  const daysRemaining = query.data?.currentPeriodEnd 
    ? Math.max(0, Math.ceil((new Date(query.data.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    ...query,
    subscription: query.data,
    isVip,
    daysRemaining,
    isLoading: query.isLoading,
  };
};