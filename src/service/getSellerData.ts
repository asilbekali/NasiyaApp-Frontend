import { useQuery } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { instance } from '../hooks/instance';
import { jwtDecode } from '../hooks/jwt';

interface MonthTotalData {
  sellerId: number;
  thisMonthDebtorsCount: number;
  thisMonthTotalAmount: number;
  debtors: any[];
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
  const [cookies] = useCookies(['token']);
  const token = cookies.token;

  let sellerId: number | null = null;
  if (token) {
    const decodedToken = jwtDecode(token);
    if (decodedToken && decodedToken.id) {
      sellerId = decodedToken.id;
    }
  }

  return useQuery({
    queryKey: ['sellerDashboardData', sellerId],
    queryFn: async () => {
      if (!sellerId) {
        throw new Error("Seller ID not found in token. Please log in.");
      }

      const api = instance();
      const [monthTotalRes, lateCustomersRes, sellerRes] = await Promise.all([
        api.get<MonthTotalData>('/seller/month-total'),
        api.get<LateCustomersData>('/seller/late-customers'),
        api.get<SellerData>(`/seller/${sellerId}`),
      ]);

      return {
        monthTotal: monthTotalRes.data,
        lateCustomers: lateCustomersRes.data,
        seller: sellerRes.data,
      };
    },
    enabled: !!sellerId,
    staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
  });
};
