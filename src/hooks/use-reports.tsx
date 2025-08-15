import { useQuery } from "@tanstack/react-query"
import { fetchReports, type ReportData } from "../service/use-login"
import { instance } from "./instance"

export const useReports = () => {
  return useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useDebtorMessages = (debtorId: string) => {
  return useQuery({
    queryKey: ["debtor-messages", debtorId],
    queryFn: async () => {
      const response = await instance().get(`/sen-message-debtor?debtorId=${debtorId}`)
      return response.data
    },
    enabled: !!debtorId,
  })
}

export type { ReportData }
