import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { IconType } from "react-icons";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Progress } from "@radix-ui/react-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const cardVariants = cva(
  "relative overflow-hidden rounded-2xl backdrop-blur-xl border transition-all duration-500 hover:scale-[1.02] group",
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-br from-slate-50/90 via-white/95 to-blue-50/90",
          "border-slate-200/60 hover:border-blue-300/70",
          "shadow-lg hover:shadow-xl hover:shadow-blue-500/10",
        ],
        success: [
          "bg-gradient-to-br from-emerald-50/90 via-white/95 to-green-50/90",
          "border-emerald-200/60 hover:border-emerald-300/70",
          "shadow-lg hover:shadow-xl hover:shadow-emerald-500/10",
        ],
        danger: [
          "bg-gradient-to-br from-rose-50/90 via-white/95 to-red-50/90",
          "border-rose-200/60 hover:border-rose-300/70",
          "shadow-lg hover:shadow-xl hover:shadow-rose-500/10",
        ],
        warning: [
          "bg-gradient-to-br from-amber-50/90 via-white/95 to-yellow-50/90",
          "border-amber-200/60 hover:border-amber-300/70",
          "shadow-lg hover:shadow-xl hover:shadow-amber-500/10",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconContainerVariants = cva(
  "relative rounded-xl p-3 transition-all duration-300 group-hover:scale-110",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25",
        success:
          "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25",
        danger:
          "bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/25",
        warning:
          "bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const progressVariants = cva("h-2 rounded-full", {
  variants: {
    variant: {
      default: "bg-blue-100",
      success: "bg-emerald-100",
      danger: "bg-rose-100",
      warning: "bg-amber-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type CardVariants = VariantProps<typeof cardVariants>;

interface ModernDataCardProps extends CardVariants {
  icon: IconType;
  title: string;
  value?: number;
  percentageChange?: number;
  currency?: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  delay?: number;
  onClick?: () => void;
  clickable?: boolean;
}

export const ModernDataCard = ({
  icon: Icon,
  title,
  value = 0,
  variant,
  percentageChange = 0,
  currency = "EUR",
  trend,
  subtitle,
  delay = 0,
  onClick,
  clickable = false,
}: ModernDataCardProps) => {
  const getTrendIcon = () => {
    if (trend === "up" || (trend === undefined && percentageChange > 0)) {
      return <TrendingUp className="w-4 h-4" />;
    } else if (
      trend === "down" ||
      (trend === undefined && percentageChange < 0)
    ) {
      return <TrendingDown className="w-4 h-4" />;
    }
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === "up" || (trend === undefined && percentageChange > 0)) {
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    } else if (
      trend === "down" ||
      (trend === undefined && percentageChange < 0)
    ) {
      return "text-rose-600 bg-rose-50 border-rose-200";
    }
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  // Calculate progress value (0-100) based on absolute percentage
  const progressValue = Math.min(Math.abs(percentageChange), 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={cn(
        cardVariants({ variant }),
        (clickable || onClick) && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Floating particles effect */}
      <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute bottom-6 left-6 w-8 h-8 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200" />

      <div className="relative p-6 h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>

          <motion.div
            whileHover={{ rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={cn(iconContainerVariants({ variant }))}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
        </div>

        {/* Value Display */}
        <div className="space-y-4 mb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: delay + 0.2 }}
            className="text-3xl font-bold text-slate-900"
          >
            <CountUp end={value} />
          </motion.div>

          {/* Progress Bar */}
          {percentageChange !== 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Performance</span>
                <span
                  className={cn("font-medium", getTrendColor().split(" ")[0])}
                >
                  {formatPercentage(Math.abs(percentageChange))}
                </span>
              </div>
              <div className={cn(progressVariants({ variant }))}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressValue}%` }}
                  transition={{ duration: 1.5, delay: delay + 0.5 }}
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    variant === "default" &&
                      "bg-gradient-to-r from-blue-400 to-blue-600",
                    variant === "success" &&
                      "bg-gradient-to-r from-emerald-400 to-emerald-600",
                    variant === "danger" &&
                      "bg-gradient-to-r from-rose-400 to-rose-600",
                    variant === "warning" &&
                      "bg-gradient-to-r from-amber-400 to-amber-600"
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Trend Badge */}
        {percentageChange !== 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.7 }}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300",
              getTrendColor()
            )}
          >
            {getTrendIcon()}
            <span>
              {formatPercentage(percentageChange, { addPrefix: true })}
            </span>
            <span className="text-slate-500 ml-1">vs last period</span>
          </motion.div>
        )}

        {percentageChange === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.7 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
          >
            <Minus className="w-4 h-4" />
            <span>No change</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export const ModernDataCardLoading = ({ delay = 0 }: { delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/90 via-white/95 to-blue-50/90 border border-slate-200/60 shadow-lg h-[280px]"
    >
      <div className="p-6 h-full">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-slate-200" />
            <Skeleton className="h-3 w-16 bg-slate-100" />
          </div>
          <Skeleton className="w-12 h-12 rounded-xl bg-slate-200" />
        </div>

        {/* Value skeleton */}
        <div className="space-y-4 mb-6">
          <Skeleton className="h-10 w-32 bg-slate-200" />

          {/* Progress skeleton */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16 bg-slate-100" />
              <Skeleton className="h-3 w-12 bg-slate-100" />
            </div>
            <Skeleton className="h-2 w-full rounded-full bg-slate-200" />
          </div>
        </div>

        {/* Badge skeleton */}
        <Skeleton className="h-7 w-28 rounded-full bg-slate-200" />
      </div>
    </motion.div>
  );
};
