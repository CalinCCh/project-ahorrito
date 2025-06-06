import { useState, useImperativeHandle, forwardRef } from "react";
import {
  Plus,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useSavingsGoals } from "@/hooks/use-savings-goals";
import { useGetSavingsSummary } from "@/features/api/use-get-savings-summary";
import {
  useCreateSavingsGoal,
  useEditSavingsGoal,
  useDeleteSavingsGoal,
} from "@/hooks/use-savings-goals";
import { useCreateContribution } from "@/hooks/use-savings-contributions";
import { SavingsGoalCard } from "./SavingsGoalCard";
import { SavingsGoalForm } from "./SavingsGoalForm";
import { ContributionForm } from "@/components/savings/ContributionForm";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  category: string;
  emoji: string;
  color: string;
  priority: "high" | "medium" | "low";
  targetDate?: Date;
  monthlyContribution?: number;
  status: "active" | "completed" | "paused" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface SavingsDashboardRef {
  openCreateForm: () => void;
}

export const SavingsDashboard = forwardRef<SavingsDashboardRef, { onCreateGoal?: () => void }>(
  ({ onCreateGoal }, ref) => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isContributionFormOpen, setIsContributionFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contributionGoalId, setContributionGoalId] = useState<string>("");

  // Use summary for progress/statistics cards
  const { data: summary, isLoading: isSummaryLoading } = useGetSavingsSummary();

  // Only fetch full goals list for details/cards
  const { data: goalsData, isLoading: isGoalsLoading } = useSavingsGoals();
  const createGoalMutation = useCreateSavingsGoal();
  const editGoalMutation = useEditSavingsGoal(editingGoal?.id);
  const deleteGoalMutation = useDeleteSavingsGoal();
  const createContributionMutation = useCreateContribution();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This action will permanently delete the savings goal and all its contributions."
  );
  const goals = (goalsData as any)?.data || [];
  const activeGoals = goals.filter((goal: any) => goal.status === "active");
  const completedGoals = goals.filter(
    (goal: any) => goal.status === "completed"
  );

  // Use summary data for statistics with fallbacks to always show something
  const totalSaved = (summary as any)?.totalSaved ?? 0;
  const totalTarget = (summary as any)?.totalTarget ?? 0;
  const overallProgress = (summary as any)?.overallProgress ?? 0;
  const displayActiveGoalsCount = (summary as any)?.activeGoalsCount ?? activeGoals.length;
  const displayCompletedGoalsCount = (summary as any)?.completedGoalsCount ?? completedGoals.length;

  // Chart data
  const chartData = goals.map((goal: any) => ({
    name: goal.name,
    saved: goal.currentAmount / 100,
    target: goal.targetAmount / 100,
    progress: (goal.currentAmount / goal.targetAmount) * 100,
  }));

  const pieData = goals.map((goal: any) => ({
    name: goal.name,
    value: goal.currentAmount / 100,
    color: getColorValue(goal.color),
  }));

  function getColorValue(color: string) {
    const colors = {
      blue: "#3b82f6",
      green: "#10b981",
      purple: "#8b5cf6",
      orange: "#f59e0b",
      red: "#ef4444",
      yellow: "#eab308",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  }

  const handleCreateGoal = (values: any) => {
    createGoalMutation.mutate(values, {
      onSuccess: () => {
        setIsCreateFormOpen(false);
      },
    });
  };

  // Call external handler when needed
  const handleOpenCreateForm = () => {
    setIsCreateFormOpen(true);
    onCreateGoal?.();
  };

  useImperativeHandle(ref, () => ({
    openCreateForm: handleOpenCreateForm,
  }));

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsEditFormOpen(true);
  };

  const handleUpdateGoal = (values: any) => {
    editGoalMutation.mutate(values, {
      onSuccess: () => {
        setIsEditFormOpen(false);
        setEditingGoal(null);
      },
    });
  };

  const handleDeleteGoal = async (id: string) => {
    const ok = await confirm();
    if (ok) {
      deleteGoalMutation.mutate(undefined, {
        onSuccess: () => {},
      });
    }
  };

  const handleAddContribution = (goalId: string) => {
    setContributionGoalId(goalId);
    setIsContributionFormOpen(true);
  };

  const handleCreateContribution = (values: any) => {
    createContributionMutation.mutate(values, {
      onSuccess: () => {
        setIsContributionFormOpen(false);
        setContributionGoalId("");
      },
    });
  };
  // Simplificar: siempre mostrar las cards con datos o placeholders, sin estado de loading separado
  return (
    <div className="space-y-6">
      <ConfirmDialog />
      {/* General Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {" "}
        <Card className="relative group border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-green-50/30 to-teal-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Saved
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {totalSaved.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {overallProgress.toFixed(1)}% of total target
            </p>
          </CardContent>
        </Card>
        <Card className="relative group border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-sky-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Target
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {totalTarget.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
            <p className="text-xs text-slate-500 mt-1">Sum of all goals</p>
          </CardContent>
        </Card>
        <Card className="relative group border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-violet-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active Goals
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {displayActiveGoalsCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {displayCompletedGoalsCount} completed
            </p>
          </CardContent>
        </Card>
        <Card className="relative group border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-rose-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Overall Progress
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {overallProgress.toFixed(0)}%
            </div>
            <Progress value={overallProgress} className="mt-2 h-2" />
          </CardContent>{" "}
        </Card>
      </motion.div>
      {/* Charts */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {" "}
          {/* Area Chart - Progress by Goal */}
          <Card className="relative group border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative">
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                Progress by Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      value.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      }),
                      name === "saved" ? "Saved" : "Target",
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(226, 232, 240, 0.8)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stackId="1"
                    stroke="#e5e7eb"
                    fill="#f3f4f6"
                    name="target"
                  />
                  <Area
                    type="monotone"
                    dataKey="saved"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    name="saved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>{" "}
          {/* Pie Chart - Savings Distribution */}
          <Card className="relative group border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative">
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg">
                  <Target className="w-5 h-5 text-indigo-600" />
                </div>
                Savings Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      value.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      }),
                      "Saved",
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(226, 232, 240, 0.8)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}{" "}
      {/* Goals List */}
      {goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="relative border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/10" />
            <CardContent className="relative flex flex-col items-center justify-center py-16">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-2xl mb-6 shadow-lg"
              >
                <Target className="h-12 w-12 text-blue-600" />
              </motion.div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                No savings goals yet
              </h3>
              <p className="text-slate-500 text-center mb-8 max-w-md">
                Create your first savings goal to start achieving your financial
                objectives and build a secure future.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setIsCreateFormOpen(true)}
                  className="bg-gradient-to-r from-blue-500/90 to-purple-600/90 hover:from-blue-600/90 hover:to-purple-700/90 text-white px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm border-0"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Goal
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {goals.map((goal: any, index: number) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
            >
              <SavingsGoalCard
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onAddContribution={handleAddContribution}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
      {/* Formularios */}
      <SavingsGoalForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateGoal}
        isLoading={createGoalMutation.isPending}
      />
      <SavingsGoalForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setEditingGoal(null);
        }}
        onSubmit={handleUpdateGoal}
        initialData={
          editingGoal
            ? {
                name: editingGoal.name,
                description: editingGoal.description,
                targetAmount: editingGoal.targetAmount / 100,
                category: editingGoal.category,
                emoji: editingGoal.emoji,
                color: editingGoal.color,
                priority: editingGoal.priority,
                targetDate: editingGoal.targetDate,
                monthlyContribution: editingGoal.monthlyContribution
                  ? editingGoal.monthlyContribution / 100
                  : 0,
              }
            : undefined
        }
        isLoading={editGoalMutation.isPending}
      />
      <ContributionForm
        isOpen={isContributionFormOpen}
        onClose={() => {
          setIsContributionFormOpen(false);
          setContributionGoalId("");
        }}
        onSubmit={handleCreateContribution}
        goalId={contributionGoalId}
        isLoading={createContributionMutation.isPending}
      />
    </div>
  );
});

SavingsDashboard.displayName = "SavingsDashboard";
