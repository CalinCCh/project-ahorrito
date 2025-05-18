"use client";

import { useState } from "react";
import { plans } from "@/lib/stripe-plans";
import { PricingCard } from "./PricingCard";

export function PricingTable() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleSubscribe(priceId: string) {
    setLoadingId(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Error starting payment");
      }
    } catch (e) {
      alert("Network or server error");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
      {plans.map((plan) => (
        <PricingCard
          key={plan.priceId}
          name={plan.name}
          description={plan.description}
          price={plan.price}
          priceId={plan.priceId}
          onSubscribe={handleSubscribe}
          isLoading={loadingId === plan.priceId}
        />
      ))}
    </div>
  );
}
