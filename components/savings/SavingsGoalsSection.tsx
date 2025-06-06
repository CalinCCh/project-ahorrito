"use client";

import { FaPiggyBank, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { Target, Trophy, Plus, TrendingUp, Calendar, DollarSign, Award, Star, Crown, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetSavingsSummary } from "@/features/api/use-get-savings-summary";
import { useSavingsGoals } from "@/hooks/use-savings-goals";
import { useGetAchievements, useGetUserLevel, useGetAchievementStats } from "@/features/api/use-achievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const SavingsGoalsSection = () => {
  const { data: savingsData, isLoading: savingsLoading } = useGetSavingsSummary();
  const { data: goalsData, isLoading: goalsLoading } = useSavingsGoals();
  const { data: achievementsData, isLoading: achievementsLoading } = useGetAchievements();
  const { data: userLevelData, isLoading: levelLoading } = useGetUserLevel();
  const { data: achievementStatsData, isLoading: statsLoading } = useGetAchievementStats();
  const router = useRouter();

  const typedSavingsData = savingsData as any;
  const goals = (goalsData as any)?.data || [];
  const achievements = achievementsData || [];
  // Use the same structure as in AchievementsDashboard to ensure consistency
  const userLevel = userLevelData || { level: 1, totalXp: 0, progressPercentage: 0, xpProgress: 0, xpForNextLevel: 100 };
  const achievementStats = achievementStatsData || { totalCompleted: 0, totalAchievements: 0 };
  
  // Filter and organize goals
  const activeGoals = goals.filter((goal: any) => goal.status === "active");
  const completedGoals = goals.filter((goal: any) => goal.status === "completed");
  const highPriorityGoals = activeGoals.filter((goal: any) => goal.priority === "high");
  
  // Get next priority goal
  const nextGoal = activeGoals.find((goal: any) => goal.priority === "high") ||
                   activeGoals.find((goal: any) => goal.priority === "medium") ||
                   activeGoals[0];

  // Calculate total savings and progress
  const totalTargetAmount = activeGoals.reduce((sum: number, goal: any) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = activeGoals.reduce((sum: number, goal: any) => sum + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  // Use the same progress calculation as in AchievementsDashboard
  const levelProgress = userLevel.progressPercentage || 0;

  // Filter achievements - using correct database field names
  const completedAchievements = achievements.filter((achievement: any) => achievement.completedAt);
  const nearCompletionAchievements = achievements.filter((achievement: any) => {
    if (!achievement.unlockedAt || achievement.completedAt) return false;
    const progress = achievement.targetValue > 0 ? (achievement.currentValue / achievement.targetValue) * 100 : 0;
    return progress >= 80;
  });
  const recentlyCompleted = completedAchievements
    .filter((achievement: any) => achievement.completedAt)
    .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 3);

  const handleSavingsClick = () => {
    router.push("/savings");
  };

  const handleCreateGoal = () => {
    router.push("/savings?tab=goals&action=create");
  };

  const handleAchievementsClick = () => {
    router.push("/achievements");
  };

  if (goalsLoading || achievementsLoading || levelLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        <div className="animate-pulse">
          <Card className="border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg h-64">
            <CardHeader>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="animate-pulse">
          <Card className="border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg h-64">
            <CardHeader>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
    >
      {/* Enhanced Savings Goals Card with Performance */}
      <Card
        className="relative group border border-slate-200/60 bg-gradient-to-br from-emerald-50/90 via-white/95 to-teal-50/90 backdrop-blur-xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden cursor-pointer hover:scale-[1.02]"
        onClick={handleSavingsClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl">
                <FaPiggyBank className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-700">
                  Savings Goals
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Track & grow your savings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {activeGoals.length} active
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateGoal();
                }}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-3">
          {/* Overall Progress - Compact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Overall Progress</span>
              <span className="font-medium text-slate-700">
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500 [&>div]:rounded-full" />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                ${(totalCurrentAmount / 100).toLocaleString()}
              </span>
              <span>
                ${(totalTargetAmount / 100).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Performance Stats - Compact */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Saved */}
            {typedSavingsData?.totalSaved && (
              <div className="bg-slate-50/50 rounded-lg p-2 space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-slate-600">Total Saved</span>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  ${(typedSavingsData.totalSaved / 100).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">
                  +{(typedSavingsData.savingsGrowth || 0).toFixed(1)}% growth
                </div>
              </div>
            )}

            {/* Monthly Contribution */}
            {typedSavingsData?.monthlyContribution && (
              <div className="bg-slate-50/50 rounded-lg p-2 space-y-1">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-slate-600">Monthly</span>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  ${(typedSavingsData.monthlyContribution / 100).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">
                  Last: {typedSavingsData.lastContributionDate || "Never"}
                </div>
              </div>
            )}
          </div>

          {/* Next Priority Goal - Compact */}
          {nextGoal ? (
            <div className="bg-emerald-50/50 rounded-lg p-2 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{nextGoal.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-700 truncate">
                    {nextGoal.name}
                  </div>
                  <Badge
                    variant={nextGoal.priority === "high" ? "destructive" : "default"}
                    className="text-xs h-4"
                  >
                    {nextGoal.priority}
                  </Badge>
                </div>
                <Target className="h-3 w-3 text-emerald-600" />
              </div>
              
              <div className="space-y-1">
                <Progress
                  value={(nextGoal.currentAmount / nextGoal.targetAmount) * 100}
                  className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-500 [&>div]:rounded-full"
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    ${(nextGoal.currentAmount / 100).toLocaleString()}
                  </span>
                  <span>
                    ${(nextGoal.targetAmount / 100).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <Trophy className="h-4 w-4 text-slate-400 mx-auto mb-1" />
              <div className="text-xs font-medium text-slate-600">
                No active goals
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateGoal();
                }}
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs mt-1"
              >
                Create Goal
              </Button>
            </div>
          )}

          {/* Quick Actions - Compact */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/50">
            <div className="text-center">
              <div className="text-lg font-semibold text-emerald-600">
                {completedGoals.length}
              </div>
              <div className="text-xs text-slate-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-600">
                {highPriorityGoals.length}
              </div>
              <div className="text-xs text-slate-500">Priority</div>
            </div>
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/savings?tab=contributions");
                }}
                className="text-xs p-1 h-auto"
              >
                Add Funds
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Progress Card */}
      <Card
        className="relative group border border-slate-200/60 bg-gradient-to-br from-amber-50/90 via-white/95 to-orange-50/90 backdrop-blur-xl shadow-lg hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden cursor-pointer hover:scale-[1.02]"
        onClick={handleAchievementsClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-700">
                  Achievements
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Your progress & rewards
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                Level {userLevel.level || 1}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-3">
          {/* User Level Progress - Compact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-amber-600" />
                <span className="text-slate-600">Level {userLevel.level || 1}</span>
              </div>
              <span className="font-medium text-slate-700 text-xs">
                {userLevel.totalXp || 0} XP
              </span>
            </div>
            <Progress
              value={Math.min(levelProgress, 100)}
              className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-yellow-500 [&>div]:rounded-full"
            />
            <div className="text-xs text-slate-500 text-center">
              Level {userLevel.level || 1} • Keep earning XP!
            </div>
          </div>

          {/* Achievement Stats Grid - 3 columns with themed background */}
          <div className="bg-orange-50/50 rounded-lg p-3 border border-orange-100">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/70 rounded-lg p-2 space-y-1">
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-slate-600">Completed</span>
                </div>
                <div className="text-lg font-semibold text-amber-600">
                  {completedAchievements.length}
                </div>
                <div className="text-xs text-slate-500">
                  of {achievements.length || 0}
                </div>
              </div>

              <div className="bg-white/70 rounded-lg p-2 space-y-1">
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-slate-600">In Progress</span>
                </div>
                <div className="text-lg font-semibold text-orange-600">
                  {achievements.filter((a: any) => a.unlockedAt && !a.completedAt).length}
                </div>
                <div className="text-xs text-slate-500">
                  active
                </div>
              </div>

              {/* Latest Achievement with name */}
              <div className="bg-white/70 rounded-lg p-2 space-y-1">
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-purple-500" />
                  <span className="text-xs text-slate-600">Latest</span>
                </div>
                {recentlyCompleted.length > 0 ? (
                  <>
                    <div className="text-sm font-semibold text-purple-600 truncate">
                      {recentlyCompleted[0].achievement?.name || 'Achievement'}
                    </div>
                    <div className="text-xs text-slate-500">
                      +{recentlyCompleted[0].achievement?.xpReward || 0} XP
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-semibold text-slate-400">
                      ⭐
                    </div>
                    <div className="text-xs text-slate-500">
                      start earning
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats - Compact */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/50">
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-600">
                {achievements.length > 0 ? Math.round((completedAchievements.length / achievements.length) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-500">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {userLevel.level || 1}
              </div>
              <div className="text-xs text-slate-500">Level</div>
            </div>
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAchievementsClick();
                }}
                className="text-xs p-1 h-auto"
              >
                View All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};