import { useQuery } from "@tanstack/react-query"
import { instance } from "./instance"

interface Debtor {
  id: number
  name: string
  phoneNumbers: string[]
  totalDebt: number
}

interface MonthTotalData {
  sellerId: number
  thisMonthDebtorsCount: number
  thisMonthTotalAmount: number
  debtors: Debtor[]
}

interface LateCustomersData {
  sellerId: number
  lateDebtorsCount: number
  lateDebtors: Debtor[]
}

export const useCalendarData = () => {
  return useQuery({
    queryKey: ["calendarData"],
    queryFn: async () => {
      const api = instance()
      const [monthTotalRes, lateCustomersRes] = await Promise.all([
        api.get<MonthTotalData>("/seller/month-total"),
        api.get<LateCustomersData>("/seller/late-customers"),
      ])

      return {
        monthTotal: monthTotalRes.data,
        lateCustomers: lateCustomersRes.data,
      }
    },
    staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
  })
}
