"use client"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
    fetchDebtorById,
    fetchPaymentHistory,
    fetchReports,
    type Debtor,
    type PaymentHistoryData,
    type ReportData
} from "../../service/use-login"

const Reports = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<"messages" | "payments">("messages")

    // Payment History
    const { data: paymentHistory, isLoading: paymentsLoading, error: paymentsError } =
        useQuery<PaymentHistoryData[]>({
            queryKey: ["paymentHistory"],
            queryFn: fetchPaymentHistory,
            enabled: activeTab === "payments",
        })

    // Debtor IDs
    const debtorIds = paymentHistory?.map((debtor) => debtor.debtorId) || []

    // Fetch debtor details
    const { data: debtorsData } = useQuery<Debtor[]>({
        queryKey: ["debtors", debtorIds],
        queryFn: async () => {
            if (debtorIds.length === 0) return []
            const debtorPromises = debtorIds.map((id) => fetchDebtorById(id))
            return Promise.all(debtorPromises)
        },
        enabled: activeTab === "payments" && debtorIds.length > 0,
    })

    const getDebtorPhoneNumber = (debtorId: number): string => {
        const debtor = debtorsData?.find((d) => d.id === debtorId)
        return debtor?.debtroPhoneNumber?.[0]?.number || "+998 91 123 4567"
    }

    // Reports query
    const { data: reports, isLoading: reportsLoading, error: reportsError } =
        useQuery<ReportData[]>({
            queryKey: ["reports"],
            queryFn: fetchReports,
            enabled: activeTab === "messages",
        })

    const handleDebtorClick = (debtorId: number, debtorName: string) => {
        navigate(`/debtorchat/${debtorId}`, { state: { debtorName } })
    }

    const isLoading = activeTab === "messages" ? reportsLoading : paymentsLoading
    const error = activeTab === "messages" ? reportsError : paymentsError

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">Xatolik yuz berdi</div>
            </div>
        )
    }

    // faqat unique debtorlar chiqishi uchun Map ishlatamiz
    const uniqueDebtors = reports
        ? Array.from(new Map(reports.map((r) => [r.debtorId, r])).values())
        : []

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-gray-900">Hisobot</h1>
                    <button
                        className="p-2"
                        onClick={() => navigate("/messageSample")}   // 👈 qo‘shildi
                    >
                        <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                    </button>

                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white px-4 py-3 border-b border-gray-200">
                <div className="flex justify-center">
                    <div className="flex bg-gray-100 rounded-lg p-1 max-w-sm w-full">
                        <button
                            onClick={() => setActiveTab("messages")}
                            className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${activeTab === "messages"
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                                }`}
                        >
                            Xabarlar tarixi
                        </button>
                        <button
                            onClick={() => setActiveTab("payments")}
                            className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${activeTab === "payments"
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                                }`}
                        >
                            To'lovlar tarixi
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-2">
                {activeTab === "messages" && uniqueDebtors.length > 0 ? (
                    uniqueDebtors.map((report) => (
                        <div
                            key={report.id}
                            onClick={() => handleDebtorClick(report.debtorId, report.to.name)}
                            className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100 active:bg-gray-50 cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-gray-900">{report.to.name}</h3>
                                        <span className="text-xs text-gray-500">
                                            {new Date(report.createAt).toLocaleDateString("uz-UZ", {
                                                day: "2-digit",
                                                month: "short",
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{getDebtorPhoneNumber(report.debtorId)}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {!report.sent && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
                                </div>
                            </div>
                        </div>
                    ))
                ) : activeTab === "payments" && paymentHistory && paymentHistory.length > 0 ? (
                    paymentHistory.map((debtor) => (
                        <div key={debtor.debtorId} className="mb-4">
                            {debtor.paymentHistories.map((payment) => (
                                <div
                                    key={payment.paymentId}
                                    className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-gray-900">{debtor.debtorName}</h3>
                                                <span className="text-xs text-gray-500 mr-[10px] mt-[25px]">
                                                    {new Date(payment.paidAt).toLocaleDateString("uz-UZ", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{getDebtorPhoneNumber(debtor.debtorId)}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-gray-900">
                                                -{payment.amountPaid.toLocaleString()}{" "}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <div className="text-gray-500">
                            {activeTab === "messages" ? "Hech qanday xabar topilmadi" : "Hech qanday to'lov tarixi topilmadi"}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Reports
