import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { InferResponseType, InferRequestType } from "hono";
import { toast } from "sonner";

type CreateContributionRequestType = InferRequestType<
  (typeof client.api)["savings-contributions"]["$post"]
>["json"];

// Get contributions for a specific goal
export const useSavingsContributions = (goalId?: string) => {
  const query = useQuery({
    enabled: !!goalId,
    queryKey: ["savings-contributions", { goalId }],
    queryFn: async () => {
      const response = await client.api["savings-contributions"]["goal"][
        ":goalId"
      ].$get({
        param: { goalId: goalId! },
      });

      if (!response.ok) {
        throw new Error("Error getting contributions");
      }

      return await response.json();
    },
  });

  return query;
};

// Create new contribution
export const useCreateContribution = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    InferResponseType<(typeof client.api)["savings-contributions"]["$post"]>,
    Error,
    CreateContributionRequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api["savings-contributions"].$post({
        json,
      });

      if (!response.ok) {
        throw new Error("Error creating contribution");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      const contribution = (data as any).data;
      const progress = contribution.newProgress;

      // Specific messages based on progress
      if (progress.goalCompleted) {
        toast.success(
          "🎉 Congratulations! You've completed your savings goal",
          {
            description: "Amazing achievement! Your discipline has paid off.",
            duration: 5000,
          }
        );
      } else if (
        progress.milestonesReached &&
        progress.milestonesReached.length > 0
      ) {
        const milestone = progress.milestonesReached[0];
        toast.success(`${milestone.emoji} Milestone reached!`, {
          description: milestone.rewardMessage,
          duration: 4000,
        });
      } else {
        toast.success("💰 Contribution added successfully", {
          description: `Progress: ${progress.percentage.toFixed(1)}%`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      queryClient.invalidateQueries({ queryKey: ["savings-contributions"] });
    },
    onError: (error) => {
      toast.error("❌ Error adding contribution");
      console.error("Error creating contribution:", error);
    },
  });

  return mutation;
};

// Delete contribution
export const useDeleteContribution = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    InferResponseType<
      (typeof client.api)["savings-contributions"][":id"]["$delete"]
    >,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api["savings-contributions"][":id"].$delete(
        {
          param: { id: id! },
        }
      );

      if (!response.ok) {
        throw new Error("Error deleting contribution");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("🗑️ Contribution deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      queryClient.invalidateQueries({ queryKey: ["savings-contributions"] });
    },
    onError: (error) => {
      toast.error("❌ Error deleting contribution");
      console.error("Error deleting contribution:", error);
    },
  });

  return mutation;
};
