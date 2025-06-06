import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Plus,
  Calendar,
  Target,
  TrendingUp,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

interface SavingsGoalCardProps {
  goal: {
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
  };
  onEdit?: (goal: any) => void;
  onDelete?: (id: string) => void;
  onAddContribution?: (goalId: string) => void;
}

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const statusColors = {
  active: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  paused: "bg-orange-100 text-orange-800 border-orange-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const colorClasses = {
  blue: "from-blue-500/20 via-blue-500/10 to-blue-500/5",
  green: "from-green-500/20 via-green-500/10 to-green-500/5",
  purple: "from-purple-500/20 via-purple-500/10 to-purple-500/5",
  orange: "from-orange-500/20 via-orange-500/10 to-orange-500/5",
  red: "from-red-500/20 via-red-500/10 to-red-500/5",
  yellow: "from-yellow-500/20 via-yellow-500/10 to-yellow-500/5",
};

const borderColorClasses = {
  blue: "border-blue-500/30",
  green: "border-green-500/30",
  purple: "border-purple-500/30",
  orange: "border-orange-500/30",
  red: "border-red-500/30",
  yellow: "border-yellow-500/30",
};

export function SavingsGoalCard({
  goal,
  onEdit,
  onDelete,
  onAddContribution,
}: SavingsGoalCardProps) {
  const progress = Math.min(
    (goal.currentAmount / goal.targetAmount) * 100,
    100
  );
  const currentAmountInPesos = goal.currentAmount / 100;
  const targetAmountInPesos = goal.targetAmount / 100;
  const monthlyContributionInPesos = goal.monthlyContribution
    ? goal.monthlyContribution / 100
    : 0;

  const isCompleted = goal.status === "completed";
  const isActive = goal.status === "active";
  // Calculate time remaining
  const timeRemaining = goal.targetDate
    ? formatDistanceToNow(goal.targetDate, { locale: enUS, addSuffix: true })
    : null;
  // Calculate estimated monthly progress
  const remainingAmount = targetAmountInPesos - currentAmountInPesos;
  const monthsToComplete =
    monthlyContributionInPesos > 0
      ? Math.ceil(remainingAmount / monthlyContributionInPesos)
      : null;
  return (
    <Card
      className={`relative group overflow-hidden border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
        borderColorClasses[goal.color as keyof typeof borderColorClasses]
      }`}
    >
      {/* Colored gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          colorClasses[goal.color as keyof typeof colorClasses]
        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">{goal.emoji}</span>
              <span>{goal.name}</span>
            </CardTitle>
            {goal.description && (
              <p className="text-sm text-muted-foreground">
                {goal.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {" "}
            <Badge variant="outline" className={priorityColors[goal.priority]}>
              {goal.priority === "high"
                ? "High"
                : goal.priority === "medium"
                ? "Medium"
                : "Low"}
            </Badge>
            <Badge variant="outline" className={statusColors[goal.status]}>
              {goal.status === "active"
                ? "Active"
                : goal.status === "completed"
                ? "Completed"
                : goal.status === "paused"
                ? "Paused"
                : "Cancelled"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {" "}
                <DropdownMenuItem onClick={() => onEdit?.(goal)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(goal.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {" "}
        {/* Main progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {progress.toFixed(1)}%
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm">
            <span className="font-medium text-green-600">
              {currentAmountInPesos.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </span>
            <span className="text-muted-foreground">
              of{" "}
              {targetAmountInPesos.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </span>
          </div>
        </div>{" "}
        {/* Additional information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {goal.targetDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Target</p>
                <p className="text-muted-foreground">
                  {format(goal.targetDate, "dd MMM yyyy", { locale: enUS })}
                </p>
                {timeRemaining && (
                  <p className="text-xs text-muted-foreground">
                    {timeRemaining}
                  </p>
                )}
              </div>
            </div>
          )}

          {monthlyContributionInPesos > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Monthly</p>
                <p className="text-muted-foreground">
                  {monthlyContributionInPesos.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </p>
                {monthsToComplete && !isCompleted && (
                  <p className="text-xs text-muted-foreground">
                    ~{monthsToComplete} months remaining
                  </p>
                )}
              </div>
            </div>
          )}
        </div>{" "}
        {/* Action button */}
        {isActive && (
          <Button
            onClick={() => onAddContribution?.(goal.id)}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contribution
          </Button>
        )}
        {isCompleted && (
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              🎉 Goal completed!
            </p>
            {goal.completedAt && (
              <p className="text-xs text-green-600">
                {format(goal.completedAt, "dd MMM yyyy", { locale: enUS })}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
