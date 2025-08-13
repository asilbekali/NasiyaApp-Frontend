"use client"

import { useState } from "react"
import { CalendarIcon, Eye, Plus, Wallet, TrendingUp, Users, AlertCircle } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCookies } from "react-cookie"
import {
  fetchAllCustomers,
  fetchingAllDEbtsTotal,
  fetchlateDebtors,
  fetchMonthTotal,
  fetchSeller,
} from "../../service/use-login"
import Calendar from "../../components/Calendar"
import PaymentTopUp from "../../components/PaymentTopUp"
import SellerProfileModal from "../../components/SellerDataModal"

export default function Home() {
  const [showCalendar, setShowCalendar] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [cookies] = useCookies(["token"])
  const token = cookies.token
  const queryClient = useQueryClient()

  const {
    data: sellerData,
    isLoading: isSellerLoading,
    isError: isSellerError,
    error: sellerError,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: () => fetchSeller(token),
    enabled: !!token,
  })

  const {
    data: monthTotal,
    isLoading: isMonthTotalLoading,
    isError: isMonthTotalError,
    error: monthTotalError,
  } = useQuery({
    queryKey: ["monthTotal"],
    queryFn: () => fetchMonthTotal(token),
    enabled: !!token,
  })

  const {
    data: allTotalDebt,
    isLoading: isAllTotalDebtLoading,
    isError: isAllTotalDebtError,
    error: allTotalDebtError,
  } = useQuery({
    queryKey: ["allTotalDebt"],
    queryFn: () => fetchingAllDEbtsTotal(token),
    enabled: !!token,
  })

  const {
    data: lateDebtorsCount,
    isLoading: isLateDebtorsCountLoading,
    isError: isLateDebtorsCountError,
    error: lateDebtorsCountError,
  } = useQuery({
    queryKey: ["lateDebtorsCount"],
    queryFn: () => fetchlateDebtors(token),
    enabled: !!token,
  })

  const {
    data: allDebtorsCount,
    isLoading: isAllDebtorsCountLoading,
    isError: isAllDebtorsCountError,
    error: allDebtorsCountError,
  } = useQuery({
    queryKey: ["allDebtorsCount"],
    queryFn: () => fetchAllCustomers(token),
    enabled: !!token,
  })

  const handleCalendarOpen = () => {
    // Kalendar ochilishidan oldin barcha ma'lumotlarni yangilash
    queryClient.invalidateQueries({ queryKey: ["calendarData"] })
    queryClient.invalidateQueries({ queryKey: ["monthTotal"] })
    queryClient.invalidateQueries({ queryKey: ["allTotalDebt"] })
    queryClient.invalidateQueries({ queryKey: ["lateDebtorsCount"] })
    setShowCalendar(true)
  }

  const handleCalendarClose = () => {
    // Kalendar yopilganda ham ma'lumotlarni yangilash
    queryClient.invalidateQueries({ queryKey: ["monthTotal"] })
    queryClient.invalidateQueries({ queryKey: ["allTotalDebt"] })
    queryClient.invalidateQueries({ queryKey: ["lateDebtorsCount"] })
    queryClient.invalidateQueries({ queryKey: ["allDebtorsCount"] })
    setShowCalendar(false)
  }

  const handlePaymentSuccess = () => {
    // To'lov muvaffaqiyatli bo'lganda barcha ma'lumotlarni yangilash
    queryClient.invalidateQueries({ queryKey: ["seller"] })
    queryClient.invalidateQueries({ queryKey: ["monthTotal"] })
    queryClient.invalidateQueries({ queryKey: ["allTotalDebt"] })
    queryClient.invalidateQueries({ queryKey: ["lateDebtorsCount"] })
    queryClient.invalidateQueries({ queryKey: ["allDebtorsCount"] })
  }

  const handleProfileClick = () => {
    // Modal ochish uchun global event dispatch qilish
    window.dispatchEvent(new CustomEvent("openSellerProfile"))
  }

  // Seller image URL ni to'g'ri formatda qaytarish
  const getSellerImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "/placeholder.svg?height=48&width=48&text=User"

    // Agar to'liq URL bo'lsa
    if (imagePath.startsWith("http")) {
      return imagePath
    }

    // Agar faqat fayl nomi bo'lsa
    return `http://18.159.45.32/multer/${imagePath}`
  }

  if (showCalendar) {
    return <Calendar onBack={handleCalendarClose} />
  }

  if (showPayment) {
    return <PaymentTopUp onBack={() => setShowPayment(false)} onPaymentSuccess={handlePaymentSuccess} />
  }

  if (
    isSellerLoading ||
    isMonthTotalLoading ||
    isAllTotalDebtLoading ||
    isLateDebtorsCountLoading ||
    isAllDebtorsCountLoading
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading dashboard data...</div>
      </div>
    )
  }

  if (isSellerError || isMonthTotalError || isAllTotalDebtError || isLateDebtorsCountError || isAllDebtorsCountError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-red-600 text-lg">
          Error loading data:{" "}
          {sellerError?.message ||
            monthTotalError?.message ||
            allTotalDebtError?.message ||
            lateDebtorsCountError?.message ||
            allDebtorsCountError?.message ||
            "Unknown error"}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <button onClick={handleProfileClick} className="relative group touch-manipulation">
                <img
                  src={getSellerImageUrl(sellerData?.image) || "/placeholder.svg"}
                  alt="User avatar"
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=48&width=48&text=User"
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </button>
              <div>
                <div className="font-bold text-gray-800 text-lg">{sellerData?.name || "Testuchun"}</div>
                <div className="text-sm text-gray-500">Xush kelibsiz!</div>
              </div>
            </div>
            <button
              onClick={handleCalendarOpen}
              className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <CalendarIcon size={22} className="text-blue-600" />
            </button>
          </div>

          {/* Umumiy nasiya */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{allTotalDebt?.toLocaleString("uz-UZ") || "0"} so'm</div>
              <div className="flex items-center justify-center gap-2 text-emerald-100">
                <span className="text-sm font-medium">Umumiy nasiya</span>
                <button className="p-1 rounded-full hover:bg-white/20 transition-colors">
                  <Eye size={16} />
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-1 text-emerald-100 text-xs">
                <TrendingUp size={14} />
                <span>+12% o'sish</span>
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
              <div className="text-2xl font-bold text-red-600">{lateDebtorsCount?.lateDebtorsCount || "0"}</div>
              <div className="text-xs text-gray-500 mt-1">to'lovlar</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div className="text-sm text-gray-600 font-medium">Mijozlar</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{allDebtorsCount || "0"}</div>
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
                  {sellerData?.wallet?.toLocaleString("uz-UZ") || "0"} so'm
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

      {/* Seller Profile Modal */}
      <SellerProfileModal />
    </>
  )
}
