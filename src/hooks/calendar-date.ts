interface BorrowedProduct {
    monthPayment: number;
    createAt: string;
    totalAmount: number;
}

interface Debtor {
    id: number;
    name: string;
    phoneNumbers: string[];
    totalDebt: number;
    borrowedProducts: BorrowedProduct[];
}

interface PaymentDate {
    debtorId: number;
    paymentDay: string;
}

interface MonthTotalData {
    sellerId: number;
    thisMonthDebtorsCount: number;
    thisMonthTotalAmount: number;
    paymentDate: PaymentDate[];
    debtors: Debtor[];
}

interface LateCustomersData {
    sellerId: number;
    lateDebtorsCount: number;
    lateDebtors: Debtor[];
}

interface CalendarData {
    monthTotal: MonthTotalData;
    lateCustomers: LateCustomersData;
}

// interface PaymentData {
//     id: number;
//     name: string;
//     amount: string;
//     date: number; // Tanlangan kun
//     status: "pending" | "completed" | "overdue";
// }

import { useQuery } from "@tanstack/react-query";
import { instance } from "./instance";

export const useCalendarData = () => {
    return useQuery<CalendarData>({
        queryKey: ["calendarData"],
        queryFn: async () => {
            const api = instance();
            const [monthTotalRes, lateCustomersRes] = await Promise.all([
                api.get<MonthTotalData>("/seller/month-total"),
                api.get<LateCustomersData>("/seller/late-customers"),
            ]);

            return {
                monthTotal: monthTotalRes.data,
                lateCustomers: lateCustomersRes.data,
            };
        },
        staleTime: 1000 * 60 * 5,
    });
};
