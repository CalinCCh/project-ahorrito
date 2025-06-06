"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface CurrencyCountUpProps {
  start?: number;
  end: number;
  duration?: number;
  currency?: string;
  preserveValue?: boolean;
}

export const CurrencyCountUp = ({
  start = 0,
  end,
  duration = 1,
  currency = "EUR",
  preserveValue = false,
}: CurrencyCountUpProps) => {
  const [currentValue, setCurrentValue] = useState(preserveValue ? end : start);
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    if (currentValue === end) return;

    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = currentValue;
    const difference = end - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Easing function for smoother animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      const newValue = startValue + difference * easeOutCubic;

      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentValue(end);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]); // Removed currentValue to prevent restart loops

  return <span>{formatCurrency(currentValue, currency)}</span>;
};
