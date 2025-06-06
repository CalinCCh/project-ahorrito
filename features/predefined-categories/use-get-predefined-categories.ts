import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type PredefinedCategory = {
    id: string;
    name: string;
    emoji: string;
    icon?: string;
};

export const useGetPredefinedCategories = () => {
    return useQuery<PredefinedCategory[]>({
        queryKey: ["predefined-categories"],
        queryFn: async () => {
            const { data } = await axios.get("/api/predefined-categories");
            return data.data;
        },
    });
}; 