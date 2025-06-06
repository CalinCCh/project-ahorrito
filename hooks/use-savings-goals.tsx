import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { InferResponseType, InferRequestType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api)["savings-goals"]["$get"]
>;
type RequestType = InferRequestType<
  (typeof client.api)["savings-goals"]["$post"]
>["json"];

// Get all savings goals
export const useSavingsGoals = () => {
  const query = useQuery<ResponseType, Error>({
    queryKey: ["savings-goals"],
    queryFn: async () => {
      const response = await client.api["savings-goals"].$get();

      if (!response.ok) {
        throw new Error("Error getting savings goals");
      }

      return await response.json();
    },
  });

  return query;
};

// Get specific goal
export const useSavingsGoal = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["savings-goals", { id }],
    queryFn: async () => {
      const response = await client.api["savings-goals"][":id"].$get({
        param: { id: id! },
      });

      if (!response.ok) {
        throw new Error("Error getting savings goal");
      }

      return await response.json();
    },
  });

  return query;
};

// Create new savings goal
export const useCreateSavingsGoal = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    InferResponseType<(typeof client.api)["savings-goals"]["$post"]>,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api["savings-goals"].$post({ json });

      if (!response.ok) {
        throw new Error("Error creating savings goal");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("🎯 Savings goal created successfully");
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
    onError: (error) => {
      toast.error("❌ Error creating savings goal");
      console.error("Error creating savings goal:", error);
    },
  });

  return mutation;
};

// Update savings goal
export const useEditSavingsGoal = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    InferResponseType<(typeof client.api)["savings-goals"][":id"]["$patch"]>,
    Error,
    InferRequestType<
      (typeof client.api)["savings-goals"][":id"]["$patch"]
    >["json"]
  >({
    mutationFn: async (json) => {
      const response = await client.api["savings-goals"][":id"].$patch({
        param: { id: id! },
        json,
      });

      if (!response.ok) {
        throw new Error("Error updating savings goal");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("✏️ Savings goal updated successfully");
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      queryClient.invalidateQueries({ queryKey: ["savings-goals", { id }] });
    },
    onError: (error) => {
      toast.error("❌ Error updating savings goal");
      console.error("Error updating savings goal:", error);
    },
  });

  return mutation;
};

// Delete savings goal
export const useDeleteSavingsGoal = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    InferResponseType<(typeof client.api)["savings-goals"][":id"]["$delete"]>,
    Error
  >({
    mutationFn: async () => {
      const response = await client.api["savings-goals"][":id"].$delete({
        param: { id: id! },
      });

      if (!response.ok) {
        throw new Error("Error deleting savings goal");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("🗑️ Savings goal deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
    onError: (error) => {
      toast.error("❌ Error deleting savings goal");
      console.error("Error deleting savings goal:", error);
    },
  });

  return mutation;
};
