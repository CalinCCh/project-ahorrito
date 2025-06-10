"use client";

import { FaPiggyBank } from "react-icons/fa";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Trophy,
  Calendar,
  PieChart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetSummary } from "@/features/api/use-get-summary";
import { useGetSavingsSummary } from "@/features/api/use-get-savings-summary";
import { useSavingsGoals } from "@/hooks/use-savings-goals";
import {
  ModernDataCard,
  ModernDataCardLoading,
} from "@/components/data-display/ModernDataCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getIconComponent, getIconColor } from "@/lib/icon-mapper";
import { formatCurrency, convertAmountFromMiliunits } from "@/lib/utils";

// Colores para el gráfico de categorías
const CHART_COLORS = [
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#84CC16", // Lime
];

// Currency symbol mapper
const getCurrencySymbol = (currency: string) => {
  switch (currency?.toUpperCase()) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "MXN":
      return "$";
    default:
      return "€";
  }
};

export const DataGrid = () => {
  const { data, isLoading } = useGetSummary();
  const { data: savingsData, isLoading: savingsLoading } =
    useGetSavingsSummary();
  const typedSavingsData = savingsData as any;
  const { data: goalsData, isLoading: goalsLoading } = useSavingsGoals();
  const router = useRouter();

  const handleSavingsClick = () => {
    router.push("/savings");
  };

  // Get next priority goal
  const goals = (goalsData as any)?.data || [];
  const activeGoals = goals.filter((goal: any) => goal.status === "active");
  const nextGoal =
    activeGoals.find((goal: any) => goal.priority === "high") ||
    activeGoals.find((goal: any) => goal.priority === "medium") ||
    activeGoals[0];

  // Calculate some basic stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter(
    (goal: any) => goal.status === "completed"
  ).length;

  // Preparar datos de categorías para el gráfico
  const categoryData =
    data?.categories?.map((category: any, index: number) => ({
      name: category.name,
      value: category.value, // Values are already in the correct format from backend
      color: CHART_COLORS[index % CHART_COLORS.length],
      icon: category.icon || "Hash", // Default icon if none provided
    })) || [];

  // Función para obtener el icono correspondiente a cada categoría
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, string> = {
      Food: "UtensilsCrossed",
      Transport: "Car",
      Shopping: "ShoppingCart",
      Entertainment: "Film",
      Health: "HeartPulse",
      Education: "GraduationCap",
      Home: "Home",
      Technology: "Laptop",
      Groceries: "ShoppingBag",
      Bills: "FileText",
      Clothing: "Shirt",
      Travel: "Plane",
      Electronics: "Smartphone",
      Restaurants: "UtensilsCrossed",
      Gas: "Zap",
      Insurance: "Shield",
      Fitness: "Dumbbell",
      Pets: "PawPrint",
      Beauty: "Scissors",
      Gifts: "Gift",
    };
    return iconMap[categoryName] || "Hash";
  };

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-2 mb-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {/* Balance skeleton mejorado */}
            <div className="animate-pulse p-8 bg-blue-50/50 rounded-xl border border-blue-200/30">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="h-10 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
              <div className="flex items-center justify-center gap-4">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            {/* Income y Expenses skeleton mejorado */}
            <div className="grid grid-cols-2 gap-4">
              <div className="animate-pulse p-6 bg-emerald-50/50 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-lg"></div>
                  <div className="h-3 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-24 mx-auto mb-3"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-3 bg-gray-300 rounded w-20 mx-auto"></div>
                </div>
              </div>
              <div className="animate-pulse p-6 bg-rose-50/50 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-lg"></div>
                  <div className="h-3 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-24 mx-auto mb-3"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-3 bg-gray-300 rounded w-20 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="space-y-2">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="h-8 bg-gray-100 rounded-lg"
                    ></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-2 mb-3">
      {/* Cards de la izquierda más compactas */}
      <div className="lg:col-span-3">
        <div className="space-y-4">
          {/* Available Balance - Simplificado, balance centrado y más grande */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative p-8 bg-gradient-to-br from-blue-50/90 via-white/95 to-indigo-50/90 backdrop-blur-xl rounded-xl border border-blue-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

            <div className="relative text-center">
              {/* Título arriba - mismo estilo que Income/Expenses */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/30">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg font-semibold text-blue-700 uppercase tracking-wide">
                  Available Balance
                </p>
              </div>

              {/* Balance principal - MÁS GRANDE Y CENTRADO */}
              <div className="flex items-center justify-center gap-3 text-5xl font-bold text-blue-700">
                <span>{data?.remainingAmount?.toLocaleString() || "0"}</span>
                <span className="text-4xl font-bold text-blue-600">
                  {getCurrencySymbol(data?.currency || "EUR")}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Income y Expenses - Mismo estilo que Available Balance */}
          <div className="grid grid-cols-2 gap-4">
            {/* Income */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative p-6 bg-gradient-to-br from-teal-50/90 via-white/95 to-green-50/90 backdrop-blur-xl rounded-xl border border-teal-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

              <div className="relative text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-teal-600 to-green-700 rounded-lg shadow-lg shadow-teal-500/30">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-base font-medium text-teal-700 uppercase">
                    Income
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-teal-700 mb-3">
                  <span>{data?.incomeAmount?.toLocaleString() || "0"}</span>
                  <span className="text-xl font-bold text-teal-600">
                    {getCurrencySymbol(data?.currency || "EUR")}
                  </span>
                </div>

                {/* Stats mejoradas con mejor formato */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-1.5 bg-teal-50/50 rounded-lg">
                    <span className="text-xs font-medium text-teal-700">
                      Daily Average
                    </span>
                    <span className="text-sm font-bold text-teal-800">
                      {data?.incomeAmount
                        ? Math.round(data.incomeAmount / 30).toLocaleString()
                        : "0"}
                      {getCurrencySymbol(data?.currency || "EUR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-teal-50/50 rounded-lg">
                    <span className="text-xs font-medium text-teal-700">
                      Weekly Average
                    </span>
                    <span className="text-sm font-bold text-teal-800">
                      {data?.incomeAmount
                        ? Math.round(data.incomeAmount / 4).toLocaleString()
                        : "0"}
                      {getCurrencySymbol(data?.currency || "EUR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-teal-50/50 rounded-lg">
                    <span className="text-xs font-medium text-teal-700">
                      Monthly Total
                    </span>
                    <span className="text-sm font-bold text-teal-800">
                      {data?.incomeAmount
                        ? data.incomeAmount.toLocaleString()
                        : "0"}
                      {getCurrencySymbol(data?.currency || "EUR")}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Expenses */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative p-6 bg-gradient-to-br from-rose-50/90 via-white/95 to-red-50/90 backdrop-blur-xl rounded-xl border border-rose-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 via-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

              <div className="relative text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-rose-500 to-red-600 rounded-lg shadow-lg shadow-rose-500/30">
                    <TrendingDown className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-base font-medium text-rose-700 uppercase">
                    Expenses
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-rose-700 mb-3">
                  <span>
                    -{Math.abs(data?.expensesAmount || 0).toLocaleString()}
                  </span>
                  <span className="text-xl font-bold text-rose-600">
                    {getCurrencySymbol(data?.currency || "EUR")}
                  </span>
                </div>

                {/* Stats mejoradas con mejor formato */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-1.5 bg-rose-50/50 rounded-lg">
                    <span className="text-xs font-medium text-rose-700">
                      Daily Average
                    </span>
                    <span className="text-sm font-bold text-rose-800">
                      -
                      {data?.expensesAmount
                        ? Math.abs(
                            Math.round(data.expensesAmount / 30)
                          ).toLocaleString()
                        : "0"}
                      {getCurrencySymbol(data?.currency || "EUR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-rose-50/50 rounded-lg">
                    <span className="text-xs font-medium text-rose-700">
                      Weekly Average
                    </span>
                    <span className="text-sm font-bold text-rose-800">
                      -
                      {data?.expensesAmount
                        ? Math.abs(
                            Math.round(data.expensesAmount / 4)
                          ).toLocaleString()
                        : "0"}
                      {getCurrencySymbol(data?.currency || "EUR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-rose-50/50 rounded-lg">
                    <span className="text-xs font-medium text-rose-700">
                      Monthly Total
                    </span>
                    <span className="text-sm font-bold text-rose-800">
                      -
                      {data?.expensesAmount
                        ? Math.abs(data.expensesAmount).toLocaleString()
                        : "0"}
                      {getCurrencySymbol(data?.currency || "EUR")}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Category Chart - MÁS ANCHA PARA LAYOUT HORIZONTAL */}
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="h-full min-h-[400px]"
        >
          <Card className="h-full relative overflow-hidden bg-gradient-to-br from-purple-50/90 via-white/95 to-violet-50/90 backdrop-blur-xl border border-purple-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] group rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
            {categoryData && categoryData.length > 0 ? (
              <div className="h-full flex flex-col relative">
                {/* TITULO */}
                <div className="flex-shrink-0 pt-4 px-4 relative">
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-lg shadow-purple-500/30">
                      <PieChart className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xl font-semibold text-purple-700 tracking-wide uppercase">
                      CATEGORY SPENDING
                    </p>
                  </div>
                </div>

                {/* LAYOUT HORIZONTAL en desktop, VERTICAL en móvil */}
                <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 relative">
                  {/* CHART - Centrado en móvil, a la izquierda en desktop */}
                  <div className="w-full lg:w-1/2 flex items-center justify-center mb-4 lg:mb-0">
                    <div className="w-full h-[200px] lg:h-full max-w-[280px] max-h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={110}
                            paddingAngle={4}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1200}
                            animationEasing="ease-in-out"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="#fff"
                                strokeWidth={3}
                                style={{
                                  filter:
                                    "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                                  cursor: "pointer",
                                }}
                                className="hover:brightness-110 transition-all duration-300"
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0];
                                const totalValue = categoryData.reduce(
                                  (sum, cat) => sum + cat.value,
                                  0
                                );
                                const percentage = (
                                  ((data.value as number) / totalValue) *
                                  100
                                ).toFixed(1);
                                const formattedAmount = formatCurrency(
                                  data.value as number,
                                  "EUR"
                                );

                                return (
                                  <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                          backgroundColor: data.payload.color,
                                        }}
                                      />
                                      <span className="font-semibold text-gray-800">
                                        {data.name}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <div>
                                        Amount:{" "}
                                        <span className="font-bold text-red-600">
                                          {formattedAmount}
                                        </span>
                                      </div>
                                      <div>
                                        Percentage:{" "}
                                        <span className="font-bold text-violet-600">
                                          {percentage}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* FILAS (abajo en móvil, a la derecha en desktop) */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-evenly space-y-2">
                    {[...categoryData]
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 5)
                      .map((category, index) => {
                        const totalValue = categoryData.reduce(
                          (sum, cat) => sum + cat.value,
                          0
                        );
                        const percentage = (
                          (category.value / totalValue) *
                          100
                        ).toFixed(1);
                        const formattedAmount = formatCurrency(
                          category.value,
                          data?.currency || "EUR"
                        );

                        return (
                          <div
                            key={category.name}
                            className="flex items-center justify-between p-2.5 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-100/50 hover:bg-white hover:shadow-sm transition-all duration-200"
                          >
                            {/* Category info */}
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div
                                className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-sm font-medium text-gray-800 truncate">
                                {category.name}
                              </span>
                            </div>

                            {/* Amount and percentage */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm font-bold text-red-600 tabular-nums">
                                {formattedAmount.replace("-", "")}
                              </span>
                              <div className="text-sm font-bold text-white bg-violet-600 px-2 py-1 rounded-full min-w-[45px] text-center shadow-sm">
                                {percentage}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 relative">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-violet-50/20 to-indigo-50/30 rounded-xl" />

                {/* Floating elements */}
                <div className="absolute top-4 left-4 w-8 h-8 bg-purple-200/30 rounded-full animate-pulse delay-1000" />
                <div className="absolute top-8 right-6 w-6 h-6 bg-violet-200/40 rounded-full animate-pulse delay-500" />
                <div className="absolute bottom-6 left-8 w-4 h-4 bg-indigo-200/50 rounded-full animate-pulse delay-1500" />
                <div className="absolute bottom-4 right-4 w-10 h-10 bg-purple-100/40 rounded-full animate-pulse" />

                <div className="relative z-10 space-y-4">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <PieChart className="w-8 h-8 text-purple-600" />
                  </div>

                  {/* Text content - solo 2 líneas */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-purple-800">
                      No spending data yet
                    </h3>
                    <p className="text-sm text-purple-600">
                      Add transactions to see category insights
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
