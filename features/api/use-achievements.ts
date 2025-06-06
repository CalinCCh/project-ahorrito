import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import axios from "axios";

// Hook to get all achievements with user progress
export const useGetAchievements = () => {
    return useQuery({
        queryKey: ["achievements"],
        queryFn: async () => {
            const response = await axios.get("/api/achievements");
            return response.data.achievements;
        },
    });
};

// Hook to get user level and XP
export const useGetUserLevel = () => {
    return useQuery({
        queryKey: ["user-level"],
        queryFn: async () => {
            const response = await axios.get("/api/achievements/level");
            return response.data;
        },
    });
};

// Hook to get achievement statistics
export const useGetAchievementStats = () => {
    return useQuery({
        queryKey: ["achievement-stats"],
        queryFn: async () => {
            const response = await axios.get("/api/achievements/stats");
            return response.data;
        },
    });
};

// Hook to check and update achievements
export const useCheckAchievements = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await axios.post("/api/achievements/check", {});
            return response.data;
        }, onSuccess: (data: any) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["achievements"] });
            queryClient.invalidateQueries({ queryKey: ["user-level"] });
            queryClient.invalidateQueries({ queryKey: ["achievement-stats"] });

            // Show notifications for newly completed achievements
            if (data.newlyCompleted && data.newlyCompleted.length > 0) {
                data.newlyCompleted.forEach((achievement: any) => {
                    toast.success(
                        `🏆 Achievement Unlocked: ${achievement.name}!`,
                        {
                            description: `+${achievement.xpReward} XP earned`,
                            duration: 5000,
                        }
                    );
                });
            }

            // Show notifications for newly unlocked achievements
            if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
                data.newlyUnlocked.forEach((achievement: any) => {
                    toast.info(
                        `✨ New Achievement Available: ${achievement.name}`,
                        {
                            description: achievement.description,
                            duration: 4000,
                        }
                    );
                });
            }
        },
        onError: (error) => {
            toast.error("Failed to check achievements");
            console.error("Achievement check error:", error);
        },
    });
};
