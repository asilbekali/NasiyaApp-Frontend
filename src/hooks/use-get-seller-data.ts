import { useCookies } from "react-cookie";
import { jwtDecode } from "./jwt";
import { useQuery } from "@tanstack/react-query";
import { instance } from "./instance";

interface BorrowedProduct {
    monthPayment: number;
    term: string; // ISO formatdagi sana
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
    paymentDay: string; // ISO format
}

interface MonthTotalData {
    sellerId: number;
    thisMonthDebtorsCount: number;
    thisMonthTotalAmount: number;
    debtors: Debtor[];
    paymentDate: PaymentDate[]; // 🔹 qo‘shildi
}

interface LateCustomersData {
    sellerId: number;
    lateDebtorsCount: number;
    lateDebtors: any[];
}

interface SellerData {
    id: number;
    name: string;
    balance: number;
}

export const useGetSellerData = () => {
    const [cookies] = useCookies(["token"]);
    const token = cookies.token;

    let sellerId: number | null = null;
    if (token) {
        const decodedToken = jwtDecode(token);
        if (decodedToken && decodedToken.id) {
            sellerId = decodedToken.id;
        }
    }

    return useQuery({
        queryKey: ["sellerDashboardData", sellerId],
        queryFn: async () => {
            if (!sellerId) {
                throw new Error("Seller ID not found in token. Please log in.");
            }

            const api = instance();
            const [monthTotalRes, lateCustomersRes, sellerRes] =
                await Promise.all([
                    api.get<MonthTotalData>("/seller/month-total"),
                    api.get<LateCustomersData>("/seller/late-customers"),
                    api.get<SellerData>(`/seller/${sellerId}`),
                ]);

            const filteredMonthTotal: MonthTotalData = {
                ...monthTotalRes.data,
                debtors: monthTotalRes.data.debtors
                    .map((debtor) => ({
                        ...debtor,
                        borrowedProducts:
                            debtor.borrowedProducts?.filter(
                                (bp: BorrowedProduct) => bp.totalAmount > 0
                            ) || [],
                    }))
                    .filter((debtor) => debtor.borrowedProducts.length > 0),
                paymentDate:
                    monthTotalRes.data.paymentDate?.filter(
                        (pd: PaymentDate) => {
                            const debtor = monthTotalRes.data.debtors.find(
                                (d) => d.id === pd.debtorId
                            );
                            return debtor?.borrowedProducts?.some(
                                (bp: BorrowedProduct) => bp.totalAmount > 0
                            );
                        }
                    ) || [],
            };

            return {
                monthTotal: filteredMonthTotal,
                lateCustomers: lateCustomersRes.data,
                seller: sellerRes.data,
            };
        },
        enabled: !!sellerId,
        staleTime: 1000 * 60 * 5,
    });
};
