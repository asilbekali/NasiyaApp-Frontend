'use client';

import { CalendarIcon, Eye, Plus, Wallet, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { jwtDecode } from '../../hooks/jwt';
import { fetchAllCustomers, fetchingAllDEbtsTotal, fetchlateDebtors, fetchMonthTotal, fetchSeller } from '../../service/use-login';
import Calendar from '../../components/Calendar';
import PaymentTopUp from '../../components/PaymentTopUp';




interface MonthlyTotalData {
  sellerId: number;
  thisMonthDebtorsCount: number;
  thisMonthTotalAmount: number;
  debtors: any[];
}

interface LateDebtorsData {
  sellerId: number;
  lateDebtorsCount: number;
  lateDebtors: any[];
}

type allDebtorsCount = number; // Corrected: fetchAllCustomers returns a number directly


type totalDebtPrice = number


export interface Seller {
  id: number;
  name: string;
  password: string;
  phoneNumber: string;
  email: string;
  wallet: number;
  image: string;
  status: boolean;
  role: string;
  createAt: string;
}

const Home = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [cookies] = useCookies(['token']);
  const token = cookies.token;

  let sellerId: number | null = null;
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      sellerId = decodedToken.id; // Assuming 'id' is in the token payload
    } catch (e) {
      console.error("Failed to decode token:", e);
    }
  }



  const { data: seller, isLoading: isLoadingSeller, error: errorSeller } = useQuery<Seller>({
    queryKey: ['seller'],
    queryFn: fetchSeller,
    enabled: !!token
  });






  // Fetch Monthly Total
  const { isLoading: isLoadingMonthTotal, error: errorMonthTotal } = useQuery<MonthlyTotalData>({
    queryKey: ['monthTotal'],
    queryFn: fetchMonthTotal,
    enabled: !!token, // Only fetch if token exists
  });

  const { data: totalDebtData } = useQuery<totalDebtPrice>({
    queryKey: ['allTotalDebt'],
    queryFn: fetchingAllDEbtsTotal,
    enabled: !!token
  });



  // Fetch Late Customers count
  const { data: lateDebtors, isLoading: isLoadinglateDebtors, error: errorlateDebtors } = useQuery<LateDebtorsData>({
    queryKey: ['lateDebtorsCount'],
    queryFn: fetchlateDebtors,
    enabled: !!token, // Only fetch if token exists
  });

  // Fetch All Customers count
  const { data: allCustomersCount, isLoading: isLoadingAllCustomersCount, error: errorAllCustomersCount } = useQuery<allDebtorsCount>({
    queryKey: ['allDebtorsCount'],
    queryFn: fetchAllCustomers,
    enabled: !!token
  });


  if (showCalendar) {
    return <Calendar onBack={() => setShowCalendar(false)} />;
  }

  if (showPayment) {
    return <PaymentTopUp onBack={() => setShowPayment(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={isLoadingSeller ? 'Yuklanmoqda...' : errorSeller ? 'Xato' : `${seller?.image}`}
                alt="User avatar"
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="font-bold text-gray-800 text-lg"> {isLoadingSeller ? 'Yuklanmoqda...' : errorSeller ? 'Xato' : `${seller?.name}`}</div>
              <div className="text-sm text-gray-500">Xush kelibsiz!</div>
            </div>
          </div>
          <button
            onClick={() => setShowCalendar(true)}
            className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <CalendarIcon size={22} className="text-blue-600" />
          </button>
        </div>

        {/* Umumiy nasiya */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {isLoadingMonthTotal ? 'Yuklanmoqda...' : errorMonthTotal ? 'Xato' : `${totalDebtData?.toLocaleString('uz-UZ')} so'm`}
            </div>
            <div className="flex items-center justify-center gap-2 text-emerald-100">
              <span className="text-sm font-medium">Umumiy nasiya</span>
              <button className="p-1 rounded-full hover:bg-white/20 transition-colors">
                <Eye size={16} />
              </button>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-1 text-emerald-100 text-xs">
              <TrendingUp size={14} /><span>+12% o'sish</span>
            </div>
          </div>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div className="text-sm text-gray-600 font-medium">Kechiktirilgan</div>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {isLoadinglateDebtors ? '...' : errorlateDebtors ? 'Xato' : lateDebtors?.lateDebtorsCount || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">to'lovlar</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Users className="text-blue-600" size={20} />
              </div>
              <div className="text-sm text-gray-600 font-medium">Mijozlar</div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {isLoadingAllCustomersCount ? '...' : errorAllCustomersCount ? 'Xato' : allCustomersCount} {/* Corrected: Displaying count directly */}
            </div>
            <div className="text-xs text-gray-500 mt-1">faol mijoz</div>
          </div>
        </div>

        {/* Hamyon */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-xl text-gray-800">Hamyoningiz</h2>
            <div className="p-2 bg-purple-100 rounded-xl">
              <Wallet className="text-purple-600" size={22} />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">Hisobingizda</div>
              <div className="text-2xl font-bold text-gray-800">
                {isLoadingSeller ? 'Yuklanmoqda...' : errorSeller ? 'Xato' : `${seller?.wallet?.toLocaleString('uz-UZ')} so'm`}
              </div>
            </div>
            <button
              onClick={() => setShowPayment(true)}
              className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <Plus size={22} />
            </button>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bu oy uchun to'lov:</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-green-600">To'lov qilingan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <div className="text-center">
              <div className="p-2 bg-blue-100 rounded-xl mx-auto w-fit mb-2">
                <Plus className="text-blue-600" size={18} />
              </div>
              <div className="text-xs font-medium text-gray-700">Yangi</div>
            </div>
          </button>

          <button className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <div className="text-center">
              <div className="p-2 bg-green-100 rounded-xl mx-auto w-fit mb-2">
                <TrendingUp className="text-green-600" size={18} />
              </div>
              <div className="text-xs font-medium text-gray-700">Hisobot</div>
            </div>
          </button>

          <button className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <div className="text-center">
              <div className="p-2 bg-purple-100 rounded-xl mx-auto w-fit mb-2">
                <Users className="text-purple-600" size={18} />
              </div>
              <div className="text-xs font-medium text-gray-700">Mijozlar</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
