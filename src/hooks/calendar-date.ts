import { useQuery } from "@tanstack/react-query";
import { fetchMonthTotal } from "../service/use-login";

export const useCalendarData = () => {
    return useQuery({
        queryKey: ["calendarData"],
        queryFn: async () => {
            const monthTotal = await fetchMonthTotal();
            return {
                monthTotal,
            };
        },
        staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
    });
};
