"use client"

import { ChevronLeft, ChevronRight, ArrowLeft, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { useState, useMemo } from "react"
import { useCalendarData } from "../hooks/calendar-date"

interface PaymentData {
  id: number
  name: string
  amount: string
  date: string
  status: "pending" | "completed" | "overdue"
  paymentKey?: string
}

interface PaymentDate {
  debtorId: number
  paymentDay: string
}

interface BorrowedProduct {
  monthPayment: number
  term: string
  createAt: string
  totalAmount: number
}

interface Debtor {
  id: number
  name: string
  phoneNumbers: string[]
  totalDebt: number
  borrowedProducts: BorrowedProduct[]
}

interface MonthTotal {
  sellerId: number
  thisMonthDebtorsCount: number
  thisMonthTotalAmount: number
  paymentDate: PaymentDate[]
  debtors: Debtor[]
}

const Calendar = ({ onBack }: { onBack: () => void }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState(new Date().getDate())

  const { data, isLoading, isError, error } = useCalendarData()

  const months = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentabr",
    "Oktabr",
    "Noyabr",
    "Dekabr",
  ]
  const daysOfWeek = ["DU", "SE", "CH", "PA", "JU", "SH", "YA"]

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Adjust for Monday start (0=Sunday, 1=Monday, ..., 6=Saturday)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-green-500" />
      case "overdue":
        return <Clock size={16} className="text-red-500" />
      default: // pending
        return <Clock size={16} className="text-orange-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200"
      case "overdue":
        return "bg-red-50 border-red-200"
      default: // pending
        return "bg-orange-50 border-orange-200"
    }
  }

  // Tanlangan sanaga mos to'lovlarni olish - paymentDate dan foydalanish
  const paymentsForSelectedDate: PaymentData[] = useMemo(() => {
    if (!data) return []

    const monthTotal: MonthTotal = data.monthTotal

    // YYYY-MM-DD format - timezone muammosini hal qilish uchun
    const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`

    const payments: PaymentData[] = []

    // paymentDate massividan foydalanish
    monthTotal.paymentDate.forEach((paymentDate, idx) => {
      // paymentDay sanasini YYYY-MM-DD formatga o'tkazamiz - timezone muammosini hal qilish
      const paymentDateObj = new Date(paymentDate.paymentDay)
      const paymentDateStr = `${paymentDateObj.getUTCFullYear()}-${String(paymentDateObj.getUTCMonth() + 1).padStart(2, "0")}-${String(paymentDateObj.getUTCDate()).padStart(2, "0")}`

      // Faqat tanlangan sana uchun
      if (paymentDateStr === selectedDateStr) {
        // Debtorni topish
        const debtor = monthTotal.debtors.find((d) => d.id === paymentDate.debtorId)
        if (debtor) {
          // Bu paymentDay bilan mos keladigan borrowedProduct topish
          const matchedProduct = debtor.borrowedProducts.find((bp) => {
            const termDateObj = new Date(bp.term)
            const termDateStr = `${termDateObj.getUTCFullYear()}-${String(termDateObj.getUTCMonth() + 1).padStart(2, "0")}-${String(termDateObj.getUTCDate()).padStart(2, "0")}`
            return termDateStr === paymentDateStr
          })

          const amount = matchedProduct ? matchedProduct.monthPayment : debtor.totalDebt

          payments.push({
            id: debtor.id,
            name: debtor.name,
            amount: `UZS ${amount.toLocaleString("uz-UZ")}`,
            date: paymentDate.paymentDay,
            status: "pending",
            paymentKey: `${debtor.id}-${paymentDate.paymentDay}-${idx}`,
          })
        }
      }
    })

    return payments
  }, [data, selectedDate, currentMonth, currentYear])

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []

    for (let day = 1; day <= daysInMonth; day++) {
      // YYYY-MM-DD format - timezone muammosini hal qilish
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

      // paymentDate massividan paymentDay sanalarini tekshirish
      const hasPayment =
        data?.monthTotal?.paymentDate.some((paymentDate: PaymentDate) => {
          const paymentDateObj = new Date(paymentDate.paymentDay)
          const paymentDateStr = `${paymentDateObj.getUTCFullYear()}-${String(paymentDateObj.getUTCMonth() + 1).padStart(2, "0")}-${String(paymentDateObj.getUTCDate()).padStart(2, "0")}`
          return paymentDateStr === dateStr
        }) || false

      const isSelected = day === selectedDate
      const isToday =
        day === new Date().getDate() &&
        currentMonth === new Date().getMonth() &&
        currentYear === new Date().getFullYear()

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(day)}
          className={`relative h-14 w-full rounded-2xl flex items-center justify-center text-sm font-semibold transition-all duration-300 ${isSelected
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105"
              : isToday
                ? "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 border-2 border-purple-300"
                : hasPayment
                  ? "bg-gradient-to-br from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200"
                  : "hover:bg-gray-100 text-gray-700 hover:scale-105"
            }`}
        >
          {day}
          {hasPayment && !isSelected && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            </div>
          )}
          {isToday && !isSelected && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></div>
          )}
        </button>,
      )
    }
    return days
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-gray-600 text-lg">Loading calendar data...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-red-600 text-lg">Error loading calendar data: {error?.message || "Unknown error"}</div>
      </div>
    )
  }

  const { monthTotal } = data || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <button
            onClick={onBack}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Kalendar
          </h1>
          <div className="w-12"></div>
        </div>
        <div className="flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {months[currentMonth]}, {currentYear}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:scale-105"
            >
              <ChevronLeft size={22} className="text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth("next")}
              className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:scale-105"
            >
              <ChevronRight size={22} className="text-gray-600" />
            </button>
          </div>
        </div>
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-emerald-100">Oylik jami:</span>
                <div className="text-2xl font-bold">
                  {monthTotal?.thisMonthTotalAmount?.toLocaleString("uz-UZ") || "0"} so'm
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="h-10 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">{day}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>
        </div>
      </div>
      <div className="p-6">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <Clock className="text-white" size={20} />
            </div>
            <h3 className="font-bold text-xl text-gray-800">
              {selectedDate} {months[currentMonth]} kuni to'lovlar
            </h3>
          </div>
          <div className="space-y-4">
            {paymentsForSelectedDate.length > 0 ? (
              paymentsForSelectedDate.map((payment) => (
                <div
                  key={payment.paymentKey}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] ${getStatusColor(payment.status)}`}
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(payment.status)}
                    <div>
                      <div className="font-semibold text-gray-800">{payment.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{payment.amount}</div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${payment.status === "completed"
                        ? "bg-green-200 text-green-800"
                        : payment.status === "overdue"
                          ? "bg-red-200 text-red-800"
                          : "bg-orange-200 text-orange-800"
                      }`}
                  >
                    {payment.status === "completed"
                      ? "Bajarildi"
                      : payment.status === "overdue"
                        ? "Kechikkan"
                        : "Kutilmoqda"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">Bu kunda to'lovlar topilmadi.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar
