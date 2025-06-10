import { useQuery } from '@tanstack/react-query';
import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from '@/lib/utils';

export const useGetSavingsSummary = () => {
  const query = useQuery({
    queryKey: ['savings-summary'],
    queryFn: async () => {
      const response = await client.api["savings-goals"]["summary"].$get();

      if (!response.ok) {
        throw new Error('Failed to fetch savings summary');
      }

      const { data } = await response.json();

      if (!data) {
        return null;
      }

      return {
        ...data,
        totalSaved: convertAmountFromMiliunits(data.totalSaved || 0),
        totalTarget: convertAmountFromMiliunits(data.totalTarget || 0),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return query;
};
